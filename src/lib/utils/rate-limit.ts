type RateLimitOptions = {
  windowMs: number;
  max: number;
};

type Bucket = { resetAt: number; count: number };

function getStore(): Map<string, Bucket> {
  const g = globalThis as unknown as { __rateLimitStore?: Map<string, Bucket> };
  if (!g.__rateLimitStore) g.__rateLimitStore = new Map<string, Bucket>();
  return g.__rateLimitStore;
}

/**
 * Rate limit in-memory (best-effort).
 * En serverless, l'état peut être perdu entre invocations: ça reste utile contre bursts,
 * mais pas un vrai contrôle distribué. Pour du solide: Redis/Upstash/DB.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const store = getStore();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { resetAt: now + options.windowMs, count: 1 });
    return { ok: true };
  }

  existing.count += 1;
  if (existing.count > options.max) {
    return { ok: false, retryAfterMs: Math.max(0, existing.resetAt - now) };
  }
  return { ok: true };
}

