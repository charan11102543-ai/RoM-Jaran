/**
 * Rate-limiter abstraction.
 *
 * Swap backends by changing RATE_LIMIT_BACKEND env var (or programmatically):
 *   "memory"  — in-process Map. Default. Resets on cold start; not shared across workers.
 *   "redis"   — requires REDIS_URL env var. Use this for multi-instance deployments.
 *
 * The interface is intentionally minimal so switching backends is a one-line change.
 */

export interface RateLimitResult {
  limited: boolean;
  remaining: number; // requests left in this window (-1 if unknown)
  resetInMs: number; // ms until window resets (-1 if unknown)
}

export interface RateLimiterBackend {
  check(key: string, maxRequests: number, windowMs: number): Promise<RateLimitResult>;
}

// ── In-memory backend ──────────────────────────────────────────────────────────

interface WindowEntry { count: number; windowStart: number }
const memStore = new Map<string, WindowEntry>();
let lastMemCleanup = Date.now();

function memCleanup(now: number, windowMs: number) {
  if (now - lastMemCleanup < 5 * 60_000) return;
  lastMemCleanup = now;
  for (const [key, entry] of memStore) {
    if (now - entry.windowStart > windowMs) memStore.delete(key);
  }
}

const memoryBackend: RateLimiterBackend = {
  async check(key, maxRequests, windowMs) {
    const now = Date.now();
    memCleanup(now, windowMs);

    const entry = memStore.get(key);
    if (!entry || now - entry.windowStart > windowMs) {
      memStore.set(key, { count: 1, windowStart: now });
      return { limited: false, remaining: maxRequests - 1, resetInMs: windowMs };
    }

    entry.count++;
    const resetInMs = windowMs - (now - entry.windowStart);
    const remaining = Math.max(0, maxRequests - entry.count);
    return { limited: entry.count > maxRequests, remaining, resetInMs };
  },
};

// ── Redis backend (stub — wire up when REDIS_URL is available) ─────────────────

const redisBackend: RateLimiterBackend = {
  async check(key, maxRequests, windowMs) {
    // TODO: replace with real Redis implementation using Upstash or ioredis:
    //
    //   const pipeline = redis.pipeline();
    //   pipeline.incr(key);
    //   pipeline.expire(key, Math.ceil(windowMs / 1000));
    //   const [[, count]] = await pipeline.exec();
    //   return {
    //     limited: count > maxRequests,
    //     remaining: Math.max(0, maxRequests - count),
    //     resetInMs: windowMs,
    //   };
    //
    // For now fall back to memory until Redis is wired up.
    console.warn("[rate-limit] Redis backend not implemented — falling back to memory");
    return memoryBackend.check(key, maxRequests, windowMs);
  },
};

// ── Factory ────────────────────────────────────────────────────────────────────

function getBackend(): RateLimiterBackend {
  const backend = process.env.RATE_LIMIT_BACKEND ?? "memory";
  if (backend === "redis") return redisBackend;
  return memoryBackend;
}

/**
 * Check the rate limit for a given key.
 * Returns { limited: true } when the caller has exceeded the quota.
 */
export async function checkRateLimit(
  key: string,
  maxRequests = 60,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  return getBackend().check(key, maxRequests, windowMs);
}
