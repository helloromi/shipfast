import Link from "next/link";
import { fetchWorks, searchWorks, fetchUserWorkAverages } from "@/lib/queries/works";
import { getSupabaseSessionUser, fetchUserPrivateScenes } from "@/lib/queries/scenes";
import { SearchBar } from "@/components/works/search-bar";
import { t } from "@/locales/fr";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ScenesPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q || "";
  
  const user = await getSupabaseSessionUser();
  const [works, averages, privateScenes] = await Promise.all([
    query ? searchWorks(query) : fetchWorks(),
    user ? fetchUserWorkAverages(user.id) : Promise.resolve([]),
    user ? fetchUserPrivateScenes(user.id) : Promise.resolve([]),
  ]);

  const averageByWork = new Map(averages.map((item) => [item.workId, item.average]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
          {t.scenes.works.bibliotheque.sectionLabel}
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          {t.scenes.works.bibliotheque.title}
        </h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          {t.scenes.works.bibliotheque.description}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar />
        {user && (
          <Link
            href="/scenes/import"
            className="flex items-center justify-center gap-2 rounded-full bg-[#3b1f4a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#2d1638] sm:w-auto"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t.common.nav.importer}
          </Link>
        )}
      </div>

      {user && privateScenes.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
              {t.scenes.works.privateScenes.title || "Mes scènes privées"}
            </h2>
            <p className="text-sm text-[#524b5a]">
              {t.scenes.works.privateScenes.description || "Scènes créées spécialement pour vous"}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {privateScenes.map((scene) => (
              <Link
                key={scene.id}
                href={`/scenes/${scene.id}`}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-[#f4c95d] bg-[#f4c95d33] p-5 shadow-sm transition hover:-translate-y-[1px] hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">
                    {scene.title}
                  </h3>
                  <span className="rounded-full bg-[#f4c95d] px-2 py-1 text-xs font-semibold text-[#3b1f4a]">
                    {t.scenes.works.privateScenes.badge || "Privée"}
                  </span>
                </div>
                {scene.author && (
                  <p className="text-sm text-[#524b5a]">
                    {t.common.labels.par} {scene.author}
                  </p>
                )}
                {scene.summary && (
                  <p className="text-sm text-[#1c1b1f] leading-relaxed line-clamp-2">
                    {scene.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {works.map((work) => {
          const average = averageByWork.get(work.id);
          const scenesLabel =
            work.scenesCount === 1
              ? t.scenes.works.bibliotheque.scenesCount
              : t.scenes.works.bibliotheque.scenesCountPlural;
          return (
            <Link
              key={work.id}
              href={`/works/${work.id}`}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14] transition hover:-translate-y-[1px] hover:border-[#3b1f4a33] hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
                  {work.title}
                </h2>
                {average !== undefined && (
                  <span className="rounded-full bg-[#d9f2e4] px-3 py-1 text-xs font-semibold text-[#1c6b4f]">
                    {t.common.labels.maitrise}: {average.toFixed(2)} / 3
                  </span>
                )}
              </div>
              <p className="text-sm text-[#524b5a] leading-relaxed">
                {work.author ? `${t.common.labels.par} ${work.author}` : t.common.labels.auteurInconnu}
              </p>
              {work.summary && (
                <p className="text-sm text-[#1c1b1f] leading-relaxed line-clamp-2">{work.summary}</p>
              )}
              <p className="text-xs font-semibold text-[#7a7184]">
                {work.scenesCount} {scenesLabel}
              </p>
            </Link>
          );
        })}
      </div>

      {!works.length && (
        <div className="rounded-2xl border border-dashed border-[#e7e1d9] bg-white/85 p-4 text-sm text-[#524b5a]">
          {t.scenes.works.bibliotheque.empty}
        </div>
      )}
    </div>
  );
}




