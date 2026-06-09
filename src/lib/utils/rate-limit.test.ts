import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { checkRateLimit } from "./rate-limit";

// Le store est global au process : chaque test utilise une clé unique.
let testId = 0;
const uniqueKey = () => `test:${++testId}`;

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-09T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("autorise les requêtes sous la limite", () => {
    const key = uniqueKey();
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key, { windowMs: 60_000, max: 5 }).ok).toBe(true);
    }
  });

  it("bloque au-delà de la limite avec un retryAfterMs", () => {
    const key = uniqueKey();
    for (let i = 0; i < 3; i++) {
      checkRateLimit(key, { windowMs: 60_000, max: 3 });
    }
    const result = checkRateLimit(key, { windowMs: 60_000, max: 3 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.retryAfterMs).toBeGreaterThan(0);
      expect(result.retryAfterMs).toBeLessThanOrEqual(60_000);
    }
  });

  it("réautorise après expiration de la fenêtre", () => {
    const key = uniqueKey();
    for (let i = 0; i < 4; i++) {
      checkRateLimit(key, { windowMs: 60_000, max: 3 });
    }
    expect(checkRateLimit(key, { windowMs: 60_000, max: 3 }).ok).toBe(false);

    vi.advanceTimersByTime(61_000);
    expect(checkRateLimit(key, { windowMs: 60_000, max: 3 }).ok).toBe(true);
  });

  it("isole les clés entre elles", () => {
    const a = uniqueKey();
    const b = uniqueKey();
    for (let i = 0; i < 4; i++) {
      checkRateLimit(a, { windowMs: 60_000, max: 3 });
    }
    expect(checkRateLimit(a, { windowMs: 60_000, max: 3 }).ok).toBe(false);
    expect(checkRateLimit(b, { windowMs: 60_000, max: 3 }).ok).toBe(true);
  });
});
