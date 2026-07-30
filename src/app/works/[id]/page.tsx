import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { fetchWorkCanonicalPath, fetchWorkWithScenesAndStats } from "@/lib/queries/works";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { WorkDetailClient } from "@/components/works/work-detail-client";

type Props = {
  params: Promise<{ id: string }>;
};

// Cette URL UUID n'est jamais l'URL canonique d'une œuvre : soit elle redirige vers
// /scenes/[auteur]/[piece], soit l'œuvre n'a pas de page publique et il n'y a rien à
// indexer. Dans les deux cas, noindex.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default async function WorkDetailPage({ params }: Props) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  // Une œuvre du domaine public a désormais une page à URL slug : on y redirige en
  // 308 (permanent, transfère le signal SEO déjà acquis sur l'UUID). Le redirect doit
  // rester dans le composant de page — sur Next 16.0.10, permanentRedirect() appelé
  // depuis generateMetadata ne produit pas un vrai statut HTTP.
  const canonicalPath = await fetchWorkCanonicalPath(id);
  if (canonicalPath) {
    permanentRedirect(canonicalPath);
  }

  const user = await getSupabaseSessionUser();
  const work = await fetchWorkWithScenesAndStats(id, user?.id);

  if (!work) {
    notFound();
  }

  // Contenu domaine public : rendu serveur, sans gate. La RLS ne renvoie de toute
  // façon que les scènes publiques ou possédées par l'utilisateur courant.
  return <WorkDetailClient work={work} />;
}





