/**
 * Côté-Cour — pose la fiche éditoriale d'une ŒUVRE (`works.summary`).
 *
 * Pourquoi. Au 05/08/2026, les 22 œuvres du domaine public avaient toutes
 * `summary = NULL`. Une page œuvre se réduisait donc à un H1, une ligne « N scènes au
 * texte intégral » et un sommaire de liens — c'est-à-dire à strictement moins que ce
 * que propose n'importe quel site de textes. Search Console sur 3 mois le montre sans
 * exception : les pages œuvre sortent entre la position 33 et la position 48…
 *
 *   /scenes/moliere/le-bourgeois-gentilhomme .......... 48
 *   /scenes/moliere/le-malade-imaginaire .............. 44
 *   /scenes/alfred-de-musset/on-ne-badine… ............ 42
 *   /scenes/victor-hugo/ruy-blas ...................... 41
 *   /scenes/moliere/les-fourberies-de-scapin .......... 36,5
 *   /scenes/pierre-corneille/le-cid ................... 36
 *
 * …pendant que les pages scènes des MÊMES œuvres sortent entre 5 et 10. Le palier
 * œuvre est le maillon faible, et c'est précisément celui qui vise les têtes de
 * requête (« les fourberies de scapin », « ruy blas victor hugo », « le cid corneille »).
 *
 * Format. Deux paragraphes séparés par une ligne vide :
 *   1. ce qu'est la pièce — date, forme, intrigue en quelques lignes ;
 *   2. ce qu'on vient y chercher — quelles scènes, pour quel type de travail, à qui
 *      elles s'adressent. C'est ce second paragraphe qui répond à l'intention réelle
 *      (« je dois jouer / apprendre / analyser cette pièce ») et qui n'existe nulle
 *      part ailleurs.
 *
 * Une œuvre dont le catalogue ne contient qu'une ou deux scènes le DIT dans sa fiche.
 * Laisser croire que la pièce entière est disponible se paierait en rebond immédiat,
 * et le rebond est exactement ce qu'on cherche à éviter en écrivant ces fiches.
 *
 * Usage (depuis la racine du repo) :
 *   npx tsx supabase/seed/seed-work-summaries.ts             # dry-run : n'écrit rien
 *   npx tsx supabase/seed/seed-work-summaries.ts --apply     # écrit en base
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createAdminClient, loadEnvLocal } from "./env";

const ROOT = join(import.meta.dirname, "../..");
loadEnvLocal(ROOT);

const APPLY = process.argv.includes("--apply");
const db = createAdminClient();

type Fiche = {
  /** Slug de l'œuvre (works.slug). */
  slug: string;
  /** Les deux paragraphes de la fiche, séparés par une ligne vide. */
  summary: string;
};

const FICHES: Fiche[] = JSON.parse(
  readFileSync(join(import.meta.dirname, "work-summaries.json"), "utf8")
) as Fiche[];

type WorkRow = { id: string; title: string; slug: string; summary: string | null };

const normalize = (text: string) => text.replace(/\r\n/g, "\n").trim();

async function main(): Promise<void> {
  console.log(`${APPLY ? "✍️  ÉCRITURE" : "🔍 DRY-RUN"} — ${FICHES.length} fiche(s) œuvre.\n`);

  let toWrite = 0;
  let unchanged = 0;
  let overwritten = 0;
  const missing: string[] = [];
  const updates: { id: string; summary: string }[] = [];

  for (const fiche of FICHES) {
    const { data, error } = await db
      .from("works")
      .select("id, title, slug, summary")
      .eq("slug", fiche.slug)
      .eq("is_public_domain", true)
      .returns<WorkRow[]>();

    if (error) {
      console.error(`❌ ${fiche.slug} — erreur Supabase : ${error.message}`);
      process.exitCode = 1;
      continue;
    }
    if (!data || data.length === 0) {
      console.log(`⚠️  ${fiche.slug} — œuvre introuvable, ignorée.`);
      missing.push(fiche.slug);
      continue;
    }
    if (data.length > 1) {
      console.log(`⚠️  ${fiche.slug} — ${data.length} œuvres portent ce slug, ignorée.`);
      missing.push(fiche.slug);
      continue;
    }

    const work = data[0]!;
    const next = normalize(fiche.summary);

    if (work.summary && normalize(work.summary) === next) {
      console.log(`＝ ${fiche.slug} — déjà à jour.`);
      unchanged++;
      continue;
    }

    const paragraphs = next.split(/\n\s*\n/).length;
    const words = next.split(/\s+/).length;
    console.log(`→ ${fiche.slug} — « ${work.title} » : ${paragraphs} paragraphes, ${words} mots.`);
    if (work.summary) {
      console.log(`  ⚠️  ÉCRASE la fiche actuelle : « ${normalize(work.summary).slice(0, 100)}… »`);
      overwritten++;
    }
    updates.push({ id: work.id, summary: next });
    toWrite++;
  }

  console.log(
    `\nRésumé : ${toWrite} à écrire (dont ${overwritten} écrasement(s)), ${unchanged} inchangée(s), ${missing.length} introuvable(s).`
  );
  if (missing.length > 0) console.log(`Introuvables : ${missing.join(", ")}`);

  if (!APPLY) {
    console.log("\nDry-run : rien n'a été écrit. Relance avec --apply pour appliquer.");
    return;
  }

  for (const update of updates) {
    const { error } = await db.from("works").update({ summary: update.summary }).eq("id", update.id);
    if (error) {
      console.error(`❌ écriture ${update.id} : ${error.message}`);
      process.exitCode = 1;
    }
  }
  console.log(`\n✅ ${updates.length} fiche(s) écrite(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
