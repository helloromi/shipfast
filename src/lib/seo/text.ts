/**
 * Petits utilitaires de mise en forme des title/description, partagés entre les
 * pages scènes, les pages œuvres et les pages éditoriales.
 */

/**
 * Tronque sur une limite de mot, jamais en plein milieu.
 *
 * L'ancienne troncature des pages scènes coupait au caractère près : 30 descriptions
 * du site finissaient par « … » au milieu d'un mot (« …flashcards, sans co… »).
 */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:—-]+$/, "")}…`;
}

/**
 * Retient la première variante qui tienne dans `max` caractères, sinon tronque la
 * dernière (la plus courte) sur une limite de mot.
 *
 * Les title étaient auparavant construits d'un bloc, ce qui donnait 183 titres sur
 * 189 au-dessus de 60 caractères, jusqu'à 113 — donc coupés dans les résultats
 * Google. On dégrade par paliers plutôt que de couper.
 */
export function firstThatFits(candidates: string[], max: number): string {
  return candidates.find((c) => c.length <= max) ?? truncate(candidates[candidates.length - 1], max);
}

/** Cible confortable pour un title affiché en entier par Google. */
export const TITLE_MAX = 60;
