/**
 * Côté-Cour — vérifie que les liens de scènes des pages /ressources pointent tous
 * vers une URL canonique vivante.
 *
 * Pourquoi. Les pages éditoriales codent leurs `href` en dur, et c'est volontaire :
 * elles sont prérendues au build, sans I/O. Le revers est qu'un re-sluguage ou une
 * déduplication côté base les périme en silence. Ce n'est pas théorique — le
 * 30/07/2026, deux liens sont devenus des redirections dans la même journée :
 * `phedre/acte-i-scene-3` (scène dédupliquée) et `le-mariage-de-figaro/acte-v-scene-3`
 * (slug renommé après re-sourcing). Ces pages sont notre seul maillage vers les
 * œuvres à scène unique : un lien qui part en 308 y coûte cher, et c'est exactement
 * le défaut F4 relevé par l'audit.
 *
 * Le script ne corrige rien : il signale, et propose le slug canonique quand
 * l'ancien est retrouvé dans `previous_slugs`.
 *
 * Usage (depuis la racine du repo) :
 *   npx tsx supabase/seed/check-ressource-links.ts
 *
 * Sort en code 1 si au moins un lien est mort ou redirigé — utilisable en pre-push.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { slugify } from "@/lib/utils/slugify";
import { createAdminClient, loadEnvLocal } from "./env";

const ROOT = join(import.meta.dirname, "../..");
loadEnvLocal(ROOT);

const CONTENT_DIR = join(ROOT, "src/content/ressources");
const db = createAdminClient();

type SceneRow = {
  slug: string;
  author: string | null;
  previous_slugs: string[] | null;
  works: { slug: string | null; author: string | null } | null;
};

/** Chemin canonique d'une scène, construit comme @/lib/seo/urls le fait côté app. */
function canonicalPath(scene: SceneRow): string | null {
  const workSlug = scene.works?.slug;
  if (!workSlug || !scene.slug) return null;
  return `/scenes/${slugify(scene.author ?? scene.works?.author ?? "")}/${workSlug}/${scene.slug}`;
}

/** Tous les liens /scenes/... trouvés dans les fichiers de contenu éditorial. */
function collectHrefs(): Map<string, string[]> {
  const byHref = new Map<string, string[]>();
  for (const file of readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".tsx"))) {
    const source = readFileSync(join(CONTENT_DIR, file), "utf8");
    for (const match of source.matchAll(/"(\/scenes\/[a-z0-9\-/]+)"/g)) {
      const href = match[1]!;
      byHref.set(href, [...(byHref.get(href) ?? []), file]);
    }
  }
  return byHref;
}

async function main(): Promise<void> {
  const hrefs = collectHrefs();

  const { data, error } = await db
    .from("scenes")
    .select("slug, author, previous_slugs, works!inner(slug, author, is_public_domain)")
    .eq("is_private", false)
    .eq("works.is_public_domain", true)
    .not("slug", "is", null)
    .returns<SceneRow[]>();

  if (error) {
    console.error(`❌ lecture Supabase : ${error.message}`);
    process.exit(1);
  }

  const live = new Set<string>();
  // Index des anciens slugs → chemin canonique actuel, pour proposer le remplacement.
  const movedTo = new Map<string, string>();
  for (const scene of data ?? []) {
    const path = canonicalPath(scene);
    if (!path) continue;
    live.add(path);
    const workSlug = scene.works?.slug;
    const authorSlug = slugify(scene.author ?? scene.works?.author ?? "");
    for (const previous of scene.previous_slugs ?? []) {
      movedTo.set(`/scenes/${authorSlug}/${workSlug}/${previous}`, path);
    }
  }

  const broken: string[] = [];
  for (const [href, files] of [...hrefs].sort()) {
    if (live.has(href)) continue;
    broken.push(href);
    const suggestion = movedTo.get(href);
    console.log(`✗ ${href}`);
    console.log(`    cité par : ${files.join(", ")}`);
    console.log(
      suggestion
        ? `    → renommée, remplacer par : ${suggestion}`
        : `    → introuvable en base (scène supprimée, dépubliée, ou slug d'auteur/œuvre changé)`
    );
  }

  console.log(
    `\n${hrefs.size} lien(s) de scène dans /ressources — ${hrefs.size - broken.length} valide(s), ${broken.length} à corriger.`
  );
  if (broken.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
