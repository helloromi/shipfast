import { notFound } from "next/navigation";
import { fetchWorkWithScenesAndStats } from "@/lib/queries/works";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { WorkDetailClient } from "@/components/works/work-detail-client";
import { AccessGate } from "@/components/works/access-gate";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function WorkDetailPage({ params }: Props) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const user = await getSupabaseSessionUser();
  const work = await fetchWorkWithScenesAndStats(id, user?.id);

  if (!work) {
    notFound();
  }

  // Si l'œuvre a des scènes, on vérifie l'accès à la première scène pour l'œuvre entière
  // Sinon, on affiche directement (œuvre sans scènes - pas de contrôle d'accès nécessaire)
  if (work.scenes.length === 0) {
    return <WorkDetailClient work={work} />;
  }

  const firstSceneId = work.scenes[0].id;

  return (
    <AccessGate
      user={user}
      workId={id}
      sceneId={firstSceneId}
    >
      <WorkDetailClient work={work} />
    </AccessGate>
  );
}




