import { headers } from "next/headers";

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const attempts = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;
const MAX_ENTRIES = 10_000;

function pruneExpired(now: number) {
  if (attempts.size < MAX_ENTRIES) {
    return;
  }

  for (const [key, entry] of attempts) {
    if (now - entry.windowStart > WINDOW_MS) {
      attempts.delete(key);
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
export function isRateLimited(scope: string, identifier: string) {
  const key = `${scope}:${identifier}`;
  const now = Date.now();
  pruneExpired(now);

  const entry = attempts.get(key);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}
