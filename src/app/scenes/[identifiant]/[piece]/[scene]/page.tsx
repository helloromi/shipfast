import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import { fetchSceneByPreviousSlug, fetchSceneWithRelationsByWorkAndSlug } from "@/lib/queries/scenes";
import { buildSceneMetadata } from "@/lib/scenes/scene-metadata";
import { isEligibleForSlugRoute, scenePathFor } from "@/lib/seo/urls";
import { SceneDetailView } from "@/components/scenes/scene-detail-view";

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
const getScene = cache(fetchSceneWithRelationsByWorkAndSlug);

// isEligibleForSlugRoute et scenePathFor vivent dans @/lib/seo/urls : les mêmes règles
// servent au sitemap, à la route UUID, au bloc de navigation et au JSON-LD. Seules les
// scènes publiques du domaine public sluggées vivent sur cette route ; toute autre
// scène (privée, catalogue payant) 404 ici, en défense en profondeur.

// Sur Next.js 16.0.10, permanentRedirect() appelé depuis generateMetadata ne
// produit PAS un vrai statut HTTP (vérifié empiriquement). Le redirect reste
// dans le composant de page (cf. commentaire équivalent dans /scenes/[identifiant]/page.tsx).
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { identifiant: auteurSlug, piece: pieceSlug, scene: sceneSlug } = await params;
  if (!pieceSlug || !sceneSlug) return {};
  const scene = await getScene(pieceSlug, sceneSlug);
  if (!scene || !isEligibleForSlugRoute(scene)) return {};

  const canonicalPath = scenePathFor(scene)!;
  if (canonicalPath !== `/scenes/${auteurSlug}/${pieceSlug}/${sceneSlug}`) return {};

  return buildSceneMetadata(scene, canonicalPath);
}

export default async function SceneDetailSlugPage({ params }: Props) {
  const { identifiant: auteurSlug, piece: pieceSlug, scene: sceneSlug } = await params;
  if (!pieceSlug || !sceneSlug) {
    notFound();
  }

  const scene = await getScene(pieceSlug, sceneSlug);
  if (scene && isEligibleForSlugRoute(scene)) {
    const canonicalPath = scenePathFor(scene)!;
    if (canonicalPath !== `/scenes/${auteurSlug}/${pieceSlug}/${sceneSlug}`) {
      permanentRedirect(canonicalPath);
    }

    return <SceneDetailView scene={scene} />;
  }

  // Slug de scène inconnu dans cette œuvre : peut-être un ancien slug déjà indexé
  // (avant re-sluguage). On tente l'historique et on redirige en 301 vers le slug
  // canonique. Sinon 404.
  const renamed = await fetchSceneByPreviousSlug(pieceSlug, sceneSlug);
  if (renamed && isEligibleForSlugRoute(renamed)) {
    permanentRedirect(scenePathFor(renamed)!);
  }

  notFound();
}
