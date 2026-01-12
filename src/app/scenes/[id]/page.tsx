import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchSceneWithRelations, fetchUserProgressScenes, getSupabaseSessionUser } from "@/lib/queries/scenes";
import { fetchLineMastery, fetchSceneStats } from "@/lib/queries/stats";
import { SceneStatsDetail } from "@/components/stats/scene-stats-detail";
import { t } from "@/locales/fr";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SceneDetailPage({ params }: Props) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const scene = await fetchSceneWithRelations(id);
  if (!scene) {
    notFound();
  }

  const user = await getSupabaseSessionUser();
  const [userProgress, sceneStats] = await Promise.all([
    user ? fetchUserProgressScenes(user.id).then((p) => p.find((p) => p.sceneId === id)) : Promise.resolve(null),
    user ? fetchSceneStats(user.id, id) : Promise.resolve(null),
  ]);

  const sortedLines = [...scene.lines].sort((a, b) => a.order - b.order);

  const lastCharacterId = userProgress?.lastCharacterId;
  const lastCharacterName = userProgress?.lastCharacterName;

  const lineMastery =
    user && lastCharacterId ? await fetchLineMastery(user.id, id, lastCharacterId) : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">{t.scenes.detail.sectionLabel}</p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          {scene.title}
        </h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          {scene.author ? `${t.common.labels.par} ${scene.author}` : t.common.labels.auteurInconnu}
        </p>
        {scene.summary && (
          <p className="text-sm text-[#1c1b1f] leading-relaxed">{scene.summary}</p>
        )}
        {scene.chapter && (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7a7184]">
            {t.common.labels.chapitre} : {scene.chapter}
          </p>
        )}
        {user && (
          <div className="mt-2">
            {scene.is_private && scene.owner_user_id === user.id ? (
              <Link
                href={`/scenes/${scene.id}/edit`}
                className="inline-flex items-center gap-2 rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:-translate-y-[1px] hover:border-[#3b1f4a66]"
              >
                Modifier le texte
              </Link>
            ) : !scene.is_private ? (
              <Link
                href={`/scenes/${scene.id}/edit`}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] transition hover:-translate-y-[1px]"
              >
                Créer une copie modifiable
              </Link>
            ) : null}
          </div>
        )}
        {lastCharacterId && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#f4c95d33] px-3 py-1 text-xs font-semibold text-[#3b1f4a]">
            {t.common.labels.personnageEnCours} : {lastCharacterName ?? "—"}
          </div>
        )}
      </div>

      {user && sceneStats && (
        <SceneStatsDetail
          stats={sceneStats}
          lineMastery={lineMastery}
          sceneId={id}
          lastCharacterId={lastCharacterId ?? null}
          lastCharacterName={lastCharacterName ?? null}
          hasCharacters={scene.characters.length > 0}
        />
      )}

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">{t.scenes.detail.personnages.title}</h2>
        <div className="flex flex-wrap gap-3">
          {lastCharacterId ? (
            <>
              <Link
                href={`/learn/${scene.id}?character=${lastCharacterId}`}
                className="inline-flex items-center gap-2 rounded-full bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#e75a5a]"
              >
                {t.scenes.detail.personnages.continuerEn} {lastCharacterName ?? t.scenes.detail.personnages.monRole}
              </Link>
              <div className="w-full text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                {t.scenes.detail.personnages.ouChoisirAutre}
              </div>
            </>
          ) : null}
          {scene.characters.map((character) => (
            <Link
              key={character.id}
              href={`/learn/${scene.id}?character=${character.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:-translate-y-[1px] hover:border-[#3b1f4a66]"
            >
              {character.name}
              <span className="text-xs font-medium text-[#7a7184]">
                {lastCharacterId === character.id ? t.scenes.detail.personnages.dejaChoisi : t.scenes.detail.personnages.choisirCeRole}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">{t.scenes.detail.apercu.title}</h2>
        <div className="flex flex-col gap-2 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14]">
          {sortedLines.map((line) => (
            <div
              key={line.id}
              className="flex flex-col gap-1 rounded-xl border border-transparent px-3 py-2 transition hover:border-[#e7e1d9]"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                {line.characters?.name ?? t.common.labels.personnage}
              </div>
              <p className="text-sm text-[#1c1b1f]">{line.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Link
          href="/bibliotheque"
          className="text-sm font-semibold text-[#3b1f4a] underline underline-offset-4"
        >
          ← {t.common.buttons.retourBibliotheque}
        </Link>
      </div>
    </div>
  );
}





