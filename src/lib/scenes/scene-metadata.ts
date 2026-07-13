import type { Metadata } from "next";

import { SceneWithRelations } from "@/types/scenes";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Metadata SEO d'une page scène, partagée entre la route UUID (/scenes/[identifiant],
 * qui redirige les scènes publiques du domaine public) et la route slug
 * (/scenes/[auteur]/[piece]/[scene], la seule indexée pour ces scènes-là).
 */
export function buildSceneMetadata(scene: SceneWithRelations, canonicalPath: string): Metadata {
  // Les scènes privées ou rattachées à une œuvre hors domaine public
  // ne doivent pas être indexées.
  if (scene.is_private || scene.work?.is_public_domain === false) {
    return { robots: { index: false, follow: false } };
  }

  const workTitle = scene.work?.title ?? null;
  const context = [workTitle !== scene.title ? workTitle : null, scene.author]
    .filter(Boolean)
    .join(", ");
  const title = `${scene.title}${context ? ` — ${context}` : ""} : texte et apprentissage`;

  const charactersCount = scene.characters.length;
  const kind = charactersCount <= 1 ? "ce monologue" : `cette scène à ${charactersCount} personnages`;
  const origin = [
    workTitle && workTitle !== scene.title ? ` de ${workTitle}` : "",
    scene.author ? ` (${scene.author})` : "",
  ].join("");
  const description = truncate(
    `Texte intégral de ${scene.title}${origin}. Apprends ${kind} avec la méthode des flashcards, sans compte.`,
    155
  );

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: "article",
      locale: "fr_FR",
    },
  };
}
