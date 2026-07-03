#!/usr/bin/env tsx
/**
 * wikisource-fetch.ts — supabase/seed/
 *
 * Récupère des scènes de théâtre sur fr.wikisource.org et génère un JSON
 * au format de cote-cour-seed.json ({ works: [...] }), prêt à fusionner
 * puis à seeder via `npm run seed:scenes`.
 *
 * Usage :
 *   npx tsx supabase/seed/wikisource-fetch.ts [options] <url-ou-titre> [<url-ou-titre>...]
 *
 * Arguments :
 *   Chaque argument est une URL Wikisource complète ou un titre de page :
 *     "https://fr.wikisource.org/wiki/L%E2%80%99Avare/Acte_IV"
 *     "Phèdre (Racine)/Acte I"
 *   Une page « acte » est découpée en scènes (titres == Scène N ==). Si
 *   l'acte est réparti en sous-pages (Acte I/Scène 2…), elles sont suivies.
 *
 * Options :
 *   --scene <n>       Ne garder que la scène n (chiffre arabe ou romain)
 *   --title <titre>   Forcer le titre de l'œuvre (sinon déduit de la page racine)
 *   --author <nom>    Forcer l'auteur (sinon déduit du header Wikisource)
 *   --year <aaaa>     Année de l'œuvre
 *   --out <fichier>   Écrire le JSON dans un fichier (sinon stdout)
 *   --merge           Fusionner dans supabase/seed/cote-cour-seed.json (recommandé)
 *   --max-len <n>     Longueur max d'une carte avant découpe (défaut 220)
 *
 * Sortie :
 *   --merge : met à jour cote-cour-seed.json (œuvres/scènes fusionnées, doublons ignorés)
 *   --out   : fichier JSON { works: [...] } uniquement
 *   sinon   : stdout JSON (pipe-safe)
 *   stderr  : logs de progression et avertissements actionnables
 *   Code 0 si tout a réussi, 1 si au moins une page a échoué.
 *
 * Le contenu est toujours marqué reliability: "verify_priority" — relire
 * contre Wikisource avant seed (règle CLAUDE.md).
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WIKI_API = "https://fr.wikisource.org/w/api.php";
const USER_AGENT = "cote-cour-seed/2.0 (contact: hello@pauloromi.com)";
const FETCH_TIMEOUT_MS = 15_000;
const MAX_SUBPAGES = 20;
const SEED_FILE = join(dirname(fileURLToPath(import.meta.url)), "cote-cour-seed.json");

// ─── Types ───────────────────────────────────────────────────────────────────

type RawLine = { character: string; text: string };
type ParseStrategy = "templates" | "bold_names" | "plain_caps" | "html_render" | "none";

type SeedLine = { order: number; character: string; text: string };
type SeedScene = { title: string; characters: string[]; lines: SeedLine[] };
type SeedWork = {
  title: string;
  author: string;
  year?: number;
  reliability: "verify_priority";
  wikisource_url: string;
  scenes: SeedScene[];
};

type CliOptions = {
  scene: number | null;
  title: string | null;
  author: string | null;
  year: number | null;
  out: string | null;
  merge: boolean;
  maxLen: number;
  pages: string[];
};

class FetchError extends Error {
  constructor(message: string, readonly hint?: string) {
    super(message);
  }
}

// ─── HTTP ────────────────────────────────────────────────────────────────────

async function apiGet(params: Record<string, string>, attempt = 1): Promise<unknown> {
  const search = new URLSearchParams({ format: "json", formatversion: "2", ...params });
  const url = `${WIKI_API}?${search}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (res.status === 429 || res.status >= 500) {
      throw new FetchError(`HTTP ${res.status} de l'API Wikisource`);
    }
    if (!res.ok) {
      throw new FetchError(`HTTP ${res.status} de l'API Wikisource`, "Vérifie l'URL de l'API.");
    }
    return (await res.json()) as unknown;
  } catch (err) {
    if (attempt < 3) {
      const delay = attempt * 1500;
      log(`   ↻ tentative ${attempt + 1}/3 dans ${delay}ms (${(err as Error).message})`);
      await new Promise((r) => setTimeout(r, delay));
      return apiGet(params, attempt + 1);
    }
    throw new FetchError(
      `Réseau/API injoignable après 3 tentatives : ${(err as Error).message}`,
      "Réessaie plus tard ou vérifie la connexion."
    );
  }
}

type ParseResponse = {
  error?: { code?: string; info?: string };
  parse?: { title?: string; wikitext?: string; text?: string };
};

/** wikitext + HTML rendu en un seul appel (redirections suivies). */
async function fetchPage(title: string, retriedApostrophe = false): Promise<{ wikitext: string; html: string; resolvedTitle: string }> {
  const json = (await apiGet({
    action: "parse",
    page: title,
    prop: "wikitext|text",
    redirects: "1",
  })) as ParseResponse;

  if (json.error) {
    if (json.error.code === "missingtitle") {
      // Wikisource utilise l'apostrophe typographique ’ — retente en substituant.
      if (!retriedApostrophe && /['’]/.test(title)) {
        const swapped = title.includes("'") ? title.replace(/'/g, "’") : title.replace(/’/g, "'");
        if (swapped !== title) {
          log(`   ↻ apostrophe : retente avec "${swapped}"`);
          return fetchPage(swapped, true);
        }
      }
      const suggestions = await searchSuggestions(title);
      throw new FetchError(
        `Page introuvable : "${title}"`,
        suggestions.length
          ? `Titres proches sur fr.wikisource.org :\n${suggestions.map((s) => `     - ${s}`).join("\n")}`
          : "Cherche le titre exact sur https://fr.wikisource.org (attention aux apostrophes typographiques ’ vs ')."
      );
    }
    throw new FetchError(`API Wikisource : ${json.error.info ?? json.error.code ?? "erreur inconnue"}`);
  }

  return {
    wikitext: json.parse?.wikitext ?? "",
    html: json.parse?.text ?? "",
    resolvedTitle: json.parse?.title ?? title,
  };
}

async function searchSuggestions(query: string): Promise<string[]> {
  try {
    const json = (await apiGet({
      action: "opensearch",
      search: query.split("/")[0] ?? query,
      limit: "5",
    })) as unknown[];
    return Array.isArray(json?.[1]) ? (json[1] as string[]) : [];
  } catch {
    return [];
  }
}

// ─── Entrée : URL ou titre ──────────────────────────────────────────────────

function toPageTitle(input: string): string {
  let title = input.trim();
  const urlMatch = title.match(/^https?:\/\/fr\.wikisource\.org\/wiki\/(.+)$/i);
  if (urlMatch) {
    title = decodeURIComponent(urlMatch[1]);
  } else if (/^https?:\/\//i.test(title)) {
    throw new FetchError(
      `URL non reconnue : ${input}`,
      "Seules les URLs https://fr.wikisource.org/wiki/... sont acceptées."
    );
  }
  return title.replace(/_/g, " ").replace(/#.*$/, "").trim();
}

// ─── Nettoyage du markup ────────────────────────────────────────────────────

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function stripMarkup(text: string): string {
  return decodeEntities(
    text
      .replace(/<ref[^>]*\/>/gi, "")
      .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
      .replace(/\{\{[Dd]idascalie\|([^{}]*)\}\}/g, "($1)")
      .replace(/\{\{[Pp]ersonnage[DdIi]?\|[^{}]*\}\}/g, "")
      .replace(/\{\{[Nn]ote\|[^{}]*\}\}/g, "")
      .replace(/\{\{[Cc]orr\|[^|{}]*\|([^{}|]*)\}\}/g, "$1") // {{corr|faute|correction}}
      .replace(/\{\{[^{}]*\}\}/g, "")
      .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, "$1")
      .replace(/\[\[([^\]]*)\]\]/g, "$1")
      .replace(/'{3}([^']+)'{3}/g, "$1")
      .replace(/'{2}([^']+)'{2}/g, "$1")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/[ \t]+/g, " ")
      .trim()
  );
}

function normalizeCharacter(raw: string): string {
  return stripMarkup(raw)
    .toUpperCase()
    .replace(/[.,;:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Mots qui ressemblent à des noms (majuscules) mais n'en sont pas. */
const CHARACTER_STOPLIST = /^(ACTE|SC[ÈE]NE|FIN\b|PERSONNAGES?|ENTRACTE|PROLOGUE|[ÉE]PILOGUE|TABLE\b|NOTES?\b)/;

/** Un nom plausible : lettres majuscules/espaces/tirets, longueur bornée. */
function isPlausibleCharacter(name: string): boolean {
  if (name.length < 2 || name.length > 40) return false;
  if (CHARACTER_STOPLIST.test(name)) return false;
  return /^[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒÆ][A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒÆ\s\-'’.]*$/.test(name);
}

// ─── Parsing wikitext : 3 stratégies ────────────────────────────────────────

/** Stratégie 1 : {{Personnage|NOM|c}} / {{PersonnageD|NOM|c|didascalie}} */
function parseTemplates(wikitext: string): RawLine[] {
  const result: RawLine[] = [];
  const pattern = /\{\{[Pp]ersonnage([DdIi])?\|([^|{}]+)(?:\|[^|{}]*)?(?:\|([^{}]*))?\}\}([\s\S]*?)(?=\{\{[Pp]ersonnage[DdIi]?\||\n==|$)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(wikitext)) !== null) {
    const character = normalizeCharacter(match[2] ?? "");
    const didascalie = match[1] && match[3] ? `(${stripMarkup(match[3])}) ` : "";
    const speech = stripMarkup((match[4] ?? "").replace(/\n+/g, " "));
    if (isPlausibleCharacter(character) && speech.length > 3) {
      result.push({ character, text: `${didascalie}${speech}`.trim() });
    }
  }
  return result;
}

/** Stratégie 2 : '''NOM.''' texte (nom en gras ou italique) */
function parseBoldNames(wikitext: string): RawLine[] {
  const result: RawLine[] = [];
  const pattern = /'{2,3}([A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒÆ][A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒÆ\s\-'’]{1,38})[.,]?\s*'{2,3}[\s.,—–:]*([\s\S]*?)(?='{2,3}[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒÆ]|\n==|$)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(wikitext)) !== null) {
    const character = normalizeCharacter(match[1] ?? "");
    const speech = stripMarkup((match[2] ?? "").replace(/\n+/g, " "));
    if (isPlausibleCharacter(character) && speech.length > 3) {
      result.push({ character, text: speech });
    }
  }
  return result;
}

/** Stratégie 3 : NOM seul sur sa ligne (ou NOM. — texte), texte en dessous. */
function parsePlainCaps(rawLines: string[]): RawLine[] {
  const result: RawLine[] = [];
  let currentChar = "";
  let currentParts: string[] = [];

  const flush = () => {
    if (currentChar && currentParts.length > 0) {
      const text = currentParts.join(" ").replace(/\s+/g, " ").trim();
      if (text.length > 3) result.push({ character: currentChar, text });
    }
    currentParts = [];
  };

  for (const raw of rawLines) {
    const clean = stripMarkup(raw);
    if (!clean) continue;
    if (/^=+.*=+$/.test(raw.trim())) {
      flush();
      currentChar = "";
      continue;
    }

    // NOM seul sur la ligne, ou NOM suivi de — / . puis du texte
    const soloName = normalizeCharacter(clean);
    if (isPlausibleCharacter(soloName) && clean === clean.toUpperCase()) {
      flush();
      currentChar = soloName;
      continue;
    }
    const inlineMatch = clean.match(/^([A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒÆ][A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜÇŒÆ\s\-'’]{1,38})[.,]?\s*[—–:]\s+(.+)$/);
    if (inlineMatch && isPlausibleCharacter(normalizeCharacter(inlineMatch[1] ?? ""))) {
      flush();
      currentChar = normalizeCharacter(inlineMatch[1] ?? "");
      if (inlineMatch[2]) currentParts.push(inlineMatch[2].trim());
      continue;
    }
    if (currentChar) currentParts.push(clean);
  }
  flush();
  return result;
}

// ─── Parsing HTML rendu (pages en transclusion <pages index=…>) ─────────────

function stripHtmlNoise(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<span class="mw-editsection[\s\S]*?<\/span>/gi, "")
    .replace(/<sup[^>]*class="[^"]*reference[^"]*"[\s\S]*?<\/sup>/gi, "");
}

function htmlToPlainText(html: string): string {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parse une section HTML en s'appuyant sur les classes standard des éditions
 * Wikisource : <span class="personnage">Nom</span> (template {{Personnage}})
 * et <div class="didascalie">…</div>. Les <p> suivants forment la réplique.
 */
function parseHtmlSection(html: string): RawLine[] {
  const lines: RawLine[] = [];
  let current: string | null = null;
  let parts: string[] = [];

  const flush = () => {
    if (current && parts.length > 0) {
      const text = parts.join(" ").replace(/\s+/g, " ").trim();
      if (text.length > 3) lines.push({ character: current, text });
    }
    parts = [];
  };

  const tokenPattern =
    /<span[^>]*class="[^"]*\bpersonnage\b[^"]*"[^>]*>([\s\S]*?)<\/span>|<div[^>]*class="[^"]*\bdidascalie\b[^"]*"[^>]*>([\s\S]*?)<\/div>|<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m: RegExpExecArray | null;
  while ((m = tokenPattern.exec(html)) !== null) {
    if (m[1] !== undefined) {
      const name = normalizeCharacter(htmlToPlainText(m[1]));
      if (isPlausibleCharacter(name)) {
        flush();
        current = name;
      }
    } else if (m[2] !== undefined) {
      // Didascalie : rattachée à la réplique en cours ; l'entête de scène
      // (liste des personnages, avant toute réplique) est ignorée.
      const d = htmlToPlainText(m[2]);
      if (current && d) parts.push(`(${d})`);
    } else if (m[3] !== undefined) {
      const p = htmlToPlainText(m[3]);
      if (current && p) parts.push(p);
    }
  }
  flush();
  return lines;
}

/** Section HTML sans classes personnage : retombe sur les NOMS en majuscules. */
function parseHtmlSectionByCaps(html: string): RawLine[] {
  const text = decodeEntities(
    stripHtmlNoise(html)
      .replace(/<(?:p|div|h[1-6]|li|tr|br)[^>]*\/?>/gi, "\n$&")
      .replace(/<[^>]+>/g, "")
  );
  return parsePlainCaps(text.split("\n").map((l) => l.replace(/\s+/g, " ").trim()));
}

type ParsedScene = { label: string; lines: RawLine[]; strategy: ParseStrategy };

/** Découpe le HTML rendu par titres h2-h4 « Scène N » et parse chaque section. */
function parseHtmlDocument(rawHtml: string, pageLabel: string): ParsedScene[] {
  const html = stripHtmlNoise(rawHtml);
  const headingPattern = /<h([2-4])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const marks: Array<{ label: string; start: number; contentStart: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = headingPattern.exec(html)) !== null) {
    marks.push({ label: htmlToPlainText(m[2] ?? ""), start: m.index, contentStart: m.index + m[0].length });
  }

  const parseSection = (section: string, label: string): ParsedScene | null => {
    const byClass = parseHtmlSection(section);
    if (byClass.length >= 2) return { label, lines: byClass, strategy: "html_render" };
    const byCaps = parseHtmlSectionByCaps(section);
    if (byCaps.length >= 2) return { label, lines: byCaps, strategy: "html_render" };
    return null;
  };

  const sceneMarks = marks
    .map((mark, i) => ({ ...mark, end: marks[i + 1]?.start ?? html.length }))
    .filter((mark) => /sc[èe]ne/i.test(mark.label));

  if (sceneMarks.length === 0) {
    const whole = parseSection(html, pageLabel);
    return whole ? [whole] : [];
  }

  const scenes: ParsedScene[] = [];
  for (const mark of sceneMarks) {
    const scene = parseSection(html.slice(mark.contentStart, mark.end), mark.label.replace(/\.\s*$/, ""));
    if (scene) scenes.push(scene);
  }
  return scenes;
}

// ─── Choix de la meilleure route ────────────────────────────────────────────

function parseWikitextChunk(wikitext: string): { lines: RawLine[]; strategy: ParseStrategy } {
  const templates = parseTemplates(wikitext);
  if (templates.length >= 2) return { lines: templates, strategy: "templates" };
  const bold = parseBoldNames(wikitext);
  if (bold.length >= 2) return { lines: bold, strategy: "bold_names" };
  const caps = parsePlainCaps(wikitext.split("\n"));
  if (caps.length >= 2) return { lines: caps, strategy: "plain_caps" };
  return { lines: [], strategy: "none" };
}

/**
 * Parse une page complète : route wikitext (sections == Scène N ==) et route
 * HTML rendu, puis garde celle qui restitue le plus de scènes (à égalité, le
 * plus de répliques ; à nouvelle égalité, le wikitext, plus fiable).
 */
function parseDocument(wikitext: string, html: string, pageLabel: string): ParsedScene[] {
  const wikiScenes: ParsedScene[] = [];
  for (const section of splitScenes(wikitext, pageLabel)) {
    const { lines, strategy } = parseWikitextChunk(section.wikitext);
    if (lines.length >= 2) wikiScenes.push({ label: section.label, lines, strategy });
  }
  const htmlScenes = html ? parseHtmlDocument(html, pageLabel) : [];

  const count = (scenes: ParsedScene[]) => scenes.reduce((n, s) => n + s.lines.length, 0);
  if (htmlScenes.length > wikiScenes.length) return htmlScenes;
  if (htmlScenes.length === wikiScenes.length && count(htmlScenes) > count(wikiScenes)) return htmlScenes;
  return wikiScenes;
}

// ─── Découpage acte → scènes ────────────────────────────────────────────────

const ROMAN: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };

function romanToInt(roman: string): number | null {
  const s = roman.toUpperCase().trim();
  if (!/^[IVXLC]+$/.test(s)) return null;
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = ROMAN[s[i] ?? ""] ?? 0;
    const next = ROMAN[s[i + 1] ?? ""] ?? 0;
    total += cur < next ? -cur : cur;
  }
  return total;
}

function sceneNumberFromLabel(label: string): number | null {
  const m = label.match(/sc[èe]ne\s+([IVXLC]+|\d+)/i);
  if (!m || !m[1]) return null;
  const arabic = parseInt(m[1], 10);
  return Number.isNaN(arabic) ? romanToInt(m[1]) : arabic;
}

type SectionChunk = { label: string; wikitext: string };

/** Découpe le wikitext en sections « Scène N ». Sans titres, tout est une section. */
function splitScenes(wikitext: string, pageLabel: string): SectionChunk[] {
  const headingPattern = /^=+\s*([^=\n]*sc[èe]ne[^=\n]*)\s*=+\s*$/gim;
  const headings: Array<{ label: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = headingPattern.exec(wikitext)) !== null) {
    headings.push({ label: stripMarkup(m[1] ?? "").trim(), index: m.index });
  }
  if (headings.length === 0) {
    return [{ label: pageLabel, wikitext }];
  }
  return headings.map((h, i) => ({
    label: h.label || `Scène ${i + 1}`,
    wikitext: wikitext.slice(h.index, headings[i + 1]?.index ?? wikitext.length),
  }));
}

/** Sous-pages « …/Scène N » listées dans une page d'acte quasi vide. */
function findSceneSubpages(wikitext: string, actTitle: string): string[] {
  const found = new Set<string>();
  const linkPattern = /\[\[([^\]|#]+\/Sc[èe]ne[^\]|#]*)(?:\|[^\]]*)?\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = linkPattern.exec(wikitext)) !== null) {
    const target = (m[1] ?? "").trim();
    if (target) found.add(target);
  }
  // Liens relatifs [[/Scène 2]]
  const relPattern = /\[\[\/(Sc[èe]ne[^\]|#]*)(?:\|[^\]]*)?\]\]/g;
  while ((m = relPattern.exec(wikitext)) !== null) {
    found.add(`${actTitle}/${(m[1] ?? "").trim()}`);
  }
  return [...found].slice(0, MAX_SUBPAGES);
}

// ─── Métadonnées de l'œuvre (page racine) ───────────────────────────────────

function extractAuthor(wikitext: string, html: string): string | null {
  const wikiMatch =
    wikitext.match(/\[\[Auteur:([^|\]]+)/) ??
    wikitext.match(/\|\s*auteur\s*=\s*([^\n|]+)/i);
  if (wikiMatch?.[1]) {
    const author = stripMarkup(wikiMatch[1]).trim();
    if (author) return author;
  }
  // Les éditions en transclusion ne portent l'auteur que dans le header rendu.
  const htmlMatch = html.match(/href="\/wiki\/Auteur:([^"#?]+)"/);
  if (htmlMatch?.[1]) {
    const author = decodeURIComponent(htmlMatch[1]).replace(/_/g, " ").trim();
    if (author) return author;
  }
  return null;
}

/**
 * Titre = racine sans parenthèses de désambiguïsation. Auteur = premier
 * [[Auteur:…]] trouvé en remontant la chaîne des pages parentes (la page
 * de l'acte elle-même, puis l'édition, puis la racine).
 */
async function guessWorkMeta(
  pageWikitext: string,
  pageHtml: string,
  resolvedTitle: string
): Promise<{ title: string; author: string | null }> {
  const rootTitle = resolvedTitle.split("/")[0] ?? resolvedTitle;
  // "Phèdre (Racine), Didot, 1854" → "Phèdre" : retire la désambiguïsation
  // entre parenthèses puis le suffixe d'édition ", Éditeur, année".
  const cleanTitle = rootTitle
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/,\s*[^,]+,\s*\d{4}\s*$/, "")
    .trim();

  let author = extractAuthor(pageWikitext, pageHtml);
  const segments = resolvedTitle.split("/");
  for (let depth = segments.length - 1; depth >= 1 && !author; depth--) {
    const parent = segments.slice(0, depth).join("/");
    try {
      const { wikitext, html } = await fetchPage(parent);
      author = extractAuthor(wikitext, html);
    } catch {
      // page parente absente : on continue de remonter
    }
  }
  return { title: cleanTitle, author };
}

// ─── Découpe des tirades en cartes ──────────────────────────────────────────

function splitSpeech(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  // Segmente en phrases, puis regroupe sous maxLen.
  const segments = text.match(/[^.!?;]+[.!?;]*[»"’’)]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const seg of segments) {
    if (current && (current + seg).length > maxLen) {
      chunks.push(current.trim());
      current = seg;
    } else {
      current += seg;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

// ─── Assemblage ─────────────────────────────────────────────────────────────

function buildScene(label: string, parsed: RawLine[], maxLen: number): SeedScene {
  let order = 1;
  const lines: SeedLine[] = [];
  for (const { character, text } of parsed) {
    for (const chunk of splitSpeech(text, maxLen)) {
      if (chunk.length > 5) lines.push({ order: order++, character, text: chunk });
    }
  }
  const characters = [...new Set(parsed.map((l) => l.character))];
  return { title: label, characters, lines };
}

function sanityWarnings(scene: SeedScene): string[] {
  const warnings: string[] = [];
  if (scene.characters.length > 12) {
    warnings.push(
      `${scene.characters.length} « personnages » détectés — le parsing a probablement pris du bruit pour des noms. À vérifier : ${scene.characters.slice(0, 6).join(", ")}…`
    );
  }
  if (scene.lines.length < 4) {
    warnings.push(`Seulement ${scene.lines.length} répliques — scène incomplète ou parsing partiel.`);
  }
  const longest = Math.max(...scene.lines.map((l) => l.text.length), 0);
  if (longest > 500) {
    warnings.push(`Une carte fait ${longest} caractères — découpe des tirades à revoir.`);
  }
  return warnings;
}

// ─── CLI ────────────────────────────────────────────────────────────────────

function log(msg: string): void {
  process.stderr.write(`${msg}\n`);
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    scene: null,
    title: null,
    author: null,
    year: null,
    out: null,
    merge: false,
    maxLen: 220,
    pages: [],
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? "";
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new FetchError(`Option ${arg} : valeur manquante`);
      return v;
    };
    switch (arg) {
      case "--scene": {
        const v = next();
        opts.scene = /^\d+$/.test(v) ? parseInt(v, 10) : romanToInt(v);
        if (opts.scene === null) throw new FetchError(`--scene : "${v}" n'est ni un nombre ni un chiffre romain`);
        break;
      }
      case "--title": opts.title = next(); break;
      case "--author": opts.author = next(); break;
      case "--year": {
        const v = parseInt(next(), 10);
        if (Number.isNaN(v)) throw new FetchError("--year : année invalide");
        opts.year = v;
        break;
      }
      case "--out": opts.out = next(); break;
      case "--merge": opts.merge = true; break;
      case "--max-len": {
        const v = parseInt(next(), 10);
        if (Number.isNaN(v) || v < 60) throw new FetchError("--max-len : minimum 60");
        opts.maxLen = v;
        break;
      }
      case "--help":
      case "-h":
        log("Usage : npx tsx supabase/seed/wikisource-fetch.ts [options] <url-ou-titre>...");
        log("Options : --scene <n> --title <t> --author <a> --year <aaaa> --merge --out <fichier> --max-len <n>");
        process.exit(0);
        break;
      default:
        if (arg.startsWith("--")) throw new FetchError(`Option inconnue : ${arg}`, "Voir --help");
        opts.pages.push(arg);
    }
  }
  if (opts.pages.length === 0) {
    throw new FetchError(
      "Aucune page fournie.",
      'Exemple : npx tsx supabase/seed/wikisource-fetch.ts --merge "Phèdre (Racine)/Acte II"'
    );
  }
  if (opts.merge && opts.out) {
    throw new FetchError("--merge et --out sont exclusifs", "Utilise l'un ou l'autre.");
  }
  return opts;
}

// ─── Traitement d'une page ──────────────────────────────────────────────────

async function processPage(input: string, opts: CliOptions): Promise<{ work: SeedWork; warnings: string[] }> {
  const pageTitle = toPageTitle(input);
  log(`⬇  ${pageTitle}`);

  const { wikitext, html, resolvedTitle } = await fetchPage(pageTitle);
  if (!wikitext.trim() && !html.trim()) {
    throw new FetchError(`Page vide : "${pageTitle}"`);
  }

  const rootTitle = resolvedTitle.split("/")[0] ?? resolvedTitle;
  const actLabel = resolvedTitle.includes("/")
    ? resolvedTitle.split("/").slice(1).join(", ")
    : resolvedTitle;

  // Route wikitext + route HTML rendu sur la page elle-même.
  let parsedScenes = parseDocument(wikitext, html, actLabel);

  // Acte réparti en sous-pages ? (page d'acte quasi vide + liens /Scène N)
  if (parsedScenes.length === 0) {
    const subpages = findSceneSubpages(wikitext, resolvedTitle);
    if (subpages.length > 0) {
      log(`   ↳ acte en ${subpages.length} sous-pages, fetch de chacune…`);
      for (const sub of subpages) {
        const subPage = await fetchPage(sub);
        const subLabel = sub.includes("/") ? sub.split("/").pop() ?? sub : sub;
        const subScenes = parseDocument(subPage.wikitext, subPage.html, subLabel);
        parsedScenes.push(...subScenes);
      }
    }
  }

  // Filtre --scene
  if (opts.scene !== null) {
    const filtered = parsedScenes.filter((s) => sceneNumberFromLabel(s.label) === opts.scene);
    if (filtered.length === 0) {
      const available = parsedScenes.map((s) => s.label).join(" | ");
      throw new FetchError(
        `Scène ${opts.scene} introuvable dans "${resolvedTitle}"`,
        `Sections détectées : ${available || "(aucune — la page n'a pas de titres « Scène N »)"}`
      );
    }
    parsedScenes = filtered;
  }

  // Assemblage
  const scenes: SeedScene[] = [];
  const warnings: string[] = [];
  for (const parsed of parsedScenes) {
    const sceneLabel = /sc[èe]ne/i.test(parsed.label) && !/acte/i.test(parsed.label)
      ? `${actLabel.match(/Acte\s+[IVXLC\d]+/i)?.[0] ?? actLabel}, ${parsed.label}`
      : parsed.label;
    const scene = buildScene(sceneLabel, parsed.lines, opts.maxLen);
    log(`   ✓ ${sceneLabel} — ${scene.lines.length} cartes, ${scene.characters.length} personnage(s) [${parsed.strategy}]`);
    warnings.push(...sanityWarnings(scene).map((w) => `"${sceneLabel}" : ${w}`));
    scenes.push(scene);
  }

  if (scenes.length === 0) {
    throw new FetchError(
      `Aucune scène exploitable dans "${resolvedTitle}"`,
      `Format non reconnu (wikitext et HTML rendu). Début du wikitext pour diagnostic :\n${wikitext.slice(0, 500)}`
    );
  }

  // Métadonnées œuvre
  let title = opts.title;
  let author = opts.author;
  if (!title || !author) {
    const meta = await guessWorkMeta(wikitext, html, resolvedTitle);
    title = title ?? meta.title;
    if (!author) {
      author = meta.author;
      if (!author) {
        warnings.push(`Auteur introuvable sur la page racine "${rootTitle}" — passe --author "Nom". Placeholder "AUTEUR À COMPLÉTER" utilisé.`);
        author = "AUTEUR À COMPLÉTER";
      }
    }
  }

  const work: SeedWork = {
    title,
    author,
    ...(opts.year !== null ? { year: opts.year } : {}),
    reliability: "verify_priority",
    wikisource_url: `https://fr.wikisource.org/wiki/${encodeURIComponent(resolvedTitle.replace(/ /g, "_"))}`,
    scenes,
  };
  return { work, warnings };
}

/** Fusionne les works de même (titre, auteur) — plusieurs actes d'une même pièce. */
function mergeWorks(works: SeedWork[]): SeedWork[] {
  const byKey = new Map<string, SeedWork>();
  for (const work of works) {
    const key = `${work.title}::${work.author}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.scenes.push(...work.scenes);
      if (work.wikisource_url) existing.wikisource_url = work.wikisource_url;
    } else {
      byKey.set(key, { ...work, scenes: [...work.scenes] });
    }
  }
  return [...byKey.values()];
}

function workKey(work: SeedWork): string {
  return `${work.title}::${work.author}`;
}

function sceneKey(title: string): string {
  const t = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/scène/g, "scene")
    .replace(/première|premiere|premier/g, "1")
    .replace(/\bii\b/g, "2")
    .replace(/\biii\b/g, "3")
    .replace(/\biv\b/g, "4")
    .replace(/\bv\b/g, "5");
  const act = t.match(/acte\s+[ivxlc]+[^0-9]*(\d+)/)?.[1]
    ?? t.match(/acte\s+[ivxlc]+.*?scene\s*(\d+)/)?.[1]
    ?? t.match(/scene\s*(\d+)/)?.[1];
  return act ? `acte-scene-${act}` : title.toLowerCase();
}

function sceneTextLen(scene: SeedScene): number {
  return scene.lines.reduce((n, l) => n + l.text.length, 0);
}

type SeedFile = {
  _meta?: Record<string, unknown>;
  works: SeedWork[];
};

/** Fusionne des scènes entrantes dans une liste existante (clé normalisée). */
function mergeSceneLists(
  existing: SeedScene[],
  incoming: SeedScene[],
): { scenes: SeedScene[]; added: number; skipped: number; updated: number } {
  const sceneMap = new Map<string, SeedScene>();
  for (const s of existing) sceneMap.set(sceneKey(s.title), s);

  let added = 0;
  let skipped = 0;
  let updated = 0;

  for (const s of incoming) {
    const sk = sceneKey(s.title);
    const prev = sceneMap.get(sk);
    if (!prev) {
      sceneMap.set(sk, s);
      added++;
    } else if (sceneTextLen(s) > sceneTextLen(prev)) {
      sceneMap.set(sk, s);
      updated++;
    } else {
      skipped++;
    }
  }

  return { scenes: [...sceneMap.values()], added, skipped, updated };
}

/** Fusionne des œuvres fraîchement fetchées dans cote-cour-seed.json. */
function mergeIntoSeedFile(
  incoming: SeedWork[],
  seedPath = SEED_FILE,
): { added: number; skipped: number; updated: number; works: number; scenes: number } {
  const base: SeedFile = existsSync(seedPath)
    ? (JSON.parse(readFileSync(seedPath, "utf8")) as SeedFile)
    : { works: [] };

  const workMap = new Map<string, SeedWork>();
  for (const w of base.works ?? []) {
    workMap.set(workKey(w), { ...w, scenes: [...w.scenes] });
  }

  let added = 0;
  let skipped = 0;
  let updated = 0;

  for (const w of incoming) {
    const k = workKey(w);
    if (!workMap.has(k)) {
      workMap.set(k, { ...w, scenes: [...w.scenes] });
      added += w.scenes.length;
      continue;
    }
    const existing = workMap.get(k)!;
    if (w.year && !existing.year) existing.year = w.year;
    if (w.wikisource_url) existing.wikisource_url = w.wikisource_url;

    const mergedScenes = mergeSceneLists(existing.scenes, w.scenes);
    existing.scenes = mergedScenes.scenes;
    added += mergedScenes.added;
    skipped += mergedScenes.skipped;
    updated += mergedScenes.updated;
  }

  const works = [...workMap.values()];
  const sceneCount = works.reduce((n, w) => n + w.scenes.length, 0);

  const merged: SeedFile = {
    _meta: {
      ...(base._meta ?? {}),
      generated: new Date().toISOString().slice(0, 10),
      purpose: `Contenu domaine public Côté-Cour : ${works.length} œuvres, ${sceneCount} scènes (works -> scenes -> characters -> lines).`,
      last_wikisource_merge: new Date().toISOString(),
    },
    works,
  };

  writeFileSync(seedPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  return { added, skipped, updated, works: works.length, scenes: sceneCount };
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  let opts: CliOptions;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    const e = err as FetchError;
    log(`❌ ${e.message}`);
    if (e.hint) log(`→  ${e.hint}`);
    process.exit(1);
  }

  const works: SeedWork[] = [];
  const allWarnings: string[] = [];
  const failures: string[] = [];

  for (const input of opts.pages) {
    try {
      const { work, warnings } = await processPage(input, opts);
      works.push(work);
      allWarnings.push(...warnings);
    } catch (err) {
      const e = err as FetchError;
      log(`❌ ${input}`);
      log(`   ${e.message}`);
      if (e.hint) log(`   → ${e.hint}`);
      failures.push(input);
    }
  }

  const merged = mergeWorks(works);
  const totalScenes = merged.reduce((n, w) => n + w.scenes.length, 0);
  const totalCards = merged.reduce((n, w) => n + w.scenes.reduce((m, s) => m + s.lines.length, 0), 0);

  log("");
  if (allWarnings.length > 0) {
    log("⚠️  Avertissements :");
    for (const w of allWarnings) log(`   - ${w}`);
    log("");
  }
  log(`📇 ${merged.length} œuvre(s), ${totalScenes} scène(s), ${totalCards} cartes.`);
  log(`⚠️  reliability: verify_priority — relire chaque texte contre Wikisource avant seed.`);
  if (failures.length > 0) {
    log(`❌ ${failures.length} page(s) en échec : ${failures.join(", ")}`);
  }

  if (merged.length > 0) {
    if (opts.merge) {
      const result = mergeIntoSeedFile(merged);
      log(
        `💾 Fusionné dans cote-cour-seed.json : +${result.added} scène(s), ${result.updated} mise(s) à jour, ${result.skipped} ignorée(s) — ${result.works} œuvres, ${result.scenes} scènes au total.`,
      );
    } else {
      const output = JSON.stringify({ works: merged }, null, 2);
      if (opts.out) {
        writeFileSync(opts.out, `${output}\n`, "utf8");
        log(`💾 Écrit dans ${opts.out}`);
      } else {
        process.stdout.write(`${output}\n`);
      }
    }
  }

  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((err) => {
  log(`❌ Erreur inattendue : ${(err as Error).stack ?? String(err)}`);
  process.exit(1);
});
