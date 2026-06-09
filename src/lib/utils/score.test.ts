import { describe, expect, it } from "vitest";

import { normalizeScore, weightedAverageScoreByRecency } from "./score";

describe("normalizeScore", () => {
  it("convertit l'ancien format 0-3 vers 0-10", () => {
    expect(normalizeScore(0)).toBe(0);
    expect(normalizeScore(3)).toBe(10);
    expect(normalizeScore(1.5)).toBe(5);
  });

  it("laisse le nouveau format 0-10 inchangé", () => {
    expect(normalizeScore(7)).toBe(7);
    expect(normalizeScore(10)).toBe(10);
    expect(normalizeScore(3.5)).toBe(3.5);
  });

  it("retourne 0 pour les valeurs non finies", () => {
    expect(normalizeScore(NaN)).toBe(0);
    expect(normalizeScore(Infinity)).toBe(0);
  });
});

describe("weightedAverageScoreByRecency", () => {
  const NOW = new Date("2026-06-09T12:00:00Z").getTime();
  const daysAgo = (n: number) => new Date(NOW - n * 24 * 60 * 60 * 1000).toISOString();

  it("retourne 0 sans sessions", () => {
    expect(weightedAverageScoreByRecency([], 14, NOW)).toBe(0);
  });

  it("retourne le score normalisé pour une seule session", () => {
    const result = weightedAverageScoreByRecency(
      [{ started_at: daysAgo(1), average_score: 7 }],
      14,
      NOW
    );
    expect(result).toBeCloseTo(7);
  });

  it("pondère davantage les sessions récentes", () => {
    // Session récente à 10, session ancienne à 0 : la moyenne doit pencher vers 10.
    const result = weightedAverageScoreByRecency(
      [
        { started_at: daysAgo(0), average_score: 10 },
        { started_at: daysAgo(28), average_score: 4 }, // > 3 => déjà au format 0-10
      ],
      14,
      NOW
    );
    expect(result).toBeGreaterThan(7);
    expect(result).toBeLessThan(10);
  });

  it("ignore les sessions sans score", () => {
    const result = weightedAverageScoreByRecency(
      [
        { started_at: daysAgo(1), average_score: null },
        { started_at: daysAgo(1), average_score: 8 },
      ],
      14,
      NOW
    );
    expect(result).toBeCloseTo(8);
  });

  it("ignore les dates invalides", () => {
    const result = weightedAverageScoreByRecency(
      [
        { started_at: "n'importe quoi", average_score: 10 },
        { started_at: daysAgo(1), average_score: 6 },
      ],
      14,
      NOW
    );
    expect(result).toBeCloseTo(6);
  });

  it("normalise les anciens scores 0-3 dans la moyenne", () => {
    // 3 (ancien format) => 10
    const result = weightedAverageScoreByRecency(
      [{ started_at: daysAgo(1), average_score: 3 }],
      14,
      NOW
    );
    expect(result).toBeCloseTo(10);
  });
});
