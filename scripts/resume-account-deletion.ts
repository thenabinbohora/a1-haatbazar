import { createClient } from "@supabase/supabase-js";
import { Prisma } from "@prisma/client";
import { loadLocalEnv } from "./load-local-env";

loadLocalEnv();

type StorageRow = { bucket_id: string; name: string };

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value || value.includes("replace-with")) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

async function main() {
  const eventId = process.argv[2]?.trim();

  if (!eventId || !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(eventId)) {
    throw new Error(
      "Provide the non-sensitive deletion event ID: npm run account-deletion:retry -- <event-id>",
    );
  }

  const { prisma } = await import("../src/lib/prisma");
  const request = await prisma.accountDeletionRequest.findUnique({
    where: { eventId },
  });

  if (!request) {
    throw new Error("No deletion request exists for that event ID.");
  }

  if (request.status === "COMPLETED") {
    console.log("The deletion request is already complete.");
    await prisma.$disconnect();
    return;
  }

  if (!request.appUserId || !request.supabaseAuthUserId) {
    throw new Error("The pending request is missing its protected retry identifiers.");
  }

  const appUserId = request.appUserId;
  const authUserId = request.supabaseAuthUserId;
  const admin = createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
  const authLookup = await admin.auth.admin.getUserById(authUserId);
  const notificationEmail = authLookup.data.user?.email ?? null;

  try {
    const storageRows = await prisma.$queryRaw<StorageRow[]>(Prisma.sql`
      SELECT bucket_id, name
      FROM storage.objects
      WHERE name IS NOT NULL
        AND (
          owner_id = ${authUserId}
          OR name LIKE ${`${authUserId}/%`}
          OR name LIKE ${`${appUserId}/%`}
        )
      ORDER BY bucket_id, name
    `);
    const byBucket = new Map<string, string[]>();

    for (const row of storageRows) {
      const paths = byBucket.get(row.bucket_id) ?? [];
      paths.push(row.name);
      byBucket.set(row.bucket_id, paths);
    }

    for (const [bucket, paths] of byBucket) {
      for (let index = 0; index < paths.length; index += 100) {
        const { error } = await admin.storage
          .from(bucket)
          .remove(paths.slice(index, index + 100));

        if (error) {
          throw new Error("storage-cleanup-failed");
        }
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        data: {
          addressId: null,
          customerEmail: "retained-order@invalid.a1-haat-bazar.local",
          customerPhone: null,
          notes: null,
          userId: null,
        },
        where: { userId: appUserId },
      });
      await tx.address.deleteMany({ where: { userId: appUserId } });
      await tx.wishlist.deleteMany({ where: { userId: appUserId } });
      await tx.cart.deleteMany({ where: { userId: appUserId } });
      await tx.account.deleteMany({ where: { userId: appUserId } });
      await tx.session.deleteMany({ where: { userId: appUserId } });
      await tx.user.updateMany({
        data: {
          email: `deleted-account-${eventId}@invalid.a1-haat-bazar.local`,
          emailVerified: null,
          image: null,
          name: null,
          passwordHash: null,
          phone: null,
          status: "DELETION_PENDING",
        },
        where: { id: appUserId, role: "CUSTOMER" },
      });
      await tx.accountDeletionRequest.update({
        data: {
          cleanupCompletedAt: new Date(),
          failureStage: null,
          status: "CLEANUP_COMPLETE",
        },
        where: { id: request.id },
      });
    });

    const { error: authDeleteError } = await admin.auth.admin.deleteUser(
      authUserId,
      false,
    );

    if (authDeleteError && authDeleteError.code !== "user_not_found") {
      throw new Error("auth-user-deletion-failed");
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.deleteMany({
        where: {
          id: appUserId,
          role: "CUSTOMER",
          status: "DELETION_PENDING",
        },
      });
      await tx.accountDeletionRequest.update({
        data: {
          appUserId: null,
          completedAt: new Date(),
          failureStage: null,
          status: "COMPLETED",
          subjectHash: null,
          supabaseAuthUserId: null,
        },
        where: { id: request.id },
      });
      await tx.securityAuditEvent.create({
        data: {
          event: "DELETION_COMPLETED",
          eventId,
          outcome: "authorised-retry-succeeded",
          requestId: request.id,
        },
      });
    });

    if (notificationEmail && process.env.SECURITY_EMAIL_WEBHOOK_URL) {
      await fetch(process.env.SECURITY_EMAIL_WEBHOOK_URL, {
        body: JSON.stringify({
          eventId,
          from: "A1 Haat Bazar Security",
          subject: "Your A1 Haat Bazar account was deleted",
          text: "Your A1 Haat Bazar account deletion was completed.\n\nSome transaction records may be retained where legally required.",
          to: notificationEmail,
          type: "account_deleted",
        }),
        headers: {
          "Content-Type": "application/json",
          ...(process.env.SECURITY_EMAIL_WEBHOOK_SECRET
            ? { Authorization: `Bearer ${process.env.SECURITY_EMAIL_WEBHOOK_SECRET}` }
            : {}),
        },
        method: "POST",
      }).catch(() => undefined);
    }

    console.log("The account deletion retry completed successfully.");
  } catch (error) {
    await prisma.accountDeletionRequest.update({
      data: { failureStage: "authorised-retry", status: "FAILED" },
      where: { id: request.id },
    });
    await prisma.securityAuditEvent.create({
      data: {
        event: "DELETION_FAILED",
        eventId,
        metadata: { stage: "authorised-retry" },
        outcome: "retry-failed",
        requestId: request.id,
      },
    });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error &&
      [
        "No deletion request exists for that event ID.",
        "The deletion request is already complete.",
        "The pending request is missing its protected retry identifiers.",
      ].includes(error.message)
      ? error.message
      : "The authorised account deletion retry failed.",
  );
  process.exitCode = 1;
});
