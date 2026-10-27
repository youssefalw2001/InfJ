import "server-only";

export const RATE_LIMITS = {
  authentication: { limit: 8, windowSeconds: 15 * 60 },
  discussion: { limit: 6, windowSeconds: 60 * 60 },
  reply: { limit: 30, windowSeconds: 60 * 60 },
  message: { limit: 45, windowSeconds: 60 },
  report: { limit: 8, windowSeconds: 60 * 60 },
  upload: { limit: 20, windowSeconds: 60 * 60 },
  search: { limit: 60, windowSeconds: 60 },
} as const;

export type RateLimitAction = keyof typeof RATE_LIMITS;

/**
 * Integration contract for a distributed, atomic production limiter.
 * Implement with a trusted server-only Redis or Postgres adapter. Bucket keys must
 * be keyed hashes of account/IP signals—never raw IP addresses. Deny production
 * writes when the limiter is unavailable; local demo mutations have bounded fields
 * and never leave the browser.
 */
export interface RateLimiter {
  consume(input: { action: RateLimitAction; keyHash: string; cost?: number }): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }>;
}

export class MissingProductionRateLimiter implements RateLimiter {
  async consume(): Promise<never> {
    throw new Error("A distributed rate limiter must be configured before enabling production mutations.");
  }
}
