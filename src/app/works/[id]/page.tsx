import { notFound } from "next/navigation";
import { fetchWorkWithScenesAndStats } from "@/lib/queries/works";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { WorkDetailClient } from "@/components/works/work-detail-client";

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

  return <WorkDetailClient work={work} />;
}

