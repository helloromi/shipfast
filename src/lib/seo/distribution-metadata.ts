import type { Metadata } from "next";

import { getDistribution, distributionPath } from "@/lib/seo/distributions";
import { buildOpenGraph, buildTwitter } from "@/lib/seo/open-graph";

/**
 * Métadonnées d'une page de distribution.
 *
 * Extrait des trois routes pour la même raison que buildSceneMetadata l'est des pages
 * scènes : le canonical, l'Open Graph et la carte Twitter doivent être construits au
 * même endroit, sinon une route en oublie un. buildOpenGraph re-déclare `images` et
 * `locale`, que Next ne fusionne pas depuis le layout racine.
 */
export function buildDistributionMetadata(slug: string): Metadata {
  const distribution = getDistribution(slug);
  if (!distribution) return {};

  const { title, description } = distribution;
  const url = distributionPath(slug);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: buildOpenGraph({ title, description, url, type: "website" }),
    twitter: buildTwitter({ title, description }),
  };
}
