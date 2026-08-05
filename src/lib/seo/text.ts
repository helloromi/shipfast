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

/** Cible confortable pour une description affichée en entier par Google. */
export const DESCRIPTION_MAX = 155;

/**
 * Découpe un texte en phrases.
 *
 * La ponctuation finale est conservée, et un guillemet fermant reste attaché à la
 * phrase qu'il termine. En typographie française il est précédé d'une espace
 * (« …c'est un cap ! »), donc couper sur la seule ponctuation laissait un « » »
 * orphelin en tête de la phrase suivante : d'où l'espace optionnelle dans le
 * lookbehind, et le lookahead qui interdit de couper juste avant le guillemet.
 *
 * Une abréviation en milieu de phrase (« M. Dupont ») serait prise pour une fin de
 * phrase. Les fiches n'en contiennent pas, et le pire cas est une description plus
 * courte que nécessaire — jamais une phrase coupée.
 */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?…](?:\s?[»"'’])?)\s+(?![»"'’])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

/**
 * Retient les premières phrases entières de `text` qui tiennent dans `max`.
 *
 * Sert à fabriquer une description à partir d'une fiche rédigée : une description
 * coupée en plein milieu d'une phrase se fait réécrire par Google, une ou deux
 * phrases complètes non. Renvoie "" si même la première phrase dépasse `max` —
 * c'est à l'appelant de décider s'il tronque ou s'il replie sur autre chose.
 */
export function leadSentences(text: string, max: number): string {
  let lead = "";
  for (const sentence of splitSentences(text)) {
    const next = lead ? `${lead} ${sentence}` : sentence;
    if (next.length > max) break;
    lead = next;
  }
  return lead;
}
