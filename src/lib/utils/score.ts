/**
 * Utilitaires communs pour manipuler les scores.
 *
 * - Ancien format historique: 0..3
 * - Nouveau format: 0..10
 * - Pondération par récence: moyenne pondérée avec demi‑vie (par défaut 14 jours)
 */

export function normalizeScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  if (score <= 3) {
    // Ancien format : convertir 0-3 vers 0-10
    return (score / 3) * 10;
  }
  // Déjà en format 0-10
  return score;
}

export type SessionScorePoint = {
  started_at: string;
  average_score: number | null;
};

export function weightedAverageScoreByRecency(
  sessions: SessionScorePoint[],
  halfLifeDays = 14,
  nowMs = Date.now()
): number {
  const halfLifeSeconds = halfLifeDays * 24 * 60 * 60;
  const sumWeightsMin = 1e-9;
  let sumW = 0;
  let sumWS = 0;

  for (const s of sessions) {
    if (s.average_score === null || s.average_score === undefined) continue;
    const startedMs = typeof s.started_at === "string" ? new Date(s.started_at).getTime() : NaN;
    if (!Number.isFinite(startedMs)) continue;

    const ageSeconds = Math.max(0, (nowMs - startedMs) / 1000);
    const w = Math.pow(2, -ageSeconds / halfLifeSeconds); // demi-vie
    const score = normalizeScore(s.average_score);

    sumW += w;
    sumWS += w * score;
  }

  return sumW > sumWeightsMin ? sumWS / sumW : 0;
}

