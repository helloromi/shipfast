import { notFound, redirect } from "next/navigation";

import { LearnSession } from "@/components/learn/learn-session";
import { fetchSceneWithRelations, getSupabaseSessionUser } from "@/lib/queries/scenes";
import { AccessGate } from "@/components/works/access-gate";
import { t } from "@/locales/fr";

type Props = {
  params: Promise<{ sceneId: string }>;
  searchParams: Promise<{ character?: string; startLine?: string; endLine?: string }>;
};

export default async function LearnPage({ params, searchParams }: Props) {
  const { sceneId } = await params;
  const { character: characterId, startLine: startLineParam, endLine: endLineParam } =
    await searchParams;
  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }

  const scene = await fetchSceneWithRelations(sceneId);
  if (!scene) {
    notFound();
  }

  if (!characterId) {
    redirect(`/scenes/${sceneId}`);
  }

  const character = scene.characters.find((c) => c.id === characterId);
  if (!character) {
    redirect(`/scenes/${sceneId}`);
  }

  let allLines = [...scene.lines].sort((a, b) => a.order - b.order);

  // Filtrer par plage si les paramètres sont fournis
  const startLine = startLineParam ? parseInt(startLineParam, 10) : null;
  const endLine = endLineParam ? parseInt(endLineParam, 10) : null;

  if (startLine !== null && endLine !== null && !isNaN(startLine) && !isNaN(endLine)) {
    allLines = allLines.filter((line) => line.order >= startLine && line.order <= endLine);
  }

  const lines = allLines.map((line) => ({
    id: line.id,
    order: line.order,
    text: line.text,
    characterName: line.characters?.name ?? t.common.labels.personnage,
    isUserLine: line.character_id === character.id,
  }));

  const rangeInfo =
    startLine !== null && endLine !== null && !isNaN(startLine) && !isNaN(endLine)
      ? `Répliques ${startLine}-${endLine} sur ${scene.lines.length}`
      : null;

  const breadcrumbParts = [scene.work?.title, scene.chapter, scene.title].filter(
    (v): v is string => Boolean(v && String(v).trim().length > 0)
  );
  const breadcrumb = breadcrumbParts.join(" > ");

  return (
    <AccessGate
      user={user}
      sceneId={sceneId}
      workId={scene.work_id || undefined}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
              {t.learn.sectionLabel}
            </p>
            {breadcrumb && (
              <p className="text-xs font-semibold text-[#7a7184]">
                {breadcrumb}
              </p>
            )}
            <h1 className="font-display text-2xl font-semibold text-[#1c1b1f]">{scene.title}</h1>
            <p className="text-sm text-[#524b5a]">
              {t.learn.labels.personnageChoisi} :{" "}
              <span className="font-semibold text-[#1c1b1f]">{character.name}</span>
            </p>
            {rangeInfo && (
              <p className="text-xs font-semibold text-[#7a7184]">{rangeInfo}</p>
            )}
          </div>
        </div>

        <LearnSession
          sceneTitle={scene.title}
          sceneId={sceneId}
          characterId={characterId}
          userCharacterName={character.name}
          lines={lines}
          userId={user.id}
        />
      </div>
    </AccessGate>
  );
}




