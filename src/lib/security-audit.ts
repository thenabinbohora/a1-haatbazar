import "server-only";

import { createHmac, randomUUID } from "node:crypto";
import type { Prisma, SecurityEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function auditSecret() {
  // AUTH_SECRET provides independent rotation in production. Existing
  // deployments can safely use the already server-only service credential as
  // an HMAC key until the dedicated secret is configured.
  const secret =
    process.env.AUTH_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || secret.includes("replace-with")) {
    throw new Error("A server security secret is required for audit identifiers.");
  }

  return secret;
}

export function createSecurityEventId() {
  return randomUUID();
}

export function hashSecurityIdentifier(value: string) {
  return createHmac("sha256", auditSecret()).update(value).digest("hex");
}

export async function recordSecurityEvent(input: {
  event: SecurityEventType;
  eventId: string;
  ip?: string | null;
  metadata?: Prisma.InputJsonObject;
  outcome: string;
  requestId?: string | null;
  subjectId?: string | null;
}) {
  try {
    await prisma.securityAuditEvent.create({
      data: {
        event: input.event,
        eventId: input.eventId,
        ipHash:
          input.ip && input.ip !== "unknown"
            ? hashSecurityIdentifier(input.ip)
            : null,
        metadata: input.metadata,
        outcome: input.outcome,
        requestId: input.requestId ?? null,
        subjectHash: input.subjectId
          ? hashSecurityIdentifier(input.subjectId)
          : null,
      },
    });
  } catch {
    // Audit failures must be visible to operators without logging credentials,
    // request payloads, tokens, email addresses, or service configuration.
    console.error("Security audit event could not be persisted.", {
      event: input.event,
      eventId: input.eventId,
      outcome: input.outcome,
    });
  }
}
