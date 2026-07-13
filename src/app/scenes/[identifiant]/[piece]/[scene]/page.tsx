import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import { fetchSceneWithRelationsBySlug } from "@/lib/queries/scenes";
import { buildSceneMetadata } from "@/lib/scenes/scene-metadata";
import { slugify } from "@/lib/utils/slugify";
import { SceneDetailView } from "@/components/scenes/scene-detail-view";
import { SceneWithRelations } from "@/types/scenes";

// Next.js App Router refuse deux enfants dynamiques différents au même niveau
// d'un même parent : /scenes/[id]/edit et /scenes/[id]/export existent déjà,
// donc /scenes/[auteur]/... entrait en conflit direct avec /scenes/[id]
// (erreur runtime réelle : "You cannot use different slug names for the same
// dynamic path ('auteur' !== 'id')."). Le param partagé est renommé en
// `identifiant` sur les 4 routes concernées ([id]/page.tsx, edit/, export/,
// et ici) pour ne pas laisser un nom trompeur : ce segment contient soit un
// UUID (routes existantes), soit un slug auteur (cette route).
type Props = {
  params: Promise<{ identifiant: string; piece: string; scene: string }>;
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

// Sur Next.js 16.0.10, permanentRedirect() appelé depuis generateMetadata ne
// produit PAS un vrai statut HTTP (vérifié empiriquement). Le redirect reste
// dans le composant de page (cf. commentaire équivalent dans /scenes/[identifiant]/page.tsx).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { identifiant: auteurSlug, piece: pieceSlug, scene: sceneSlug } = await params;
  if (!sceneSlug) return {};
  const scene = await getScene(sceneSlug);
  if (!scene || !isEligibleForSlugRoute(scene)) return {};

  const canonicalPath = canonicalPathFor(scene);
  if (canonicalPath !== `/scenes/${auteurSlug}/${pieceSlug}/${sceneSlug}`) return {};

  return buildSceneMetadata(scene, canonicalPath);
}

export default async function SceneDetailSlugPage({ params }: Props) {
  const { identifiant: auteurSlug, piece: pieceSlug, scene: sceneSlug } = await params;
  if (!sceneSlug) {
    notFound();
  }

  const scene = await getScene(sceneSlug);
  if (!scene || !isEligibleForSlugRoute(scene)) {
    notFound();
  }

  const canonicalPath = canonicalPathFor(scene);
  if (canonicalPath !== `/scenes/${auteurSlug}/${pieceSlug}/${sceneSlug}`) {
    permanentRedirect(canonicalPath);
  }

  return <SceneDetailView scene={scene} />;
}
