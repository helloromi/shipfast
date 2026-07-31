#!/usr/bin/env tsx
/**
 * Côté-Cour — prépare le bloc de liens d'un mail de prospection.
 *
 * Le goulot d'un mail personnalisé n'est pas l'écriture, c'est la recherche : aller
 * vérifier qu'on a bien la pièce que le cours monte cette saison, retrouver l'URL de
 * la page œuvre, choisir deux ou trois scènes qui vont à leur distribution, vérifier
 * qu'aucun lien n'est mort. Dix minutes par contact, dix contacts par semaine.
 *
 * Ce script fait ça en une commande, à partir de la base réelle. Il ne rédige pas le
 * mail — les modèles sont dans PROSPECTION.md — il produit la partie qui demande de
 * la vérification.
 *
 * Usage (depuis la racine du repo) :
 *   npm run prospection -- "Le Malade imaginaire"     # une pièce qu'ils montent
 *   npm run prospection -- --duo                       # ils cherchent des duos
 *   npm run prospection -- --trio --court              # trios courts
 *   npm run prospection -- --femmes                    # distribution féminine
 *   npm run prospection -- --catalogue                 # état du catalogue, pour se repérer
 *
 * Options de sélection cumulables : --duo --trio --court --femmes --hommes
 *                                   --comique --tragique
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

/** Charge .env.local sans écraser l'environnement existant. */
function loadEnvLocal(): void {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}
loadEnvLocal();

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.cote-cour.studio").replace(/\/$/, "");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY requis (.env.local).");
  process.exit(1);
}
// Clé anon : on ne lit que du catalogue public, comme le site lui-même.
const db = createClient(url, key, { auth: { persistSession: false } });

const slugify = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const deaccent = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/** Prénoms/rôles féminins du répertoire présent au catalogue, pour filtrer une distribution. */
const FEMININS = new Set([
  "PHÈDRE", "ŒNONE", "ANDROMAQUE", "HERMIONE", "CLÉONE", "CÉPHISE", "BÉRÉNICE", "PHÉNICE",
  "AGRIPPINE", "JUNIE", "ALBINE", "ANGÉLIQUE", "TOINETTE", "BÉLINE", "CHIMÈNE", "ELVIRE",
  "LÉONOR", "L’INFANTE", "ARSINOÉ", "CÉLIMÈNE", "ÉLIANTE", "MARTINE", "JACQUELINE",
  "GEORGETTE", "PANOPE", "CAMILLE", "MARIANNE", "DORINE", "AGNÈS", "DOÑA SOL", "SILVIA",
  "LISETTE", "NÉRINE", "ZERBINETTE", "HYACINTE", "FROSINE", "ÉLISE", "MARIANE", "CIUTA",
]);

const COMIQUE = new Set(["Molière", "Marivaux", "Beaumarchais"]);
const TRAGIQUE = new Set(["Jean Racine", "Pierre Corneille"]);

/** Collections éditoriales à joindre selon ce que cherche l'interlocuteur. */
const COLLECTIONS: Record<string, string> = {
  duo: "/ressources/scenes-a-deux-personnages",
  trio: "/ressources/scenes-de-theatre-a-3-personnages",
  court: "/ressources/scenes-de-theatre-courtes",
  femmes: "/ressources/scenes-de-theatre-deux-femmes",
  hommes: "/ressources/scenes-de-theatre-deux-hommes",
  comique: "/ressources/scenes-de-theatre-comiques",
  tragique: "/ressources/scenes-de-tragedie-classique",
};

type Row = {
  title: string;
  slug: string;
  author: string | null;
  summary: string | null;
  characters: { name: string }[];
  lines: { text: string | null }[];
  works: { slug: string; title: string; author: string | null };
};

type Scene = {
  title: string; work: string; author: string; path: string;
  cast: string[]; lineCount: number; charCount: number;
};

async function fetchScenes(): Promise<Scene[]> {
  const { data, error } = await db
    .from("scenes")
    .select("title, slug, author, summary, characters(name), lines(text), works!inner(slug, title, author, is_public_domain)")
    .eq("is_private", false)
    .eq("works.is_public_domain", true)
    .not("slug", "is", null)
    .returns<Row[]>();
  if (error) {
    console.error(`Lecture Supabase impossible : ${error.message}`);
    process.exit(1);
  }
  return (data ?? []).map((s) => ({
    title: s.title,
    work: s.works.title,
    author: s.works.author ?? s.author ?? "",
    path: `/scenes/${slugify(s.author ?? s.works.author ?? "")}/${s.works.slug}/${s.slug}`,
    cast: s.characters.map((c) => c.name),
    lineCount: s.lines.length,
    charCount: s.lines.reduce((n, l) => n + (l.text?.length ?? 0), 0),
  }));
}

/** ~1 000 caractères dits par minute : ordre de grandeur pour situer, pas une mesure. */
const minutes = (charCount: number) => Math.max(1, Math.round(charCount / 1000));

function describe(scene: Scene): string {
  return `  ${BASE}${scene.path}\n     ${scene.work} — ${scene.title} · ${scene.cast.join(" / ")} · ${scene.lineCount} répliques, ~${minutes(scene.charCount)} min`;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2)));
  const query = args.filter((a) => !a.startsWith("--")).join(" ").trim();
  const scenes = await fetchScenes();

  if (flags.has("catalogue") || (!query && flags.size === 0)) {
    const byWork = new Map<string, Scene[]>();
    for (const s of scenes) byWork.set(s.work, [...(byWork.get(s.work) ?? []), s]);
    console.log(`Catalogue : ${scenes.length} scènes, ${byWork.size} œuvres.\n`);
    for (const [work, list] of [...byWork].sort((a, b) => b[1].length - a[1].length)) {
      const path = list[0]!.path.split("/").slice(0, 4).join("/");
      console.log(`  ${String(list.length).padStart(3)} scènes  ${work.padEnd(30)} ${BASE}${path}`);
    }
    console.log("\nUsage : npm run prospection -- \"Le Cid\"   ou   npm run prospection -- --duo --court");
    return;
  }

  let selection = scenes;
  let heading: string;

  if (query) {
    const q = deaccent(query);
    selection = scenes.filter((s) => deaccent(s.work).includes(q) || deaccent(s.author).includes(q));
    if (selection.length === 0) {
      console.error(`Aucune œuvre ni auteur ne correspond à « ${query} ».`);
      console.error("Lance `npm run prospection -- --catalogue` pour voir ce qui existe.");
      process.exit(1);
    }
    const works = [...new Set(selection.map((s) => s.work))];
    heading = works.length === 1 ? works[0]! : `${query} (${works.join(", ")})`;
  } else {
    heading = [...flags].join(" + ");
  }

  // Filtres de distribution, cumulables.
  if (flags.has("duo")) selection = selection.filter((s) => s.cast.length === 2);
  if (flags.has("trio")) selection = selection.filter((s) => s.cast.length === 3);
  if (flags.has("court")) selection = selection.filter((s) => s.charCount <= 2600);
  if (flags.has("femmes")) selection = selection.filter((s) => s.cast.length > 1 && s.cast.every((c) => FEMININS.has(c)));
  if (flags.has("hommes")) selection = selection.filter((s) => s.cast.length > 1 && s.cast.every((c) => !FEMININS.has(c)));
  if (flags.has("comique")) selection = selection.filter((s) => COMIQUE.has(s.author));
  if (flags.has("tragique")) selection = selection.filter((s) => TRAGIQUE.has(s.author));

  if (selection.length === 0) {
    console.error("Aucune scène ne correspond à cette combinaison de filtres.");
    process.exit(1);
  }

  // Les plus substantielles d'abord : ce sont celles qui donnent envie en un coup d'œil.
  const shown = [...selection].sort((a, b) => b.charCount - a.charCount).slice(0, 6);

  console.log(`\n─── ${heading} — ${selection.length} scène(s) au catalogue ───\n`);
  if (query) {
    const first = selection[0]!;
    console.log(`Page de l'œuvre (toutes les scènes) :\n  ${BASE}${first.path.split("/").slice(0, 4).join("/")}\n`);
  }
  console.log("Scènes à citer :");
  for (const s of shown) console.log(describe(s));

  const collections = [...flags].filter((f) => f in COLLECTIONS);
  if (collections.length > 0) {
    console.log("\nSélections thématiques à joindre :");
    for (const c of collections) console.log(`  ${BASE}${COLLECTIONS[c]}`);
  }
  console.log(`\nÀ joindre systématiquement :\n  ${BASE}/ressources/comment-choisir-une-scene-pour-un-cours-de-theatre`);
  console.log(`  ${BASE}/ressources/texte-de-theatre-libre-de-droits`);
  console.log("\nTout le catalogue est gratuit et sans compte. Reporter le contact dans PROSPECTION.md.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
