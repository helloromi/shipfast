import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import { fetchSceneWithRelations } from "@/lib/queries/scenes";
import { buildSceneMetadata } from "@/lib/scenes/scene-metadata";
import { slugify } from "@/lib/utils/slugify";
import { SceneDetailView } from "@/components/scenes/scene-detail-view";
import { SceneWithRelations } from "@/types/scenes";

type Props = {
  params: Promise<{ identifiant: string }>;
};

// Mémoïsé par requête : generateMetadata et la page partagent le même fetch.
const getScene = cache(fetchSceneWithRelations);

/**
 * Une scène publique du domaine public a désormais une URL slug canonique :
 * on y redirige en 308 (permanent, transfère le signal SEO déjà acquis sur
 * l'UUID). Les copies privées, imports perso et scènes payantes (sans slug)
 * continuent d'être servies ici sans changement.
 */
function slugPathFor(scene: SceneWithRelations): string | null {
  if (scene.is_private) return null;
  if (!scene.work?.is_public_domain) return null;
  if (!scene.slug || !scene.work.slug) return null;

  const authorSlug = slugify(scene.author ?? scene.work.author ?? "");
  return `/scenes/${authorSlug}/${scene.work.slug}/${scene.slug}`;
}

// Sur Next.js 16.0.10, permanentRedirect() appelé depuis generateMetadata ne
// produit PAS un vrai statut HTTP (200 streamé + redirect côté client
// seulement) — vérifié empiriquement (test isolé + cette route). Le redirect
// doit rester dans le composant de page, comme le fait déjà /src/app/page.tsx
// pour son propre redirect() vers /landing.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { identifiant: id } = await params;
  if (!id) return {};
  const scene = await getScene(id);
  if (!scene) return {};

  const slugPath = slugPathFor(scene);
  if (slugPath) return {};

  return buildSceneMetadata(scene, `/scenes/${id}`);
}

export default async function SceneDetailPage({ params }: Props) {
  const { identifiant: id } = await params;
  if (!id) {
    notFound();
  }

  const scene = await getScene(id);
  if (!scene) {
    notFound();
  }

  const slugPath = slugPathFor(scene);
  if (slugPath) {
    permanentRedirect(slugPath);
  }

  // Une scène du catalogue public rattachée à une œuvre hors domaine public
  // ne doit pas exposer son texte intégral. Les copies privées (import perso)
  // restent accessibles à leur propriétaire.
  if (!scene.is_private && scene.work?.is_public_domain === false) {
    notFound();
  }

  return <SceneDetailView scene={scene} />;
}
