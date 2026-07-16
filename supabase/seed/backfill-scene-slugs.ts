/**
 * Côté-Cour — génère les slugs des œuvres et scènes publiques du domaine public,
 * pour les URLs /scenes/[auteur]/[piece]/[scene].
 *
 * Usage (depuis la racine du repo) :
 *   npm run backfill:scene-slugs            # dry-run : affiche le mapping, n'écrit rien
 *   npm run backfill:scene-slugs -- --apply  # écrit en base (uniquement les slugs encore null)
 *
 * Le script charge automatiquement .env.local (pas besoin de source).
 * Prérequis : NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 */

import { join } from "node:path";

import { slugify } from "@/lib/utils/slugify";
import { createAdminClient, loadEnvLocal } from "./env";

const ROOT = join(import.meta.dirname, "../..");
loadEnvLocal(ROOT);

// ─────────────────────────────────────────────────────────────
// CONFIG — À ADAPTER à ton schéma réel (cf. supabase/seed/seed-scenes.ts)
// ─────────────────────────────────────────────────────────────
const CONFIG = {
  tables: {
    works: "works",
    scenes: "scenes",
  },
  cols: {
    work: { title: "title", author: "author", isPublic: "is_public_domain", slug: "slug" },
    scene: {
      title: "title",
      chapter: "chapter",
      author: "author",
      workId: "work_id",
      isPrivate: "is_private",
      slug: "slug",
    },
  },
  // Portée du backfill : uniquement les scènes publiques rattachées à une œuvre
  // du domaine public (même filtre que sitemap.xml). Les copies privées, imports
  // perso et scènes payantes gardent slug = null (jamais résolues par cette URL).
  scope: {
    sceneIsPrivate: false,
    workIsPublicDomain: true,
  },
};

const APPLY = process.argv.includes("--apply");

const db = createAdminClient();

type WorkRow = { id: string; title: string; author: string | null; slug: string | null };
type SceneRow = {
  id: string;
  title: string;
  chapter: string | null;
  author: string | null;
  work_id: string;
  slug: string | null;
};

/**
 * Attribue un slug unique à chaque ligne, en dédupliquant par suffixe -2, -3…
 * contre les slugs déjà pris (en base + déjà assignés dans ce batch).
 * Ne touche pas les lignes qui ont déjà un slug.
 */
function assignSlugs<T extends { id: string; slug: string | null }>(
  rows: T[],
  baseSlugFor: (row: T) => string,
  alreadyTaken: Set<string>
): { id: string; slug: string; base: string; collided: boolean }[] {
  const assignments: { id: string; slug: string; base: string; collided: boolean }[] = [];

  for (const row of rows) {
    if (row.slug) continue; // déjà posé, idempotent : on ne réassigne jamais un slug existant.

    const base = baseSlugFor(row);
    let candidate = base;
    let suffix = 2;
    let collided = false;
    while (alreadyTaken.has(candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
      collided = true;
    }

    alreadyTaken.add(candidate);
    assignments.push({ id: row.id, slug: candidate, base, collided });
  }

  return assignments;
}

async function main() {
  const C = CONFIG.cols;
  const T = CONFIG.tables;

  console.log(APPLY ? "Mode APPLICATION (écriture en base)\n" : "Mode DRY-RUN (aucune écriture)\n");

  // ── Œuvres : toutes, pour garder les slugs stables même si le catalogue change. ──
  const { data: works, error: worksError } = await db
    .from(T.works)
    .select(`id, ${C.work.title}, ${C.work.author}, ${C.work.slug}`)
    .returns<WorkRow[]>();
  if (worksError) throw new Error(`Chargement des œuvres : ${worksError.message}`);

  const takenWorkSlugs = new Set((works ?? []).map((w) => w.slug).filter((s): s is string => !!s));
  const workAssignments = assignSlugs(works ?? [], (w) => slugify(w.title), takenWorkSlugs);

  console.log(`Œuvres : ${works?.length ?? 0} chargées, ${workAssignments.length} slug(s) à poser.`);
  for (const a of workAssignments) {
    const work = works!.find((w) => w.id === a.id)!;
    console.log(`  ${a.collided ? "⚠" : "✓"} ${work.title} (${work.author ?? "auteur inconnu"}) → ${a.slug}`);
  }

  // ── Scènes : uniquement publiques + œuvre du domaine public (portée SEO). ──
  const { data: scenes, error: scenesError } = await db
    .from(T.scenes)
    .select(`id, ${C.scene.title}, ${C.scene.chapter}, ${C.scene.author}, ${C.scene.workId}, ${C.scene.slug}, works!inner(${C.work.isPublic})`)
    .eq(C.scene.isPrivate, CONFIG.scope.sceneIsPrivate)
    .not(C.scene.workId, "is", null)
    .eq(`works.${C.work.isPublic}`, CONFIG.scope.workIsPublicDomain)
    .returns<(SceneRow & { works: { is_public_domain: boolean } })[]>();
  if (scenesError) throw new Error(`Chargement des scènes : ${scenesError.message}`);

  // Dédup PAR ŒUVRE : le slug de scène n'a besoin d'être unique que dans son
  // œuvre (la route résout par (works.slug, scenes.slug), contrainte composite
  // (work_id, slug)). On maintient un Set de slugs pris par work_id, initialisé
  // avec les slugs déjà en base pour cette œuvre.
  // Le titre est bien plus spécifique que le chapitre (ex. "Acte I, Scène I" vs
  // simplement "Acte I") : on l'utilise comme base pour minimiser les collisions.
  const scenesByWork = new Map<string, SceneRow[]>();
  for (const s of scenes ?? []) {
    const arr = scenesByWork.get(s.work_id) ?? [];
    arr.push(s);
    scenesByWork.set(s.work_id, arr);
  }

  const sceneAssignments: ReturnType<typeof assignSlugs> = [];
  for (const [, workScenes] of scenesByWork) {
    const takenForWork = new Set(workScenes.map((s) => s.slug).filter((s): s is string => !!s));
    sceneAssignments.push(...assignSlugs(workScenes, (s) => slugify(s.title), takenForWork));
  }

  console.log(`\nScènes (publiques, domaine public) : ${scenes?.length ?? 0} chargées, ${sceneAssignments.length} slug(s) à poser.`);
  for (const a of sceneAssignments) {
    const scene = scenes!.find((s) => s.id === a.id)!;
    console.log(`  ${a.collided ? "⚠" : "✓"} ${scene.title} (${scene.author ?? "auteur inconnu"}) → ${a.slug}`);
  }

  const workCollisions = workAssignments.filter((a) => a.collided).length;
  const sceneCollisions = sceneAssignments.filter((a) => a.collided).length;
  console.log(`\nCollisions résolues par suffixe : ${workCollisions} œuvre(s), ${sceneCollisions} scène(s).`);

  if (!APPLY) {
    console.log("\nDry-run terminé, rien n'a été écrit. Relancer avec --apply pour appliquer.");
    return;
  }

  for (const a of workAssignments) {
    const { error } = await db.from(T.works).update({ [C.work.slug]: a.slug }).eq("id", a.id).is(C.work.slug, null);
    if (error) throw new Error(`Écriture slug œuvre ${a.id} : ${error.message}`);
  }
  for (const a of sceneAssignments) {
    const { error } = await db.from(T.scenes).update({ [C.scene.slug]: a.slug }).eq("id", a.id).is(C.scene.slug, null);
    if (error) throw new Error(`Écriture slug scène ${a.id} : ${error.message}`);
  }

  console.log(`\nAppliqué : ${workAssignments.length} œuvre(s) + ${sceneAssignments.length} scène(s) mises à jour.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
