import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import { fetchSceneWithRelations } from "@/lib/queries/scenes";
import { buildSceneMetadata } from "@/lib/scenes/scene-metadata";
import { scenePathFor } from "@/lib/seo/urls";
import { SceneDetailView } from "@/components/scenes/scene-detail-view";

type Props = {
  params: Promise<{ identifiant: string }>;
};

// Mémoïsé par requête : generateMetadata et la page partagent le même fetch.
const getScene = cache(fetchSceneWithRelations);

// Une scène publique du domaine public a désormais une URL slug canonique : on y
// redirige en 308 (permanent, transfère le signal SEO déjà acquis sur l'UUID). Les
// copies privées continuent d'être servies ici. scenePathFor renvoie null dès qu'un
// slug manque — même règle que le sitemap et la route slug (@/lib/seo/urls).

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

  const slugPath = scenePathFor(scene);
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

  const slugPath = scenePathFor(scene);
  if (slugPath) {
    permanentRedirect(slugPath);
  }

  // Une scène du catalogue public rattachée à une œuvre hors domaine public
  // ne doit pas exposer son texte intégral. Les copies privées (import perso)
  // restent accessibles à leur propriétaire.
  if (!scene.is_private && scene.work?.is_public_domain === false) {
    notFound();
  }

  // Défense en profondeur : une scène publique du domaine public qui arrive ici n'a
  // pas pu être redirigée, donc il lui manque son slug ou celui de son œuvre. La
  // servir en 200 lui donnait une URL UUID indexable, auto-canonique et absente du
  // sitemap — c'est ce qui était arrivé aux 17 scènes du Misanthrope et de L'École
  // des femmes, et aux 3 scènes orphelines à work_id nul. Le catalogue est sluggé
  // (npm run backfill:scene-slugs), ce cas ne doit plus se présenter : s'il revient,
  // c'est un lot de seed incomplet, et un 404 vaut mieux qu'un doublon indexé.
  if (!scene.is_private) {
    notFound();
  }

  return <SceneDetailView scene={scene} />;
}
