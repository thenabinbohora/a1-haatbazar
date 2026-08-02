import "server-only";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashSecurityIdentifier } from "@/lib/security-audit";

type PersistentRateLimitOptions = {
  maxAttempts: number;
  windowMs: number;
};

export async function checkPersistentSecurityRateLimit(
  scope: string,
  identifier: string,
  options: PersistentRateLimitOptions,
) {
  const keyHash = hashSecurityIdentifier(`${scope}:${identifier}`);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "SecurityRateLimit" (
        "keyHash", "attempts", "windowStart", "createdAt", "updatedAt"
      )
      VALUES (${keyHash}, 0, ${now}, ${now}, ${now})
      ON CONFLICT ("keyHash") DO NOTHING
    `);
    const [entry] = await tx.$queryRaw<
      Array<{
        attempts: number;
        blockedUntil: Date | null;
        windowStart: Date;
      }>
    >(Prisma.sql`
      SELECT "attempts", "blockedUntil", "windowStart"
      FROM "SecurityRateLimit"
      WHERE "keyHash" = ${keyHash}
      FOR UPDATE
    `);

    if (!entry) {
      throw new Error("security-rate-limit-unavailable");
    }

    const windowExpired =
      now.getTime() - entry.windowStart.getTime() > options.windowMs;
    const attempts = windowExpired ? 1 : entry.attempts + 1;
    const existingBlockActive = Boolean(
      !windowExpired &&
        entry.blockedUntil &&
        entry.blockedUntil.getTime() > now.getTime(),
    );
    let blockedUntil = windowExpired ? null : entry.blockedUntil;

    if (!existingBlockActive && attempts > options.maxAttempts) {
      const cooldownStep = Math.min(attempts - options.maxAttempts, 4);
      blockedUntil = new Date(
        now.getTime() + 15_000 * 2 ** (cooldownStep - 1),
      );
    }

    await tx.securityRateLimit.update({
      data: {
        attempts,
        blockedUntil,
        updatedAt: now,
        ...(windowExpired ? { windowStart: now } : {}),
      },
      where: { keyHash },
    });

    return existingBlockActive || attempts > options.maxAttempts;
  });
}

export async function clearPersistentSecurityRateLimit(
  scope: string,
  identifier: string,
) {
  const keyHash = hashSecurityIdentifier(`${scope}:${identifier}`);
  await prisma.securityRateLimit.deleteMany({ where: { keyHash } });
}
