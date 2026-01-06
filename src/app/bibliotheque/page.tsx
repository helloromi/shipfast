import Link from "next/link";
import { redirect } from "next/navigation";
import { fetchWorks, searchWorks, fetchUserWorkAverages } from "@/lib/queries/works";
import { getSupabaseSessionUser, fetchUserPrivateScenes, fetchPendingImports } from "@/lib/queries/scenes";
import { SearchBar } from "@/components/works/search-bar";
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

  const [works, averages, privateScenes, pendingImports] = await Promise.all([
    query ? searchWorks(query) : fetchWorks(),
    fetchUserWorkAverages(user.id),
    fetchUserPrivateScenes(user.id),
    fetchPendingImports(user.id),
  ]);

  const averageByWork = new Map(averages.map((item) => [item.workId, item.average]));

  return (
    <div className="flex flex-col gap-8">
      {/* Section Mes scènes importées - En haut si remplie */}
      {(privateScenes.length > 0 || pendingImports.length > 0) && (
        <section id="mes-oeuvres" className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
              Mes œuvres
            </p>
            <h2 className="font-display text-3xl font-semibold text-[#1c1b1f]">
              Mes scènes importées
            </h2>
            <p className="text-sm text-[#524b5a] leading-relaxed">
              Les scènes que vous avez importées et qui vous appartiennent
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Imports en attente de validation */}
            {pendingImports.map((pending) => (
              <Link
                key={pending.jobId}
                href={`/imports/${pending.jobId}/preview`}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-[#ff6b6b] bg-[#ff6b6b33] p-5 shadow-sm transition hover:-translate-y-[1px] hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">
                    {pending.title}
                  </h3>
                  <span className="rounded-full bg-[#ff6b6b] px-2 py-1 text-xs font-semibold text-white">
                    À valider
                  </span>
                </div>
                {pending.author && (
                  <p className="text-sm text-[#524b5a]">
                    {t.common.labels.par} {pending.author}
                  </p>
                )}
                <p className="text-xs text-[#7a7184]">
                  Cliquez pour voir le preview et sélectionner les répliques
                </p>
              </Link>
            ))}
            {/* Scènes privées validées */}
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
        </div>

        {/* Header : Recherche + Import côte à côte */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Colonne Recherche */}
          <div className="flex flex-col gap-4">
            <SearchBar />
          </div>

          {/* Colonne Import */}
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#524b5a] leading-relaxed">
              Vous ne trouvez pas votre œuvre ? Vous pouvez directement l'importer ici.
            </p>
            <Link
              href="/scenes/import"
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#e7e1d9] bg-white/90 p-8 transition hover:border-[#3b1f4a] hover:bg-[#3b1f4a08]"
            >
              <div className="rounded-full bg-[#f4c95d33] p-4">
                <svg
                  className="h-8 w-8 text-[#3b1f4a]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm font-semibold text-[#1c1b1f]">
                  Importer une scène
                </p>
                <p className="text-xs text-[#7a7184]">
                  Formats : JPG, PNG, WEBP, PDF
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Galerie d'œuvres */}
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

