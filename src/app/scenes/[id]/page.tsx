import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { fetchSceneWithRelations, fetchUserProgressScenes, getSupabaseSessionUser } from "@/lib/queries/scenes";
import { fetchLineMastery, fetchSceneStats } from "@/lib/queries/stats";
import { fetchUserLineHighlights } from "@/lib/queries/notes";
import { SceneDetailTabs } from "@/components/scenes/scene-detail-tabs";
import { t } from "@/locales/fr";
import { hasAccess } from "@/lib/queries/access";
import { ensurePersonalSceneForCurrentUser } from "@/lib/utils/personal-scene";
import { requireSubscriptionOrRedirect } from "@/lib/utils/require-subscription";

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
  if (user) {
    await requireSubscriptionOrRedirect(user);
  }

  // Si un user a accès à une scène publique, on travaille sur sa copie perso (éditable) + historique migré.
  if (user && !scene.is_private) {
    const access = await hasAccess(user.id, scene.work_id ?? undefined, scene.id);
    if (access) {
      const ensured = await ensurePersonalSceneForCurrentUser(scene.id);
      if (ensured.ok && ensured.personalSceneId !== scene.id) {
        redirect(`/scenes/${ensured.personalSceneId}`);
      }
    }
  }

  const [userProgress, sceneStats] = await Promise.all([
    user ? fetchUserProgressScenes(user.id).then((p) => p.find((p) => p.sceneId === id)) : Promise.resolve(null),
    user ? fetchSceneStats(user.id, id) : Promise.resolve(null),
  ]);

  const sortedLines = [...scene.lines].sort((a, b) => a.order - b.order);

  const lastCharacterId = userProgress?.lastCharacterId;
  const lastCharacterName = userProgress?.lastCharacterName;

  const continueLearnHref = (() => {
    if (!user) return null;
    if (!lastCharacterId) return null;
    const params = new URLSearchParams();
    params.set("character", lastCharacterId);
    if (lastCharacterName) params.set("characterName", lastCharacterName);
    return `/learn/${id}?${params.toString()}`;
  })();

  const [lineMastery, highlightsByLineId] = await Promise.all([
    user && lastCharacterId ? fetchLineMastery(user.id, id, lastCharacterId) : Promise.resolve([]),
    user ? fetchUserLineHighlights(user.id, sortedLines.map((l) => l.id)) : Promise.resolve({}),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {user && (
        <div className="sticky top-0 z-30 -mx-4 border-b border-[#e7e1d9] bg-[rgba(249,247,243,0.92)] px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <Link
              href="/home"
              className="inline-flex items-center gap-2 rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:border-[#3b1f4a66]"
            >
              ← {t.common.nav.accueil}
            </Link>

            {continueLearnHref ? (
              <Link
                href={continueLearnHref}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] transition hover:-translate-y-[1px]"
              >
                {t.common.buttons.continuer}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-[#7a7184]">
                Choisis un personnage dans “Réglages” pour continuer.
              </span>
            )}
          </div>
        </div>
      )}

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
        {lastCharacterId && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#f4c95d33] px-3 py-1 text-xs font-semibold text-[#3b1f4a]">
            {t.common.labels.personnageEnCours} : {lastCharacterName ?? "—"}
          </div>
        )}
      </div>

      <SceneDetailTabs
        scene={scene}
        sceneId={id}
        user={user}
        sceneStats={sceneStats}
        lineMastery={lineMastery}
        lastCharacterId={lastCharacterId ?? null}
        lastCharacterName={lastCharacterName ?? null}
        sortedLines={sortedLines.map((line) => ({
          id: line.id,
          order: line.order,
          text: line.text,
          character_id: line.character_id,
          characters: line.characters,
        }))}
        highlightsByLineId={highlightsByLineId}
      />

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





