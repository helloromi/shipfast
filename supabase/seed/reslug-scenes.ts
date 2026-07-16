/**
 * Côté-Cour — re-sluguage des scènes existantes SANS suffixe numérique arbitraire.
 *
 * L'ancienne unicité globale sur scenes.slug forçait des suffixes -2/-3… sur 56%
 * des scènes (dépendants de l'ordre d'insertion). Depuis que la route résout par
 * (œuvre, slug) et que l'unicité est composite (work_id, slug), le slug peut
 * redevenir propre : slugify(titre), dédupliqué UNIQUEMENT dans son œuvre.
 *
 * Ce script recalcule le slug de chaque scène publique du domaine public et,
 * lorsqu'il change, archive l'ancien slug dans previous_slugs (pour les 301 servis
 * par la route). Il utilise la même fonction slugify() que le code applicatif :
 * le slug écrit en base doit matcher au caractère près le canonical calculé côté
 * route — c'est pourquoi ce re-sluguage est un script TS et non une migration SQL.
 *
 * Prérequis : la migration 20260716120000_reslug_scenes_per_work.sql doit être
 * appliquée (colonne previous_slugs + unicité composite). Idempotent : relancé
 * après application, il ne détecte plus aucun changement.
 *
 * Usage (depuis la racine du repo) :
 *   npm run reslug:scene-slugs             # dry-run : affiche le mapping, n'écrit rien
 *   npm run reslug:scene-slugs -- --apply  # écrit en base
 */

import { join } from "node:path";

import { slugify } from "@/lib/utils/slugify";
import { createAdminClient, loadEnvLocal } from "./env";

const ROOT = join(import.meta.dirname, "../..");
loadEnvLocal(ROOT);

const APPLY = process.argv.includes("--apply");
const db = createAdminClient();

type SceneRow = {
  id: string;
  title: string;
  work_id: string;
  slug: string;
  previous_slugs: string[] | null;
};

type Change = {
  id: string;
  title: string;
  oldSlug: string;
  newSlug: string;
  previousSlugs: string[];
};

async function main() {
  console.log(APPLY ? "Mode APPLICATION (écriture en base)\n" : "Mode DRY-RUN (aucune écriture)\n");

  // Portée identique au backfill et au sitemap : scènes publiques rattachées à
  // une œuvre du domaine public, qui ont déjà un slug à corriger.
  const { data: scenes, error } = await db
    .from("scenes")
    .select("id, title, work_id, slug, previous_slugs, works!inner(is_public_domain)")
    .eq("is_private", false)
    .not("work_id", "is", null)
    .not("slug", "is", null)
    .eq("works.is_public_domain", true)
    .returns<(SceneRow & { works: { is_public_domain: boolean } })[]>();
  if (error) throw new Error(`Chargement des scènes : ${error.message}`);

  // Groupement par œuvre, ordre déterministe (titre puis id) pour que le choix
  // "qui garde le slug nu / qui prend un suffixe" soit stable entre exécutions.
  const scenesByWork = new Map<string, SceneRow[]>();
  for (const s of scenes ?? []) {
    const arr = scenesByWork.get(s.work_id) ?? [];
    arr.push(s);
    scenesByWork.set(s.work_id, arr);
  }

  const changes: Change[] = [];
  for (const [, workScenes] of scenesByWork) {
    workScenes.sort((a, b) => a.title.localeCompare(b.title, "fr") || a.id.localeCompare(b.id));

    const taken = new Set<string>();
    for (const s of workScenes) {
      const base = slugify(s.title);
      let candidate = base;
      let suffix = 2;
      while (taken.has(candidate)) {
        candidate = `${base}-${suffix}`;
        suffix += 1;
      }
      taken.add(candidate);

      if (candidate === s.slug) continue; // déjà propre, rien à faire.

      // On archive l'ancien slug (dédupliqué) pour servir la 301.
      const previousSlugs = Array.from(new Set([...(s.previous_slugs ?? []), s.slug]));
      changes.push({ id: s.id, title: s.title, oldSlug: s.slug, newSlug: candidate, previousSlugs });
    }
  }

  console.log(`Scènes chargées : ${scenes?.length ?? 0}. À re-sluguer : ${changes.length}.\n`);
  for (const c of changes) {
    console.log(`  ${c.oldSlug}  →  ${c.newSlug}   (${c.title})`);
  }

  if (!APPLY) {
    console.log("\nDry-run terminé, rien n'a été écrit. Relancer avec --apply pour appliquer.");
    return;
  }

  for (const c of changes) {
    const { error: updErr } = await db
      .from("scenes")
      .update({ slug: c.newSlug, previous_slugs: c.previousSlugs })
      .eq("id", c.id);
    if (updErr) throw new Error(`Écriture slug scène ${c.id} (${c.newSlug}) : ${updErr.message}`);
  }

  console.log(`\nAppliqué : ${changes.length} scène(s) re-sluguée(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
