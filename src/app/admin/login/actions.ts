"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { AdminAuthActionState } from "@/lib/admin-auth-state";
import { recordAdminAuthEvent } from "@/lib/admin-auth-audit";
import { safeAdminReturnPath } from "@/lib/admin-return-path";
import {
  createSession,
  destroySession,
  getCurrentUser,
} from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  clearRateLimit,
  getClientIp,
} from "@/lib/rate-limit";

const adminLoginSchema = z.object({
  email: z.string().trim().email().max(180).transform((value) => value.toLowerCase()),
  next: z.string().trim().optional(),
  password: z.string().min(1).max(256),
});

function errorState(
  previousState: AdminAuthActionState,
  message: string,
  options: Omit<AdminAuthActionState, "attempt" | "message" | "status"> = {},
): AdminAuthActionState {
  return {
    ...options,
    attempt: previousState.attempt + 1,
    message,
    status: "error",
  };
}

export async function loginAdminAction(
  previousState: AdminAuthActionState,
  formData: FormData,
): Promise<AdminAuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const parsed = adminLoginSchema.safeParse({
    email,
    next: String(formData.get("next") ?? ""),
    password,
  });

  if (!parsed.success) {
    const fieldErrors: AdminAuthActionState["fieldErrors"] = {};

    if (!email || parsed.error.issues.some((issue) => issue.path[0] === "email")) {
      fieldErrors.email = email
        ? "Enter a valid email address."
        : "Enter your email address.";
    }

    if (
      !password
      || parsed.error.issues.some((issue) => issue.path[0] === "password")
    ) {
      fieldErrors.password = password
        ? "Enter a valid password."
        : "Enter your password.";
    }

    recordAdminAuthEvent({
      account: email,
      event: "login_failed",
      reason: "validation",
    });

    return errorState(
      previousState,
      "Check the highlighted fields and try again.",
      {
        fieldErrors,
        values: { email },
      },
    );
  }

  const clientIp = await getClientIp();
  const accountRateLimit = checkRateLimit(
    "admin-login-account",
    parsed.data.email,
    { maxAttempts: 5, windowMs: 60_000 },
  );
  const networkRateLimit = checkRateLimit(
    "admin-login-network",
    clientIp,
    { maxAttempts: 20, windowMs: 60_000 },
  );

  if (accountRateLimit.limited || networkRateLimit.limited) {
    recordAdminAuthEvent({
      account: parsed.data.email,
      event: "login_rate_limited",
      network: clientIp,
    });

    return errorState(
      previousState,
      "Too many sign-in attempts. Wait a moment and try again.",
      { values: { email: parsed.data.email } },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: parsed.data.email,
      },
      select: {
        id: true,
        passwordHash: true,
        role: true,
        status: true,
      },
    });
    const isValidPassword = await verifyPassword(
      parsed.data.password,
      user?.passwordHash,
    );
    if (
      !user
      || !isValidPassword
      || user.status !== "ACTIVE"
      || user.role !== "ADMIN"
    ) {
      recordAdminAuthEvent({
        account: parsed.data.email,
        event:
          user && isValidPassword && user.role !== "ADMIN"
            ? "access_denied"
            : "login_failed",
        network: clientIp,
        reason:
          user && isValidPassword && user.role !== "ADMIN"
            ? "role"
            : user && isValidPassword && user.status !== "ACTIVE"
              ? "inactive"
              : "credentials",
        userId: user?.id,
      });

      return errorState(
        previousState,
        "The email or password was not recognised.",
        { values: { email: parsed.data.email } },
      );
    }

    await createSession(user.id, { administrator: true });
    clearRateLimit("admin-login-account", parsed.data.email);

    recordAdminAuthEvent({
      account: parsed.data.email,
      event: "login_succeeded",
      network: clientIp,
      userId: user.id,
    });
    recordAdminAuthEvent({
      event: "session_rotated",
      network: clientIp,
      userId: user.id,
    });
  } catch {
    return errorState(
      previousState,
      "Admin sign-in is temporarily unavailable. Please try again shortly.",
      { values: { email: parsed.data.email } },
    );
  }

  redirect(safeAdminReturnPath(parsed.data.next));
}

export async function logoutAction() {
  const [user, clientIp] = await Promise.all([
    getCurrentUser(),
    getClientIp(),
  ]);

  await destroySession();
  recordAdminAuthEvent({
    event: "logout",
    network: clientIp,
    userId: user?.id,
  });
  redirect("/admin/login");
}
