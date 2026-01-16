import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchWorks, searchWorks, fetchUserWorkAverages, fetchWorksWithActiveScenes } from "@/lib/queries/works";
import {
  getSupabaseSessionUser,
  fetchUserPrivateScenes,
  fetchPendingImports,
  fetchActiveSceneIds,
} from "@/lib/queries/scenes";
import { SearchBar } from "@/components/works/search-bar";
import { FiltersSort } from "@/components/works/filters-sort";
import { t } from "@/locales/fr";
import { requireSubscriptionOrRedirect } from "@/lib/utils/require-subscription";

type Props = {
  searchParams: Promise<{ q?: string; author?: string; sort?: string }>;
};

export default async function BibliothequePage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q || "";
  const authorFilter = params.author || "";
  const sortBy = (params.sort as "title" | "scenes" | "mastery") || "title";

  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }
  await requireSubscriptionOrRedirect(user);

  const [works, averages, privateScenes, pendingImports, activeWorkIds, activeSceneIds] = await Promise.all([
    query ? searchWorks(query, authorFilter, sortBy) : fetchWorks(authorFilter, sortBy),
    fetchUserWorkAverages(user.id),
    fetchUserPrivateScenes(user.id),
    fetchPendingImports(user.id),
    fetchWorksWithActiveScenes(user.id),
    fetchActiveSceneIds(user.id),
  ]);

  const averageByWork = new Map(averages.map((item) => [item.workId, item.average]));

  // Trier par maîtrise si demandé
  if (sortBy === "mastery") {
    works.sort((a, b) => {
      const avgA = averageByWork.get(a.id) ?? 0;
      const avgB = averageByWork.get(b.id) ?? 0;
      return avgB - avgA;
    });
  }

  // Extraire les auteurs uniques pour le filtre
  const uniqueAuthors = Array.from(new Set(works.map((w) => w.author).filter((a): a is string => !!a))).sort();

  // Filtrer les scènes privées et imports si recherche active
  const filteredPrivateScenes = query
    ? privateScenes.filter(
        (scene) =>
          scene.title.toLowerCase().includes(query.toLowerCase()) ||
          (scene.author && scene.author.toLowerCase().includes(query.toLowerCase()))
      )
    : privateScenes;

  const filteredPendingImports = query
    ? pendingImports.filter(
        (pending) =>
          pending.title.toLowerCase().includes(query.toLowerCase()) ||
          (pending.author && pending.author.toLowerCase().includes(query.toLowerCase()))
      )
    : pendingImports;

  const hasPrivateContent = filteredPrivateScenes.length > 0 || filteredPendingImports.length > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* Recherche globale et Import compact en haut */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex-1">
            <SearchBar />
          </div>
          <Link
            href="/scenes/import"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#e7e1d9] bg-white px-4 py-2.5 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:border-[#3b1f4a] hover:bg-[#3b1f4a08] sm:w-auto"
            title="Importer une scène"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="hidden sm:inline">Importer</span>
          </Link>
        </div>

        {/* Filtres et tri */}
        <FiltersSort authors={uniqueAuthors} hasQuery={!!query} />
      </div>

      {/* Section Mes scènes importées - En haut si remplie */}
      {hasPrivateContent && (
        <section id="mes-oeuvres" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">Mes œuvres</p>
            <h2 className="font-display text-3xl font-semibold text-[#1c1b1f]">Mes scènes importées</h2>
            <p className="text-sm text-[#524b5a] leading-relaxed">
              Les scènes que vous avez importées et qui vous appartiennent. Vous pouvez les travailler depuis votre
              page d’accueil.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Imports en attente de validation */}
            {filteredPendingImports.map((pending) => (
              <div
                key={pending.jobId}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-[#ff6b6b] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14] transition hover:-translate-y-[1px] hover:border-[#ff6b6b] hover:shadow-lg"
              >
                <Link href={`/imports/${pending.jobId}/preview`} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">{pending.title}</h3>
                    <span className="rounded-full bg-[#ff6b6b] px-2 py-1 text-xs font-semibold text-white">
                      À valider
                    </span>
                  </div>
                  {pending.author && (
                    <p className="text-sm text-[#524b5a]">
                      {t.common.labels.par} {pending.author}
                    </p>
                  )}
                  <p className="text-xs text-[#7a7184]">Cliquez pour voir le preview et sélectionner les répliques</p>
                </Link>
              </div>
            ))}
            {/* Scènes privées validées */}
            {filteredPrivateScenes.map((scene) => {
              const isActive = activeSceneIds.has(scene.id);
              return (
                <div
                  key={scene.id}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14] transition hover:-translate-y-[1px] hover:border-[#3b1f4a33] hover:shadow-lg"
                >
                  <Link href={isActive ? "/home" : `/scenes/${scene.id}`} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">{scene.title}</h3>
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="rounded-full bg-[#f4c95d33] px-2 py-1 text-xs font-semibold text-[#3b1f4a]">
                            En cours
                          </span>
                        )}
                        <span className="rounded-full bg-[#f4c95d33] px-2 py-1 text-xs font-semibold text-[#3b1f4a]">
                          {t.scenes.works.privateScenes.badge || "Privée"}
                        </span>
                      </div>
                    </div>
                    {scene.author && (
                      <p className="text-sm text-[#524b5a]">
                        {t.common.labels.par} {scene.author}
                      </p>
                    )}
                    {scene.summary && (
                      <p className="text-sm text-[#1c1b1f] leading-relaxed line-clamp-2">{scene.summary}</p>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Section Bibliothèque */}
      <section id="bibliotheque" className="flex flex-col gap-6">
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
          <p className="text-xs text-[#7a7184] italic">
            Sélectionnez une œuvre pour voir ses scènes et commencer à travailler. Vos scènes actives apparaissent sur
            votre page d’accueil.
          </p>
        </div>

        {/* Galerie d'œuvres */}
        {works.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {works.map((work) => {
              const average = averageByWork.get(work.id);
              const isActive = activeWorkIds.has(work.id);
              const scenesLabel =
                work.scenesCount === 1
                  ? t.scenes.works.bibliotheque.scenesCount
                  : t.scenes.works.bibliotheque.scenesCountPlural;

              // Déterminer le badge de maîtrise
              let masteryBadge = null;
              if (average !== undefined) {
                if (average >= 7) {
                  masteryBadge = (
                    <span className="rounded-full bg-[#d9f2e4] px-3 py-1 text-xs font-semibold text-[#1c6b4f]">
                      {t.common.labels.maitrise}: {average.toFixed(2)} / 10
                    </span>
                  );
                } else if (average > 0) {
                  masteryBadge = (
                    <span className="rounded-full bg-[#fef3c7] px-3 py-1 text-xs font-semibold text-[#92400e]">
                      {t.common.labels.maitrise}: {average.toFixed(2)} / 10
                    </span>
                  );
                }
              }

              return (
                <div
                  key={work.id}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14] transition hover:-translate-y-[1px] hover:border-[#3b1f4a33] hover:shadow-lg"
                >
                  <Link href={isActive ? "/home" : `/works/${work.id}`} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">{work.title}</h2>
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="rounded-full bg-[#f4c95d33] px-2 py-1 text-xs font-semibold text-[#3b1f4a]">
                            En cours
                          </span>
                        )}
                        {masteryBadge}
                      </div>
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
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#e7e1d9] bg-white/85 p-8 text-center">
            <p className="mb-4 text-sm font-semibold text-[#3b1f4a]">
              {query
                ? "Aucune œuvre trouvée pour votre recherche"
                : t.scenes.works.bibliotheque.empty}
            </p>
            {query && (
              <>
                <p className="mb-4 text-sm text-[#524b5a]">
                  Essayez de modifier vos critères de recherche ou explorez la bibliothèque complète.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/bibliotheque"
                    className="rounded-full border border-[#3b1f4a] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:bg-[#3b1f4a08]"
                  >
                    Voir toute la bibliothèque
                  </Link>
                  <Link
                    href="/scenes/import"
                    className="rounded-full bg-[#3b1f4a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d1638]"
                  >
                    Importer une scène
                  </Link>
                </div>
              </>
            )}
            {!query && (
              <Link
                href="/scenes/import"
                className="mt-4 inline-block rounded-full bg-[#3b1f4a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d1638]"
              >
                Importer une scène
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
