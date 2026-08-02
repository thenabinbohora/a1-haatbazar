import { headers } from "next/headers";

type RateLimitEntry = {
  count: number;
  blockedUntil: number;
  windowStart: number;
};

const attempts = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;
const MAX_ENTRIES = 10_000;

type RateLimitOptions = {
  maxAttempts?: number;
  windowMs?: number;
};

function pruneExpired(now: number) {
  if (attempts.size < MAX_ENTRIES) {
    return;
  }

  for (const [key, entry] of attempts) {
    if (now - entry.windowStart > WINDOW_MS) {
      attempts.delete(key);
    }
  }

  if (attempts.size >= MAX_ENTRIES) {
    const oldestKey = attempts.keys().next().value;

    if (oldestKey) {
      attempts.delete(oldestKey);
    }
  }
}

export async function getClientIp() {
  const headerStore = await headers();
  const forwardedFor = headerStore.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }

  return headerStore.get("x-real-ip") ?? "unknown";
}

/**
 * In-memory sliding-window limiter, per server instance. A shared store
 * (e.g. Redis/Upstash) is required for multi-instance deployments.
 */
export function checkRateLimit(
  scope: string,
  identifier: string,
  options: RateLimitOptions = {},
) {
  const key = `${scope}:${identifier}`;
  const now = Date.now();
  const maxAttempts = options.maxAttempts ?? MAX_ATTEMPTS;
  const windowMs = options.windowMs ?? WINDOW_MS;
  pruneExpired(now);

  const entry = attempts.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    attempts.set(key, { blockedUntil: 0, count: 1, windowStart: now });
    return {
      limited: false,
      retryAfterSeconds: 0,
    };
  }

  entry.count += 1;

  if (entry.blockedUntil > now) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.blockedUntil - now) / 1000)),
    };
  }

  if (entry.count > maxAttempts) {
    const cooldownStep = Math.min(entry.count - maxAttempts, 4);
    const cooldownMs = 15_000 * 2 ** (cooldownStep - 1);
    entry.blockedUntil = now + cooldownMs;

    return {
      limited: true,
      retryAfterSeconds: Math.ceil(cooldownMs / 1000),
    };
  }

  return {
    limited: false,
    retryAfterSeconds: 0,
  };
}

export function clearRateLimit(scope: string, identifier: string) {
  attempts.delete(`${scope}:${identifier}`);
}

export function isRateLimited(scope: string, identifier: string) {
  return checkRateLimit(scope, identifier).limited;
}
