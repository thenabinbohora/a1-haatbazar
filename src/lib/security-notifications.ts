import "server-only";

type SecurityNotificationType = "account_deleted" | "password_changed";

const CONTENT: Record<
  SecurityNotificationType,
  { body: string; subject: string }
> = {
  account_deleted: {
    body: [
      "Your A1 Haat Bazar account deletion was completed.",
      "Some transaction records may be retained where legally required.",
    ].join("\n\n"),
    subject: "Your A1 Haat Bazar account was deleted",
  },
  password_changed: {
    body: [
      "Your A1 Haat Bazar password was changed.",
      "If you did not make this change, reset your password and contact the store immediately.",
    ].join("\n\n"),
    subject: "Your A1 Haat Bazar password was changed",
  },
};

/**
 * Sends a minimal provider-neutral payload to a server-side email webhook.
 * No password, token, address, payment data, or profile fields are included.
 */
export async function sendSecurityNotification(input: {
  email: string;
  eventId: string;
  type: SecurityNotificationType;
}) {
  const endpoint = process.env.SECURITY_EMAIL_WEBHOOK_URL?.trim();

  if (!endpoint) {
    return { delivered: false, reason: "not-configured" as const };
  }

  const parsedEndpoint = new URL(endpoint);

  if (
    parsedEndpoint.protocol !== "https:" &&
    !(process.env.NODE_ENV !== "production" && parsedEndpoint.hostname === "localhost")
  ) {
    return { delivered: false, reason: "invalid-endpoint" as const };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const response = await fetch(parsedEndpoint, {
      body: JSON.stringify({
        eventId: input.eventId,
        from: "A1 Haat Bazar Security",
        replyTo: process.env.SECURITY_EMAIL_REPLY_TO,
        text: CONTENT[input.type].body,
        subject: CONTENT[input.type].subject,
        to: input.email,
        type: input.type,
      }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SECURITY_EMAIL_WEBHOOK_SECRET
          ? {
              Authorization: `Bearer ${process.env.SECURITY_EMAIL_WEBHOOK_SECRET}`,
            }
          : {}),
      },
      method: "POST",
      signal: controller.signal,
    });

    return response.ok
      ? { delivered: true, reason: "delivered" as const }
      : { delivered: false, reason: "provider-failed" as const };
  } catch {
    return { delivered: false, reason: "provider-failed" as const };
  } finally {
    clearTimeout(timeout);
  }
}

export async function notifySecuritySupport(input: {
  eventId: string;
  stage: string;
}) {
  const endpoint = process.env.SECURITY_SUPPORT_WEBHOOK_URL?.trim();

  if (!endpoint) {
    return false;
  }

  try {
    const url = new URL(endpoint);

    if (
      url.protocol !== "https:" &&
      !(process.env.NODE_ENV !== "production" && url.hostname === "localhost")
    ) {
      return false;
    }

    const response = await fetch(url, {
      body: JSON.stringify({
        eventId: input.eventId,
        message: "An account deletion requires an authorised retry.",
        stage: input.stage,
        type: "account_deletion_pending",
      }),
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.SECURITY_SUPPORT_WEBHOOK_SECRET
          ? { Authorization: `Bearer ${process.env.SECURITY_SUPPORT_WEBHOOK_SECRET}` }
          : {}),
      },
      method: "POST",
    });

    return response.ok;
  } catch {
    return false;
  }
}
