import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import { fetchSceneWithRelationsBySlug } from "@/lib/queries/scenes";
import { buildSceneMetadata } from "@/lib/scenes/scene-metadata";
import { slugify } from "@/lib/utils/slugify";
import { SceneDetailView } from "@/components/scenes/scene-detail-view";
import { SceneWithRelations } from "@/types/scenes";

// Le dossier de route s'appelle [id] (et non [auteur]) car Next.js App Router
// impose le même nom de segment dynamique à une profondeur donnée dans toute
// l'arborescence : /scenes/[id]/edit et /scenes/[id]/export existent déjà à côté.
// Le contenu de l'URL est bien le slug auteur ; seul le nom de dossier interne diffère.
type Props = {
  params: Promise<{ id: string; piece: string; scene: string }>;
};

// Mémoïsé par requête : generateMetadata et la page partagent le même fetch.
const getScene = cache(fetchSceneWithRelationsBySlug);

/**
 * Seules les scènes publiques du domaine public ont un slug (cf. backfill) et
 * vivent sur cette route. Toute autre scène (privée, catalogue payant) 404 ici
 * en défense en profondeur, même si elle ne devrait jamais avoir de slug.
 */
function isEligibleForSlugRoute(scene: SceneWithRelations): boolean {
  return !scene.is_private && scene.work?.is_public_domain === true && !!scene.slug && !!scene.work.slug;
}

function canonicalPathFor(scene: SceneWithRelations): string {
  const authorSlug = slugify(scene.author ?? scene.work?.author ?? "");
  return `/scenes/${authorSlug}/${scene.work?.slug}/${scene.slug}`;
}

// generateMetadata est entièrement résolu avant que l'App Router ne commence à
// streamer la réponse : un permanentRedirect() appelé ici produit un vrai
// statut HTTP 308 sur la toute première requête (cf. commentaire équivalent
// dans /scenes/[id]/page.tsx — un redirect() dans le composant de page arrive
// trop tard et ne se traduit que par une navigation côté client).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: auteurSlug, piece: pieceSlug, scene: sceneSlug } = await params;
  if (!sceneSlug) return {};
  const scene = await getScene(sceneSlug);
  if (!scene || !isEligibleForSlugRoute(scene)) return {};

  const canonicalPath = canonicalPathFor(scene);
  if (canonicalPath !== `/scenes/${auteurSlug}/${pieceSlug}/${sceneSlug}`) {
    permanentRedirect(canonicalPath);
  }

  return buildSceneMetadata(scene, canonicalPath);
}

export default async function SceneDetailSlugPage({ params }: Props) {
  const { id: auteurSlug, piece: pieceSlug, scene: sceneSlug } = await params;
  if (!sceneSlug) {
    notFound();
  }

  const scene = await getScene(sceneSlug);
  if (!scene || !isEligibleForSlugRoute(scene)) {
    notFound();
  }

  // Filet de sécurité : generateMetadata a déjà redirigé dans le cas nominal.
  const canonicalPath = canonicalPathFor(scene);
  if (canonicalPath !== `/scenes/${auteurSlug}/${pieceSlug}/${sceneSlug}`) {
    permanentRedirect(canonicalPath);
  }

  return <SceneDetailView scene={scene} />;
}
