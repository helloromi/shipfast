/**
 * Tri dramaturgique des scènes d'une œuvre (Acte I avant Acte II, Scène 1 avant
 * Scène 2), pour la page œuvre.
 *
 * L'ordre ne peut pas se faire en base : le numéro d'acte est stocké en toutes
 * lettres/chiffres romains dans `chapter` ("Acte I", "Acte V") et le numéro de
 * scène est enfoui dans `title` sous des formes hétérogènes ("Scène II",
 * "scène 5", "Scène première", "Scène DERNIÈRE"). Un tri de texte brut classerait
 * "Scène X" avant "Scène II" et "première" n'importe où — d'où ce parsing.
 */

const ROMAN_VALUES: Record<string, number> = {
  i: 1,
  v: 5,
  x: 10,
  l: 50,
  c: 100,
  d: 500,
  m: 1000,
};

// Ordinaux français rencontrés dans les titres de scènes/actes. "dernière" n'est
// pas un rang : on la renvoie très loin pour la placer en fin d'acte.
const LAST = 9999;
const WORD_NUMBERS: Record<string, number> = {
  premiere: 1,
  premier: 1,
  deuxieme: 2,
  seconde: 2,
  second: 2,
  troisieme: 3,
  quatrieme: 4,
  cinquieme: 5,
  sixieme: 6,
  septieme: 7,
  huitieme: 8,
  neuvieme: 9,
  dixieme: 10,
  onzieme: 11,
  douzieme: 12,
  derniere: LAST,
  dernier: LAST,
};

// Valeur de repli pour un token non reconnu : classé en fin, sans casser le tri
// des tokens valides. Le titre sert alors de départage stable.
const UNKNOWN = Number.MAX_SAFE_INTEGER;

function normalize(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function romanToInt(s: string): number | null {
  if (!/^[ivxlcdm]+$/.test(s)) return null;
  let total = 0;
  let prev = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    const value = ROMAN_VALUES[s[i]];
    if (value < prev) {
      total -= value;
    } else {
      total += value;
      prev = value;
    }
  }
  return total;
}

/** Convertit un token ("V", "5", "première", "DERNIÈRE") en entier triable. */
function parseNumberToken(token: string): number {
  const t = normalize(token);
  if (!t) return UNKNOWN;
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  if (t in WORD_NUMBERS) return WORD_NUMBERS[t];
  const roman = romanToInt(t);
  if (roman !== null) return roman;
  return UNKNOWN;
}

type OrderableScene = { chapter?: string | null; title?: string | null };

/** Numéro d'acte : depuis `chapter` ("Acte I"), repli sur `title`. */
export function parseActNumber(scene: OrderableScene): number {
  const fromChapter = scene.chapter?.match(/acte\s+([^\s,()]+)/i);
  if (fromChapter) return parseNumberToken(fromChapter[1]);
  const fromTitle = scene.title?.match(/acte\s+([^\s,()]+)/i);
  if (fromTitle) return parseNumberToken(fromTitle[1]);
  return UNKNOWN;
}

/** Numéro de scène : premier token après "scène" dans `title`. */
export function parseSceneNumber(scene: OrderableScene): number {
  const match = scene.title?.match(/sc[eè]ne\s+([^\s,()]+)/i);
  if (match) return parseNumberToken(match[1]);
  return UNKNOWN;
}

/**
 * Comparateur ordre dramaturgique : acte croissant, puis scène croissante, puis
 * titre (départage stable, ex. deux extraits de la même scène).
 */
export function compareScenesDramaturgical(a: OrderableScene, b: OrderableScene): number {
  const actDiff = parseActNumber(a) - parseActNumber(b);
  if (actDiff !== 0) return actDiff;
  const sceneDiff = parseSceneNumber(a) - parseSceneNumber(b);
  if (sceneDiff !== 0) return sceneDiff;
  return (a.title ?? "").localeCompare(b.title ?? "", "fr");
}

/** Trie une liste de scènes dans l'ordre dramaturgique (copie, non mutant). */
export function sortScenesDramaturgical<T extends OrderableScene>(scenes: T[]): T[] {
  return [...scenes].sort(compareScenesDramaturgical);
}
