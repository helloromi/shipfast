import { notFound, redirect } from "next/navigation";

import { LearnSession } from "@/components/learn/learn-session";
import { fetchSceneWithRelations, getSupabaseSessionUser } from "@/lib/queries/scenes";

type Props = {
  params: Promise<{ sceneId: string }>;
  searchParams: Promise<{ character?: string }>;
};

export default async function LearnPage({ params, searchParams }: Props) {
  const { sceneId } = await params;
  const { character: characterId } = await searchParams;
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

  const lines = [...scene.lines]
    .sort((a, b) => a.order - b.order)
    .map((line) => ({
      id: line.id,
      order: line.order,
      text: line.text,
      characterName: line.characters?.name ?? "Personnage",
      isUserLine: line.character_id === character.id,
    }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">Mode apprentissage</p>
          <h1 className="font-display text-2xl font-semibold text-[#1c1b1f]">{scene.title}</h1>
          <p className="text-sm text-[#524b5a]">
            Personnage choisi : <span className="font-semibold text-[#1c1b1f]">{character.name}</span>
          </p>
        </div>
      </div>

      <LearnSession
        sceneTitle={scene.title}
        userCharacterName={character.name}
        lines={lines}
        userId={user.id}
      />
    </div>
  );
}
