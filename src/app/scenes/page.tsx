import Link from "next/link";
import { fetchScenes, fetchUserSceneAverages, getSupabaseSessionUser } from "@/lib/queries/scenes";
import { t } from "@/locales/fr";

export default async function ScenesPage() {

  const user = await getSupabaseSessionUser();
  const [scenes, averages] = await Promise.all([
    fetchScenes(),
    user ? fetchUserSceneAverages(user.id) : Promise.resolve([]),
  ]);

  const averageByScene = new Map(averages.map((item) => [item.sceneId, item.average]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">{t.scenes.bibliotheque.sectionLabel}</p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          {t.scenes.bibliotheque.title}
        </h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          {t.scenes.bibliotheque.description}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {scenes.map((scene) => {
          const average = averageByScene.get(scene.id);
          return (
            <Link
              key={scene.id}
              href={`/scenes/${scene.id}`}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14] transition hover:-translate-y-[1px] hover:border-[#3b1f4a33] hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
                  {scene.title}
                </h2>
                {average !== undefined && (
                  <span className="rounded-full bg-[#d9f2e4] px-3 py-1 text-xs font-semibold text-[#1c6b4f]">
                    {t.common.labels.maitrise}: {average.toFixed(2)} / 3
                  </span>
                )}
              </div>
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
            </Link>
          );
        })}
      </div>

      {!scenes.length && (
        <div className="rounded-2xl border border-dashed border-[#e7e1d9] bg-white/85 p-4 text-sm text-[#524b5a]">
          {t.scenes.bibliotheque.empty}
        </div>
      )}
    </div>
  );
}
