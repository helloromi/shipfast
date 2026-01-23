import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { fetchSceneWithRelations, getSupabaseSessionUser } from "@/lib/queries/scenes";
import { isAdmin } from "@/lib/utils/admin";
import { SceneEditor } from "@/components/scenes/scene-editor";
import { requireSubscriptionOrRedirect } from "@/lib/utils/require-subscription";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SceneEditPage({ params }: Props) {
  const { id: sceneId } = await params;
  if (!sceneId) notFound();

  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }
  await requireSubscriptionOrRedirect(user);

  const scene = await fetchSceneWithRelations(sceneId);
  if (!scene) notFound();

  // Les scènes publiques passent par /scenes/[id] (qui auto-fork si accès).
  if (!scene.is_private) {
    redirect(`/scenes/${sceneId}`);
  }

  const admin = await isAdmin(user.id);
  const canEdit = Boolean(scene.is_private && (scene.owner_user_id === user.id || admin));
  const sortedLines = [...scene.lines].sort((a, b) => a.order - b.order);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
          Édition du texte
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          {scene.title}
        </h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          Ici tu peux modifier les personnages et les répliques (ajout, suppression, réordonnancement).
        </p>
      </div>

      {scene.is_private && !canEdit && (
        <div className="rounded-2xl border border-[#f2c6c6] bg-[#fff5f5] p-5 text-sm text-[#7a1f1f]">
          Tu n’as pas la permission de modifier cette scène.
        </div>
      )}

      {scene.is_private && canEdit && (
        <SceneEditor
          sceneId={sceneId}
          userId={user.id}
          initialCharacters={scene.characters}
          initialLines={sortedLines}
          initialTitle={scene.title}
          initialSummary={scene.summary}
        />
      )}

      <div className="flex items-center gap-3">
        <Link
          href={`/scenes/${sceneId}`}
          className="text-sm font-semibold text-[#3b1f4a] underline underline-offset-4"
        >
          ← Retour à la scène
        </Link>
      </div>
    </div>
  );
}

