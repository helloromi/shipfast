/**
 * Côté-Cour — pose la fiche éditoriale (`scenes.summary`) sur les scènes du catalogue.
 *
 * Pourquoi. Le corps d'une page scène, c'est le texte de la scène : un texte du domaine
 * public disponible mot pour mot sur Wikisource, toutlemoliere.net et theatre-classique.fr.
 * Sans couche éditoriale, nos 190 pages sont 190 doublons et rien ne justifie qu'un moteur
 * nous préfère à la source. La fiche est le seul contenu de la page qui n'existe nulle part
 * ailleurs. Elle alimente trois endroits d'un coup : le corps de la page
 * (src/components/scenes/scene-detail-view.tsx), la `description` du JSON-LD CreativeWork
 * (src/lib/seo/json-ld.ts), et le verdict d'indexation des scènes courtes
 * (src/lib/seo/thin-scenes.ts — une scène qui porte une fiche n'est jamais « mince »).
 *
 * Format. Trois paragraphes séparés par une ligne vide, dans cet ordre :
 *   1. la situation — où on en est dans la pièce, qui parle à qui, pourquoi ;
 *   2. ce qui se joue — l'enjeu dramatique, ce que le comédien doit tenir ;
 *   3. pour l'apprendre — volume, vers ou prose, difficulté, à qui la scène s'adresse.
 * Le troisième paragraphe est ce qui nous distingue vraiment d'un site de textes : il
 * répond à l'intention « je dois jouer ou apprendre cette scène », pas « je veux la lire ».
 *
 * Usage (depuis la racine du repo) :
 *   npx tsx supabase/seed/seed-scene-summaries.ts             # dry-run : n'écrit rien
 *   npx tsx supabase/seed/seed-scene-summaries.ts --apply     # écrit en base
 *
 * Le script n'écrase jamais une fiche existante sans le dire : il affiche l'ancienne et la
 * nouvelle, et ne remplace que sous --apply. Une scène introuvable est signalée, pas créée.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createAdminClient, loadEnvLocal } from "./env";

const ROOT = join(import.meta.dirname, "../..");
loadEnvLocal(ROOT);

const APPLY = process.argv.includes("--apply");
const db = createAdminClient();

/**
 * Les fiches vivent dans scene-summaries.json et non dans ce fichier : à 200 entrées
 * de 150 mots, un tableau TypeScript devient illisible et impossible à régénérer.
 * Le JSON est la source, ce script n'est que l'applicateur.
 */
type Fiche = {
  /** Slug de l'œuvre (works.slug). */
  workSlug: string;
  /** Slug de la scène (scenes.slug), unique dans son œuvre. */
  slug: string;
  /** Les trois paragraphes de la fiche, séparés par une ligne vide. */
  summary: string;
};

const FICHES: Fiche[] = JSON.parse(
  readFileSync(join(import.meta.dirname, "scene-summaries.json"), "utf8")
) as Fiche[];

type SceneRow = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  works: { slug: string } | null;
};

/** Normalise pour comparer deux fiches sans se faire piéger par les fins de ligne. */
const normalize = (text: string) => text.replace(/\r\n/g, "\n").trim();

async function main(): Promise<void> {
  console.log(
    `${APPLY ? "✍️  ÉCRITURE" : "🔍 DRY-RUN"} — ${FICHES.length} fiche(s) à poser.\n`
  );

  let toWrite = 0;
  let unchanged = 0;
  let overwritten = 0;
  const missing: string[] = [];
  const updates: { id: string; summary: string }[] = [];

  for (const fiche of FICHES) {
    const { data, error } = await db
      .from("scenes")
      .select("id, title, slug, summary, works!inner(slug)")
      .eq("slug", fiche.slug)
      .eq("works.slug", fiche.workSlug)
      .eq("is_private", false)
      .returns<SceneRow[]>();

    if (error) {
      console.error(`❌ ${fiche.workSlug}/${fiche.slug} — erreur Supabase : ${error.message}`);
      process.exitCode = 1;
      continue;
    }
    if (!data || data.length === 0) {
      console.log(`⚠️  ${fiche.workSlug}/${fiche.slug} — scène introuvable, ignorée.`);
      missing.push(`${fiche.workSlug}/${fiche.slug}`);
      continue;
    }
    if (data.length > 1) {
      console.log(
        `⚠️  ${fiche.workSlug}/${fiche.slug} — ${data.length} scènes portent ce couple (slug, œuvre), ignorée.`
      );
      missing.push(`${fiche.workSlug}/${fiche.slug}`);
      continue;
    }

    const scene = data[0]!;
    const next = normalize(fiche.summary);
    const current = scene.summary ? normalize(scene.summary) : null;

    if (current === next) {
      console.log(`＝ ${fiche.workSlug}/${fiche.slug} — déjà à jour.`);
      unchanged++;
      continue;
    }

    const paragraphs = next.split(/\n\s*\n/).length;
    const words = next.split(/\s+/).length;
    console.log(`→ ${fiche.workSlug}/${fiche.slug} — « ${scene.title} »`);
    console.log(`  ${paragraphs} paragraphes, ${words} mots.`);
    if (current) {
      // On ne remplace jamais une fiche existante en silence.
      console.log(`  ⚠️  ÉCRASE la fiche actuelle : « ${current.slice(0, 120)}… »`);
      overwritten++;
    }
    updates.push({ id: scene.id, summary: next });
    toWrite++;
  }

  console.log(
    `\nRésumé : ${toWrite} à écrire (dont ${overwritten} écrasement(s)), ${unchanged} inchangée(s), ${missing.length} introuvable(s).`
  );

  if (missing.length > 0) {
    console.log(`Introuvables : ${missing.join(", ")}`);
  }

  if (!APPLY) {
    console.log("\nDry-run : rien n'a été écrit. Relance avec --apply pour appliquer.");
    return;
  }

  for (const update of updates) {
    const { error } = await db
      .from("scenes")
      .update({ summary: update.summary })
      .eq("id", update.id);
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
