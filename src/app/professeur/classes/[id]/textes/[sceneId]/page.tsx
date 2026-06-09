import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SceneAnnotationsEditor } from "@/components/teacher/scene-annotations-editor";
import { fetchClassAnnotations, fetchClassDetail } from "@/lib/queries/teacher";
import { fetchSceneWithRelations, getSupabaseSessionUser } from "@/lib/queries/scenes";
import { requireSubscriptionOrRedirect } from "@/lib/utils/require-subscription";
import { t } from "@/locales/fr";

export const metadata: Metadata = {
  title: "Annoter le texte | Côté-Cour",
};

type Props = {
  params: Promise<{ id: string; sceneId: string }>;
};

export default async function TeacherSceneAnnotationsPage({ params }: Props) {
  const { id: classId, sceneId } = await params;
  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }
  await requireSubscriptionOrRedirect(user);

  const detail = await fetchClassDetail(classId, user.id);
  if (!detail || !detail.scenes.some((s) => s.id === sceneId)) {
    notFound();
  }

  const [scene, annotations] = await Promise.all([
    fetchSceneWithRelations(sceneId),
    fetchClassAnnotations(classId, sceneId),
  ]);

  if (!scene) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-6">
      <div>
        <Link href={`/professeur/classes/${classId}`} className="btn-ghost -ml-3">
          ← {t.teacher.annotations.backToClass}
        </Link>
      </div>
      <div className="flex flex-col gap-1">
        <p className="chip w-fit">{t.teacher.annotations.title}</p>
        <h1 className="font-display text-3xl font-semibold text-[#211a26]">{scene.title}</h1>
        <p className="text-sm text-[#5d5468]">{t.teacher.annotations.subtitle}</p>
      </div>
      <SceneAnnotationsEditor
        classId={classId}
        sceneId={sceneId}
        lines={[...scene.lines]
          .sort((a, b) => a.order - b.order)
          .map((l) => ({
            id: l.id,
            text: l.text,
            characterName: l.characters?.name ?? null,
          }))}
        annotations={annotations}
      />
    </div>
  );
}
