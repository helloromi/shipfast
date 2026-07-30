/**
 * Seuil de contenu mince pour l'indexation.
 *
 * Le corps d'une page scène, c'est le texte de la scène — un texte du domaine public
 * qui existe mot pour mot sur Wikisource, toutlemoliere.net et theatre-classique.fr.
 * Sur une scène de deux répliques et 143 caractères, il ne reste rien qui puisse nous
 * distinguer de ces sources : la page est un doublon de plus, et elle dilue la qualité
 * moyenne du domaine aux yeux de Google.
 *
 * Ces scènes-là restent servies en 200 et restent liées depuis leur page œuvre — elles
 * font partie de la pièce et un visiteur qui remonte l'acte doit les trouver. Elles
 * sortent seulement du sitemap et passent en `noindex, follow` : on ne demande pas leur
 * indexation, mais on laisse le crawl suivre leurs liens.
 *
 * Le critère est volontairement conjonctif. Une scène de 3 répliques dont chacune est
 * une tirade de 400 caractères est une bonne page (« la tirade du nez » n'en fait que
 * quelques-unes) ; une scène de 12 répliques d'un mot n'en est pas une. Il faut être
 * court sur les DEUX axes pour être écarté.
 *
 * Une fiche rédigée (`summary`) lève le verdict à elle seule, quelle que soit la
 * longueur du texte : c'est précisément ce que la mesure cherche à approcher — la page
 * porte-t-elle quelque chose qui n'existe pas déjà sur dix autres sites ? Sans cette
 * porte de sortie, le seuil écarterait « Ô rage ! ô désespoir ! » (Le Cid I,4, 463
 * caractères) ou les imprécations les plus demandées du répertoire, qui sont courtes
 * par nature. Écrire la fiche d'une scène courte est donc la façon de la faire indexer.
 *
 * Relevé au 30/07/2026 sur les 190 scènes publiques : 14 ont moins de 4 répliques,
 * 28 moins de 500 caractères, 1 seule porte un summary.
 */

const MIN_LINES = 8;
const MIN_CHARS = 500;

/**
 * Longueur à partir de laquelle un `summary` compte comme une vraie fiche. Une phrase
 * de résumé ne différencie pas la page — c'est le genre de ligne que n'importe quel
 * site de textes affiche aussi. Les fiches du lot pilote font 130 à 175 mots, soit
 * ~900 caractères ; le seuil ne retient donc que ce qui a réellement été rédigé.
 */
const MIN_SUMMARY_CHARS = 200;

type IndexableScene = {
  lines: readonly { text: string | null }[];
  summary?: string | null;
};

/**
 * Vrai si la scène est trop maigre pour mériter d'être indexée.
 * Source unique du critère : sitemap et metadata de la page doivent trancher pareil,
 * sinon on déclare au sitemap une URL qui se sert elle-même en noindex.
 */
export function isThinScene({ lines, summary }: IndexableScene): boolean {
  if ((summary?.trim().length ?? 0) >= MIN_SUMMARY_CHARS) return false;
  if (lines.length >= MIN_LINES) return false;
  const chars = lines.reduce((total, line) => total + (line.text?.length ?? 0), 0);
  return chars < MIN_CHARS;
}
