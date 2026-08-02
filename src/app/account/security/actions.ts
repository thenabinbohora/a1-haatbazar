"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  changePasswordInputSchema,
  deleteAccountInputSchema,
  type ChangePasswordResult,
  type DeleteAccountResult,
  type DeletionOtpResult,
  type SecurityFieldErrors,
  validatePasswordChangeFields,
} from "@/lib/account-security";
import {
  clearSessionCookie,
  destroyOtherSessions,
  getCurrentAuthContext,
} from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  getClientIp,
} from "@/lib/rate-limit";
import { verifyServerActionOrigin } from "@/lib/request-security";
import {
  createSecurityEventId,
  hashSecurityIdentifier,
  recordSecurityEvent,
} from "@/lib/security-audit";
import {
  notifySecuritySupport,
  sendSecurityNotification,
} from "@/lib/security-notifications";
import {
  checkPersistentSecurityRateLimit,
  clearPersistentSecurityRateLimit,
} from "@/lib/security-rate-limit";
import {
  createSupabaseAdminClient,
  createSupabaseIdentityVerificationClient,
  clearSupabaseRecoveryCookies,
  getSupabaseAuthIdentity,
} from "@/lib/supabase-auth-server";

const TOO_MANY_ATTEMPTS = "Too many attempts. Wait a moment and try again.";
const SECURITY_UNAVAILABLE =
  "Account security is temporarily unavailable. Try again shortly.";

type VerifiedCustomer = {
  authMethod: "EMAIL_OTP" | "OAUTH" | "PASSWORD" | null;
  email: string;
  id: string;
  sessionId: string;
  supabaseAuthUserId: string;
};

type OwnedStorageObject = {
  bucket_id: string;
  name: string;
};

class DeletionStageError extends Error {
  constructor(readonly stage: string) {
    super("account-deletion-stage-failed");
  }
}

async function isLimited(scope: string, userId: string, ip: string) {
  const [userLimited, networkLimited] = await Promise.all([
    checkPersistentSecurityRateLimit(`${scope}-user`, userId, {
      maxAttempts: 5,
      windowMs: 10 * 60_000,
    }),
    checkPersistentSecurityRateLimit(`${scope}-network`, `${ip}:${userId}`, {
      maxAttempts: 12,
      windowMs: 10 * 60_000,
    }),
  ]);

  return userLimited || networkLimited;
}

async function clearLimits(scope: string, userId: string, ip: string) {
  await Promise.all([
    clearPersistentSecurityRateLimit(`${scope}-user`, userId),
    clearPersistentSecurityRateLimit(`${scope}-network`, `${ip}:${userId}`),
  ]);
}

async function resolveVerifiedCustomer(): Promise<VerifiedCustomer | null> {
  const context = await getCurrentAuthContext();
  const user = context.user;

  if (
    context.status !== "authenticated" ||
    !context.sessionId ||
    !user ||
    user.role !== "CUSTOMER"
  ) {
    return null;
  }

  const identity = await getSupabaseAuthIdentity({
    email: user.email,
    supabaseAuthUserId: user.supabaseAuthUserId,
  });

  if (!identity) {
    return null;
  }

  if (user.supabaseAuthUserId && user.supabaseAuthUserId !== identity.id) {
    return null;
  }

  if (!user.supabaseAuthUserId) {
    const linked = await prisma.user.updateMany({
      data: { supabaseAuthUserId: identity.id },
      where: {
        id: user.id,
        role: "CUSTOMER",
        status: "ACTIVE",
        supabaseAuthUserId: null,
      },
    });

    if (linked.count !== 1) {
      return null;
    }
  }

  return {
    authMethod: user.authMethod,
    email: user.email,
    id: user.id,
    sessionId: context.sessionId,
    supabaseAuthUserId: identity.id,
  };
}

function passwordAuthError(error: { code?: string; status?: number } | null) {
  if (!error) {
    return null;
  }

  if (
    error.code === "invalid_credentials" ||
    error.code === "user_not_found"
  ) {
    return {
      fieldErrors: {
        currentPassword: "The current password was not recognised.",
      },
      message: "The current password was not recognised.",
    };
  }

  if (error.code === "weak_password" || error.code === "same_password") {
    return {
      fieldErrors: {
        newPassword:
          error.code === "same_password"
            ? "Choose a password that is different from your current password."
            : "Choose a stronger password that meets the listed requirements.",
      },
      message:
        error.code === "same_password"
          ? "Choose a different password."
          : "Choose a stronger password that meets the listed requirements.",
    };
  }

  if (
    error.code === "reauthentication_needed" ||
    error.code === "reauthentication_not_valid"
  ) {
    return {
      fieldErrors: {},
      message:
        "For security, verify your identity again before changing your password.",
    };
  }

  if (error.status === 429 || error.code?.includes("rate_limit")) {
    return { fieldErrors: {}, message: TOO_MANY_ATTEMPTS };
  }

  return { fieldErrors: {}, message: SECURITY_UNAVAILABLE };
}

export async function changeCustomerPasswordAction(
  formData: FormData,
): Promise<ChangePasswordResult> {
  if (!(await verifyServerActionOrigin())) {
    return { message: SECURITY_UNAVAILABLE, status: "error" };
  }

  const user = await resolveVerifiedCustomer();

  if (!user) {
    return {
      message: "Your session has expired. Sign in again to continue.",
      status: "unauthenticated",
    };
  }

  if (user.authMethod !== "PASSWORD") {
    return {
      message:
        "This account uses verified provider sign-in. Use password recovery to create a password first.",
      status: "error",
    };
  }

  const rawInput = {
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    revokeOtherSessions: formData.get("revokeOtherSessions") === "on",
  };
  const parsed = changePasswordInputSchema.safeParse(rawInput);
  const fieldErrors = validatePasswordChangeFields(rawInput);

  if (!parsed.success || Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      message: "Check the highlighted fields and try again.",
      status: "error",
    };
  }

  const ip = await getClientIp();

  if (await isLimited("password-change", user.id, ip)) {
    return { message: TOO_MANY_ATTEMPTS, status: "error" };
  }

  const eventId = createSecurityEventId();
  await recordSecurityEvent({
    event: "PASSWORD_CHANGE_STARTED",
    eventId,
    ip,
    outcome: "started",
    subjectId: user.id,
  });

  const verificationClient = createSupabaseIdentityVerificationClient();
  let hasVerificationSession = false;

  try {
    const { data: verification, error: verificationError } =
      await verificationClient.auth.signInWithPassword({
        email: user.email,
        password: parsed.data.currentPassword,
      });

    if (
      verificationError ||
      !verification.user ||
      !verification.session ||
      verification.user.id !== user.supabaseAuthUserId
    ) {
      const mapped = passwordAuthError(verificationError) ?? {
        fieldErrors: {
          currentPassword: "The current password was not recognised.",
        } satisfies SecurityFieldErrors,
        message: "The current password was not recognised.",
      };
      await recordSecurityEvent({
        event: "PASSWORD_CHANGE_FAILED",
        eventId,
        ip,
        outcome: "identity-verification-failed",
        subjectId: user.id,
      });
      return { ...mapped, status: "error" };
    }

    hasVerificationSession = true;
    const nextPasswordHash = await hashPassword(parsed.data.newPassword);
    const { error: updateError } = await verificationClient.auth.updateUser({
      current_password: parsed.data.currentPassword,
      password: parsed.data.newPassword,
    });

    if (updateError) {
      const mapped = passwordAuthError(updateError)!;
      await recordSecurityEvent({
        event: "PASSWORD_CHANGE_FAILED",
        eventId,
        ip,
        outcome: updateError.code ?? "provider-update-failed",
        subjectId: user.id,
      });
      return { ...mapped, status: "error" };
    }

    const localUpdate = await prisma.user.updateMany({
      data: { passwordHash: nextPasswordHash },
      where: {
        id: user.id,
        role: "CUSTOMER",
        status: "ACTIVE",
        supabaseAuthUserId: user.supabaseAuthUserId,
      },
    });

    if (localUpdate.count !== 1) {
      const admin = createSupabaseAdminClient();
      const { error: rollbackError } = await admin.auth.admin.updateUserById(
        user.supabaseAuthUserId,
        { password: parsed.data.currentPassword },
      );
      await recordSecurityEvent({
        event: "PASSWORD_CHANGE_FAILED",
        eventId,
        ip,
        metadata: { rollbackSucceeded: !rollbackError },
        outcome: "application-credential-sync-failed",
        subjectId: user.id,
      });
      return { message: SECURITY_UNAVAILABLE, status: "error" };
    }

    let revocationWarning = false;

    if (parsed.data.revokeOtherSessions) {
      const [{ error: supabaseSignOutError }, localSessions] =
        await Promise.all([
          verificationClient.auth.signOut({ scope: "others" }),
          destroyOtherSessions(user.id, user.sessionId).catch(() => null),
        ]);
      revocationWarning = Boolean(supabaseSignOutError || !localSessions);

      await recordSecurityEvent({
        event: "PASSWORD_SESSIONS_REVOKED",
        eventId,
        ip,
        outcome: revocationWarning ? "partial" : "succeeded",
        subjectId: user.id,
      });
    }

    await recordSecurityEvent({
      event: "PASSWORD_CHANGE_SUCCEEDED",
      eventId,
      ip,
      outcome: "succeeded",
      subjectId: user.id,
    });

    const notification = await sendSecurityNotification({
      email: user.email,
      eventId,
      type: "password_changed",
    });
    await recordSecurityEvent({
      event: notification.delivered
        ? "SECURITY_NOTIFICATION_SENT"
        : "SECURITY_NOTIFICATION_FAILED",
      eventId,
      ip,
      metadata: { channel: "security-email-webhook", reason: notification.reason },
      outcome: notification.delivered ? "delivered" : "not-delivered",
      subjectId: user.id,
    });

    await clearLimits("password-change", user.id, ip);
    return revocationWarning
      ? {
          message:
            "Your password has been updated, but some other sessions may still be active. Use Sign out everywhere to revoke them.",
          status: "warning",
        }
      : {
          message: "Your password has been updated.",
          status: "success",
        };
  } catch {
    await recordSecurityEvent({
      event: "PASSWORD_CHANGE_FAILED",
      eventId,
      ip,
      outcome: "temporary-service-failure",
      subjectId: user.id,
    });
    return { message: SECURITY_UNAVAILABLE, status: "error" };
  } finally {
    if (hasVerificationSession) {
      await verificationClient.auth.signOut({ scope: "local" }).catch(() => undefined);
    }
  }
}

export async function requestAccountDeletionOtpAction(): Promise<DeletionOtpResult> {
  if (!(await verifyServerActionOrigin())) {
    return { message: SECURITY_UNAVAILABLE, status: "error" };
  }

  const user = await resolveVerifiedCustomer();

  if (!user) {
    return {
      message: "Your session has expired. Sign in again to continue.",
      status: "unauthenticated",
    };
  }

  const identity = await getSupabaseAuthIdentity({
    email: user.email,
    supabaseAuthUserId: user.supabaseAuthUserId,
  });

  if (!identity || user.authMethod === "PASSWORD") {
    return { message: SECURITY_UNAVAILABLE, status: "error" };
  }

  const ip = await getClientIp();

  if (await isLimited("deletion-otp", user.id, ip)) {
    return { message: TOO_MANY_ATTEMPTS, status: "error" };
  }

  const supabase = createSupabaseIdentityVerificationClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: { shouldCreateUser: false },
  });

  if (error) {
    return {
      message:
        error.status === 429 || error.code?.includes("rate_limit")
          ? TOO_MANY_ATTEMPTS
          : "A verification code could not be sent. Try again shortly.",
      status: "error",
    };
  }

  return {
    message: "A verification code was sent to your verified email address.",
    status: "sent",
  };
}

async function ownedStorageObjects(user: VerifiedCustomer) {
  return prisma.$queryRaw<OwnedStorageObject[]>(Prisma.sql`
    SELECT bucket_id, name
    FROM storage.objects
    WHERE name IS NOT NULL
      AND (
        owner_id = ${user.supabaseAuthUserId}
        OR name LIKE ${`${user.supabaseAuthUserId}/%`}
        OR name LIKE ${`${user.id}/%`}
      )
    ORDER BY bucket_id, name
  `);
}

async function removeOwnedStorage(user: VerifiedCustomer) {
  const objects = await ownedStorageObjects(user);
  const byBucket = new Map<string, string[]>();

  for (const object of objects) {
    const paths = byBucket.get(object.bucket_id) ?? [];
    paths.push(object.name);
    byBucket.set(object.bucket_id, paths);
  }

  const admin = createSupabaseAdminClient();

  for (const [bucket, paths] of byBucket) {
    for (let index = 0; index < paths.length; index += 100) {
      const { error } = await admin.storage
        .from(bucket)
        .remove(paths.slice(index, index + 100));

      if (error) {
        throw new DeletionStageError("storage-cleanup");
      }
    }
  }

  if ((await ownedStorageObjects(user)).length > 0) {
    throw new DeletionStageError("storage-verification");
  }
}

async function markDeletionPending(input: {
  eventId: string;
  requestId: string;
  user: VerifiedCustomer;
}) {
  const updated = await prisma.$transaction(async (tx) => {
    const userUpdate = await tx.user.updateMany({
      data: { status: "DELETION_PENDING" },
      where: {
        id: input.user.id,
        role: "CUSTOMER",
        status: "ACTIVE",
        supabaseAuthUserId: input.user.supabaseAuthUserId,
      },
    });

    if (userUpdate.count !== 1) {
      throw new DeletionStageError("account-lock");
    }

    await tx.session.deleteMany({ where: { userId: input.user.id } });
    await tx.accountDeletionRequest.update({
      data: {
        appUserId: input.user.id,
        attemptCount: { increment: 1 },
        failureStage: null,
        status: "PENDING",
        supabaseAuthUserId: input.user.supabaseAuthUserId,
      },
      where: { id: input.requestId },
    });

    return userUpdate.count;
  });

  if (updated !== 1) {
    throw new DeletionStageError("account-lock");
  }
}

async function cleanupApplicationData(input: {
  eventId: string;
  requestId: string;
  user: VerifiedCustomer;
}) {
  const anonymisedEmail = `deleted-account-${input.eventId}@invalid.a1-haat-bazar.local`;

  await prisma.$transaction(async (tx) => {
    await tx.order.updateMany({
      data: {
        addressId: null,
        customerEmail: "retained-order@invalid.a1-haat-bazar.local",
        customerPhone: null,
        notes: null,
        userId: null,
      },
      where: { userId: input.user.id },
    });
    await tx.address.deleteMany({ where: { userId: input.user.id } });
    await tx.wishlist.deleteMany({ where: { userId: input.user.id } });
    await tx.cart.deleteMany({ where: { userId: input.user.id } });
    await tx.account.deleteMany({ where: { userId: input.user.id } });
    await tx.user.update({
      data: {
        email: anonymisedEmail,
        emailVerified: null,
        image: null,
        name: null,
        passwordHash: null,
        phone: null,
      },
      where: { id: input.user.id },
    });
    await tx.accountDeletionRequest.update({
      data: {
        cleanupCompletedAt: new Date(),
        failureStage: null,
        status: "CLEANUP_COMPLETE",
      },
      where: { id: input.requestId },
    });
  });
}

async function deletionRequestFor(user: VerifiedCustomer, eventId: string) {
  const subjectHash = hashSecurityIdentifier(user.id);
  const existing = await prisma.accountDeletionRequest.findUnique({
    where: { subjectHash },
  });

  if (existing) {
    return existing;
  }

  return prisma.accountDeletionRequest.create({
    data: {
      appUserId: user.id,
      eventId,
      subjectHash,
      supabaseAuthUserId: user.supabaseAuthUserId,
    },
  });
}

async function failPendingDeletion(input: {
  eventId: string;
  ip: string;
  requestId: string;
  stage: string;
  userId: string;
}) {
  await prisma.accountDeletionRequest
    .update({
      data: { failureStage: input.stage, status: "FAILED" },
      where: { id: input.requestId },
    })
    .catch(() => undefined);
  await recordSecurityEvent({
    event: "DELETION_FAILED",
    eventId: input.eventId,
    ip: input.ip,
    metadata: { stage: input.stage },
    outcome: "completion-pending",
    requestId: input.requestId,
    subjectId: input.userId,
  });
  await notifySecuritySupport({
    eventId: input.eventId,
    stage: input.stage,
  });
}

export async function deleteCustomerAccountAction(
  formData: FormData,
): Promise<DeleteAccountResult> {
  if (!(await verifyServerActionOrigin())) {
    return { message: SECURITY_UNAVAILABLE, status: "error" };
  }

  const user = await resolveVerifiedCustomer();

  if (!user) {
    return {
      message: "Your session has expired. Sign in again to continue.",
      status: "unauthenticated",
    };
  }

  const currentRecord = await prisma.user.findUnique({
    select: { role: true, status: true },
    where: { id: user.id },
  });

  if (
    !currentRecord ||
    currentRecord.role !== "CUSTOMER" ||
    currentRecord.status !== "ACTIVE"
  ) {
    return { message: SECURITY_UNAVAILABLE, status: "error" };
  }

  const ip = await getClientIp();

  if (await isLimited("account-deletion", user.id, ip)) {
    return { message: TOO_MANY_ATTEMPTS, status: "error" };
  }

  const rawInput = {
    acknowledgement: formData.get("acknowledgement") === "on",
    confirmationText: String(formData.get("confirmationText") ?? ""),
    currentPassword: String(formData.get("currentPassword") ?? ""),
    verificationCode: String(formData.get("verificationCode") ?? ""),
  };
  const parsed = deleteAccountInputSchema.safeParse(rawInput);
  const identity = await getSupabaseAuthIdentity({
    email: user.email,
    supabaseAuthUserId: user.supabaseAuthUserId,
  });
  const fieldErrors: SecurityFieldErrors = {};

  if (!parsed.success) {
    return {
      message: "Check the highlighted fields and try again.",
      status: "error",
    };
  }

  if (parsed.data.confirmationText !== "DELETE") {
    fieldErrors.confirmationText = "Type DELETE exactly as shown.";
  }

  if (!parsed.data.acknowledgement) {
    fieldErrors.acknowledgement = "Confirm that you understand this is permanent.";
  }

  const usesPassword = user.authMethod === "PASSWORD";

  if (usesPassword && !parsed.data.currentPassword) {
    fieldErrors.currentPassword = "Enter your current password.";
  }

  if (!usesPassword && !parsed.data.verificationCode) {
    fieldErrors.verificationCode = "Enter the verification code.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      fieldErrors,
      message: "Check the highlighted fields and try again.",
      status: "error",
    };
  }

  if (!identity || identity.id !== user.supabaseAuthUserId) {
    return { message: SECURITY_UNAVAILABLE, status: "error" };
  }

  const verificationClient = createSupabaseIdentityVerificationClient();
  const verification = usesPassword
    ? await verificationClient.auth.signInWithPassword({
        email: user.email,
        password: parsed.data.currentPassword,
      })
    : await verificationClient.auth.verifyOtp({
        email: user.email,
        token: parsed.data.verificationCode,
        type: "email",
      });
  const verifiedUser = verification.data.user;
  const accessToken = verification.data.session?.access_token;

  if (
    verification.error ||
    !verifiedUser ||
    !accessToken ||
    verifiedUser.id !== user.supabaseAuthUserId
  ) {
    const eventId = createSecurityEventId();
    await recordSecurityEvent({
      event: "DELETION_VERIFICATION_FAILED",
      eventId,
      ip,
      outcome: "identity-verification-failed",
      subjectId: user.id,
    });
    return {
      fieldErrors: usesPassword
        ? { currentPassword: "The password was not recognised." }
        : { verificationCode: "The verification code was not recognised." },
      message: usesPassword
        ? "The password was not recognised."
        : "The verification code was not recognised.",
      status: "error",
    };
  }

  const eventId = createSecurityEventId();
  let effectiveEventId: string = eventId;
  let requestId: string | null = null;
  let cleanupStarted = false;
  let stage = "request";

  try {
    const request = await deletionRequestFor(user, eventId);
    effectiveEventId = request.eventId;
    requestId = request.id;
    await recordSecurityEvent({
      event: "DELETION_REQUESTED",
      eventId: request.eventId,
      ip,
      outcome: "verified",
      requestId,
      subjectId: user.id,
    });

    stage = "account-lock";
    await markDeletionPending({ eventId: request.eventId, requestId, user });
    cleanupStarted = true;
    await Promise.all([clearSessionCookie(), clearSupabaseRecoveryCookies()]);

    stage = "storage-cleanup";
    await removeOwnedStorage(user);

    stage = "application-cleanup";
    await cleanupApplicationData({ eventId: request.eventId, requestId, user });
    await recordSecurityEvent({
      event: "DELETION_CLEANUP_COMPLETED",
      eventId: request.eventId,
      ip,
      outcome: "succeeded",
      requestId,
      subjectId: user.id,
    });

    stage = "session-revocation";
    const admin = createSupabaseAdminClient();
    const { error: revokeError } = await admin.auth.admin.signOut(
      accessToken,
      "global",
    );
    await recordSecurityEvent({
      event: "DELETION_SESSIONS_REVOKED",
      eventId: request.eventId,
      ip,
      outcome: revokeError ? "rls-blocked-pending-auth-deletion" : "succeeded",
      requestId,
      subjectId: user.id,
    });

    stage = "auth-user-deletion";
    const { error: authDeleteError } = await admin.auth.admin.deleteUser(
      user.supabaseAuthUserId,
      false,
    );

    if (authDeleteError && authDeleteError.code !== "user_not_found") {
      throw new DeletionStageError(stage);
    }

    await recordSecurityEvent({
      event: "DELETION_AUTH_USER_DELETED",
      eventId: request.eventId,
      ip,
      outcome: "succeeded",
      requestId,
      subjectId: user.id,
    });

    stage = "application-finalisation";
    await prisma.$transaction(async (tx) => {
      const deletedUser = await tx.user.deleteMany({
        where: {
          id: user.id,
          role: "CUSTOMER",
          status: "DELETION_PENDING",
          supabaseAuthUserId: user.supabaseAuthUserId,
        },
      });

      if (deletedUser.count !== 1) {
        throw new DeletionStageError("application-finalisation");
      }
      await tx.accountDeletionRequest.update({
        data: {
          appUserId: null,
          completedAt: new Date(),
          failureStage: null,
          status: "COMPLETED",
          subjectHash: null,
          supabaseAuthUserId: null,
        },
        where: { id: requestId! },
      });
    });

    const notification = await sendSecurityNotification({
      email: user.email,
      eventId: request.eventId,
      type: "account_deleted",
    });
    await recordSecurityEvent({
      event: notification.delivered
        ? "SECURITY_NOTIFICATION_SENT"
        : "SECURITY_NOTIFICATION_FAILED",
      eventId: request.eventId,
      ip,
      metadata: { channel: "security-email-webhook", reason: notification.reason },
      outcome: notification.delivered ? "delivered" : "not-delivered",
      requestId,
    });
    await recordSecurityEvent({
      event: "DELETION_COMPLETED",
      eventId: request.eventId,
      ip,
      outcome: "succeeded",
      requestId,
    });
    revalidatePath("/account", "layout");
    revalidatePath("/wishlist");
    revalidatePath("/checkout");
    await clearLimits("account-deletion", user.id, ip);
    return {
      message: "Your account has been deleted.",
      status: "deleted",
    };
  } catch (error) {
    const failureStage =
      error instanceof DeletionStageError ? error.stage : stage;

    if (cleanupStarted && requestId) {
      await failPendingDeletion({
        eventId: effectiveEventId,
        ip,
        requestId,
        stage: failureStage,
        userId: user.id,
      });
      await Promise.all([clearSessionCookie(), clearSupabaseRecoveryCookies()]);
      return {
        message:
          "Your account is locked and its deletion is being completed. You have been signed out.",
        status: "pending",
      };
    }

    await recordSecurityEvent({
      event: "DELETION_FAILED",
      eventId,
      ip,
      metadata: { stage: failureStage },
      outcome: "no-cleanup-started",
      requestId,
      subjectId: user.id,
    });
    return {
      message:
        "Your account could not be deleted right now. No changes were made. Try again shortly.",
      status: "error",
    };
  } finally {
    await verificationClient.auth.signOut({ scope: "local" }).catch(() => undefined);
  }
}

export async function signOutEverywhereAction(
  formData: FormData,
): Promise<ChangePasswordResult> {
  if (!(await verifyServerActionOrigin())) {
    return { message: SECURITY_UNAVAILABLE, status: "error" };
  }

  const user = await resolveVerifiedCustomer();

  if (!user) {
    return {
      message: "Your session has expired. Sign in again to continue.",
      status: "unauthenticated",
    };
  }

  if (user.authMethod !== "PASSWORD") {
    return {
      message:
        "Sign out on this device, then revoke access through your identity provider.",
      status: "error",
    };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (!currentPassword || currentPassword.length > 128) {
    return {
      fieldErrors: { currentPassword: "Enter your current password." },
      message: "Enter your current password.",
      status: "error",
    };
  }

  const ip = await getClientIp();

  if (await isLimited("session-revocation", user.id, ip)) {
    return { message: TOO_MANY_ATTEMPTS, status: "error" };
  }

  const verificationClient = createSupabaseIdentityVerificationClient();
  const { data, error } = await verificationClient.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (
    error ||
    !data.user ||
    data.user.id !== user.supabaseAuthUserId ||
    !data.session
  ) {
    return {
      fieldErrors: {
        currentPassword: "The current password was not recognised.",
      },
      message: "The current password was not recognised.",
      status: "error",
    };
  }

  const { error: globalSignOutError } = await verificationClient.auth.signOut({
    scope: "global",
  });

  if (globalSignOutError) {
    await verificationClient.auth.signOut({ scope: "local" }).catch(() => undefined);
    return {
      message: "Sessions could not be revoked right now. Try again shortly.",
      status: "error",
    };
  }

  await prisma.session.deleteMany({ where: { userId: user.id } });
  await clearSessionCookie();
  await clearLimits("session-revocation", user.id, ip);

  return {
    message: "You have been signed out everywhere.",
    status: "success",
  };
}
