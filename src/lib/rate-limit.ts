/**
 * Simple sliding-window rate limiter.
 *
 * This in-memory implementation is fine for a single-instance deployment
 * or for local development. Because serverless functions can run on
 * multiple instances, swap `store` for Upstash Redis (`@upstash/ratelimit`)
 * before relying on this in a multi-instance production deployment — the
 * function signature below is designed to make that a drop-in change.
 */

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { success: false, limit, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return {
    success: true,
    limit,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt,
  };
}

/** Named presets so every route applies a consistent, deliberate limit. */
export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 60_000 },
  signup: { limit: 3, windowMs: 60_000 },
  passwordReset: { limit: 3, windowMs: 60_000 },
  aiGeneration: { limit: 10, windowMs: 60_000 },
  prospectSearch: { limit: 20, windowMs: 60_000 },
  leadWrite: { limit: 30, windowMs: 60_000 },
  default: { limit: 60, windowMs: 60_000 },
} as const;

/** Builds a rate-limit key scoped to a user (or IP for anonymous routes) and an action. */
export function rateLimitKey(actorId: string, action: string) {
  return `${action}:${actorId}`;
}
