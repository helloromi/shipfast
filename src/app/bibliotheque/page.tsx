import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchWorks, searchWorks, fetchUserWorkAverages } from "@/lib/queries/works";
import { getSupabaseSessionUser, fetchUserPrivateScenes, fetchUserProgressScenes } from "@/lib/queries/scenes";
import { fetchUserStatsSummary } from "@/lib/queries/stats";
import { SearchBar } from "@/components/works/search-bar";
import { ImportForm } from "@/components/scenes/import-form";
import { SceneCard } from "@/components/home/scene-card";
import { StatsSummaryCard } from "@/components/stats/stats-summary-card";
import { t } from "@/locales/fr";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function BibliothequePage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q || "";

  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }

  const [works, averages, privateScenes, progresses, statsSummary] = await Promise.all([
    query ? searchWorks(query) : fetchWorks(),
    fetchUserWorkAverages(user.id),
    fetchUserPrivateScenes(user.id),
    fetchUserProgressScenes(user.id),
    fetchUserStatsSummary(user.id),
  ]);

  const averageByWork = new Map(averages.map((item) => [item.workId, item.average]));

  return (
    <div className="flex flex-col gap-8">
      {/* Section Import */}
      <section id="import" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
            {t.scenes.import.sectionLabel}
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
            {t.scenes.import.title}
          </h1>
          <p className="text-sm text-[#524b5a] leading-relaxed">
            {t.scenes.import.description}
          </p>
        </div>
        <ImportForm />
      </section>

      {/* Section Mes scènes */}
      <section id="mes-scenes" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
            {t.home.sectionLabel}
          </p>
          <h2 className="font-display text-3xl font-semibold text-[#1c1b1f]">
            {t.home.title}
          </h2>
          <p className="text-sm text-[#524b5a] leading-relaxed">
            {t.home.description}
          </p>
        </div>

        <StatsSummaryCard stats={statsSummary} />

        {progresses.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#e7e1d9] bg-white/85 p-4 text-sm text-[#524b5a]">
            {t.home.empty.message}{" "}
            <a href="#bibliotheque" className="font-semibold text-[#3b1f4a] underline underline-offset-4">
              {t.home.empty.bibliotheque}
            </a>{" "}
            {t.home.empty.pourDemarrer}
          </div>
        )}

        {progresses.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {progresses.map((item) => (
              <SceneCard key={item.sceneId} scene={item} />
            ))}
          </div>
        )}
      </section>

      {/* Section Bibliothèque */}
      <section id="bibliotheque" className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
            {t.scenes.works.bibliotheque.sectionLabel}
          </p>
          <h2 className="font-display text-3xl font-semibold text-[#1c1b1f]">
            {t.scenes.works.bibliotheque.title}
          </h2>
          <p className="text-sm text-[#524b5a] leading-relaxed">
            {t.scenes.works.bibliotheque.description}
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar />
        </div>

        {privateScenes.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-xl font-semibold text-[#3b1f4a]">
                {t.scenes.works.privateScenes.title || "Mes scènes privées"}
              </h3>
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
                      {t.common.labels.maitrise}: {average.toFixed(2)} / 10
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
      </section>
    </div>
  );
}

