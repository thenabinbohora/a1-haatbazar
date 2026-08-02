import { createHmac } from "node:crypto";

export type AdminAuthEvent =
  | "access_denied"
  | "login_failed"
  | "login_rate_limited"
  | "login_succeeded"
  | "logout"
  | "session_revoked"
  | "session_rotated";

type AdminAuthAuditInput = {
  account?: string | null;
  event: AdminAuthEvent;
  network?: string | null;
  reason?: "credentials" | "inactive" | "role" | "validation";
  userId?: string | null;
};

function pseudonym(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const key = process.env.AUTH_SECRET ?? "a1-admin-auth-audit";
  return createHmac("sha256", key).update(value).digest("hex").slice(0, 20);
}

/**
 * Emits privacy-minimised structured security events for the deployment log drain.
 * Passwords, session values, entered email addresses, and raw IP addresses are excluded.
 */
export function recordAdminAuthEvent(input: AdminAuthAuditInput) {
  console.info("[admin-auth]", JSON.stringify({
    accountRef: pseudonym(input.account?.trim().toLowerCase()),
    event: input.event,
    networkRef: pseudonym(input.network),
    occurredAt: new Date().toISOString(),
    reason: input.reason,
    userRef: pseudonym(input.userId),
  }));
}
