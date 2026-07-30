import { slugify } from "@/lib/utils/slugify";
import type { SceneWithRelations } from "@/types/scenes";

/**
 * Base absolue du site. Domaine canonique = www (le domaine nu 307-redirige) : le
 * fallback doit matcher, sinon toutes les URLs absolues pointent vers un redirect.
 */
export const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.cote-cour.studio").replace(
  /\/$/,
  ""
);

export function absoluteUrl(path: string): string {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Une scène n'a d'URL slug que si elle est publique, rattachée à une œuvre du domaine
 * public, et que la scène ET l'œuvre sont sluggées. Même condition que le sitemap et
 * que les gardes des deux routes /scenes.
 */
export function isEligibleForSlugRoute(scene: SceneWithRelations): boolean {
  return (
    !scene.is_private &&
    scene.work?.is_public_domain === true &&
    !!scene.slug &&
    !!scene.work.slug
  );
}

/** Segment auteur d'une URL de scène ou d'œuvre. */
function authorSegment(scene: Pick<SceneWithRelations, "author" | "work">): string {
  return slugify(scene.author ?? scene.work?.author ?? "");
}

/** Chemin canonique de la page œuvre, ou null si la scène n'est pas éligible. */
export function workPathForScene(scene: SceneWithRelations): string | null {
  if (!isEligibleForSlugRoute(scene)) return null;
  return `/scenes/${authorSegment(scene)}/${scene.work!.slug}`;
}

/** Chemin canonique de la page scène, ou null si la scène n'est pas éligible. */
export function scenePathFor(scene: SceneWithRelations): string | null {
  const workPath = workPathForScene(scene);
  return workPath ? `${workPath}/${scene.slug}` : null;
}
