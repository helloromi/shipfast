import { notFound } from "next/navigation";
import { fetchWorkWithScenesAndStats } from "@/lib/queries/works";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { WorkDetailClient } from "@/components/works/work-detail-client";
import { requireSubscriptionOrRedirect } from "@/lib/utils/require-subscription";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WorkDetailPage({ params }: Props) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const user = await getSupabaseSessionUser();
  if (user) {
    await requireSubscriptionOrRedirect(user);
  }
  const work = await fetchWorkWithScenesAndStats(id, user?.id);

  if (!work) {
    notFound();
  }

  // Contenu domaine public : rendu serveur, sans gate. La RLS ne renvoie de toute
  // façon que les scènes publiques ou possédées par l'utilisateur courant.
  return <WorkDetailClient work={work} />;
}





