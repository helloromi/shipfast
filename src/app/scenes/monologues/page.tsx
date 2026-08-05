import type { Metadata } from "next";

import { DistributionPage } from "@/components/scenes/distribution-page";
import { buildDistributionMetadata } from "@/lib/seo/distribution-metadata";

const SLUG = "monologues";

/**
 * URL plate sous /scenes : le segment statique l'emporte sur `[identifiant]`, et on
 * évite le segment parent orphelin qu'aurait créé /scenes/distribution/…
 * Le corps est partagé par les trois paliers (cf. DistributionPage).
 */
export const revalidate = 3600;

export const metadata: Metadata = buildDistributionMetadata(SLUG);

export default function Page() {
  return <DistributionPage slug={SLUG} />;
}
