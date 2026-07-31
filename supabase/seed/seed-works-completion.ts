/**
 * Côté-Cour — complète les œuvres qui n'avaient qu'une scène au catalogue.
 *
 * Pourquoi. Cinq œuvres ne portaient qu'un seul extrait — Cyrano, Ruy Blas, Hernani,
 * Horace, Le Jeu de l'amour et du hasard — alors que Cyrano est le titre le plus
 * recherché du théâtre français. Une œuvre à une scène n'a pas de scènes sœurs, donc
 * pas de maillage interne : sa page dépendait entièrement des pages /ressources.
 *
 * Source : Wikisource, un fichier d'acte par acte (cf. works-completion.json, généré
 * par supabase/seed/wikisource-fetch.ts). Structures collationnées contre les pièces
 * réelles : Cyrano 7/11/14/10/6, Ruy Blas 5/5/5/8/4, Hernani 4/4/7/5/6,
 * Horace 3/8/6/7/3, Le Jeu de l'amour 10/13/9. Aucun acte manquant.
 *
 * Convention de titre. Acte en chiffres romains, scène en chiffres arabes —
 * « Acte III, scène 2 » — pour coller aux scènes déjà en base sur ces cinq œuvres.
 * Wikisource mélange les formes (« Scène II », « Scène Deuxième », « Scène première »),
 * toutes normalisées à la génération. Sans ça on recrée le mélange arabe/romain qui a
 * produit les doublons de juillet.
 *
 * Usage (depuis la racine du repo) :
 *   npx tsx supabase/seed/seed-works-completion.ts             # dry-run
 *   npx tsx supabase/seed/seed-works-completion.ts --apply     # écrit en base
 *
 * Idempotent : une scène dont le titre existe déjà dans son œuvre est sautée, jamais
 * dupliquée ni écrasée. Les slugs ne sont PAS posés ici — lancer ensuite
 * `npm run backfill:scene-slugs` (dry-run puis --apply), qui utilise le slugify
 * partagé avec le code applicatif.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createAdminClient, loadEnvLocal } from "./env";

const ROOT = join(import.meta.dirname, "../..");
loadEnvLocal(ROOT);

const APPLY = process.argv.includes("--apply");
const db = createAdminClient();

type SeedLine = { order: number; character: string; text: string };
type SeedScene = { title: string; chapter: string | null; characters: string[]; lines: SeedLine[] };
type SeedWork = { title: string; author: string; scenes: SeedScene[] };

const { works } = JSON.parse(
  readFileSync(join(import.meta.dirname, "works-completion.json"), "utf8")
) as { works: SeedWork[] };

async function insertScene(workId: string, work: SeedWork, scene: SeedScene): Promise<number> {
  const { data: sceneRow, error: sceneError } = await db
    .from("scenes")
    .insert({
      work_id: workId,
      author: work.author,
      title: scene.title,
      chapter: scene.chapter,
      is_private: false,
    })
    .select("id")
    .single<{ id: string }>();
  if (sceneError || !sceneRow) throw new Error(`scène "${scene.title}" : ${sceneError?.message}`);

  const idByName = new Map<string, string>();
  for (const name of scene.characters) {
    const { data: charRow, error: charError } = await db
      .from("characters")
      .insert({ scene_id: sceneRow.id, name })
      .select("id")
      .single<{ id: string }>();
    if (charError || !charRow) throw new Error(`personnage "${name}" : ${charError?.message}`);
    idByName.set(name, charRow.id);
  }

  const rows = scene.lines
    .filter((line) => idByName.has(line.character))
    .map((line) => ({
      scene_id: sceneRow.id,
      character_id: idByName.get(line.character)!,
      order: line.order,
      text: line.text,
    }));
  const { error: linesError } = await db.from("lines").insert(rows);
  if (linesError) throw new Error(`répliques de "${scene.title}" : ${linesError.message}`);
  return rows.length;
}

async function main(): Promise<void> {
  console.log(`${APPLY ? "✍️  ÉCRITURE" : "🔍 DRY-RUN"} — ${works.length} œuvre(s).\n`);

  let toInsert = 0;
  let alreadyThere = 0;
  let linesWritten = 0;

  for (const work of works) {
    // L'œuvre doit exister : ce script complète, il ne crée pas d'œuvre. Une œuvre
    // absente signalerait un écart de titre (apostrophe typographique, accent) qui
    // créerait un doublon silencieux — on préfère s'arrêter.
    const { data: workRows, error: workError } = await db
      .from("works")
      .select("id, title")
      .eq("title", work.title)
      .eq("author", work.author)
      .returns<{ id: string; title: string }[]>();
    if (workError) throw new Error(`lecture œuvre "${work.title}" : ${workError.message}`);
    if (!workRows || workRows.length !== 1) {
      console.error(
        `❌ ${work.title} — ${workRows?.length ?? 0} œuvre(s) trouvée(s) pour (titre, auteur). Vérifier l'orthographe exacte avant d'insérer.`
      );
      process.exitCode = 1;
      continue;
    }
    const workId = workRows[0]!.id;

    const { data: existing } = await db
      .from("scenes")
      .select("title")
      .eq("work_id", workId)
      .returns<{ title: string }[]>();
    const existingTitles = new Set((existing ?? []).map((s) => s.title));

    const missing = work.scenes.filter((s) => !existingTitles.has(s.title));
    const present = work.scenes.length - missing.length;
    alreadyThere += present;
    toInsert += missing.length;

    console.log(
      `${work.title} — ${missing.length} à insérer, ${present} déjà présente(s), ${existingTitles.size} scène(s) en base.`
    );

    if (!APPLY) continue;
    for (const scene of missing) {
      linesWritten += await insertScene(workId, work, scene);
    }
  }

  console.log(`\nRésumé : ${toInsert} scène(s) à insérer, ${alreadyThere} déjà présente(s).`);
  if (!APPLY) {
    console.log("\nDry-run : rien n'a été écrit. Relance avec --apply.");
    return;
  }
  console.log(`✅ ${toInsert} scène(s) et ${linesWritten} réplique(s) écrites.`);
  console.log("→ Lancer maintenant `npm run backfill:scene-slugs` pour poser les slugs.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
