import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getSupabaseSessionUser,
  fetchUserPrivateScenes,
  fetchScenesSharedWithUser,
  fetchPendingImports,
  fetchActiveSceneIds,
} from "@/lib/queries/scenes";
import { SearchBar } from "@/components/works/search-bar";
import { t } from "@/locales/fr";
import { requireSubscriptionOrRedirect } from "@/lib/utils/require-subscription";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function MesScenesPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q || "";

  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }
  await requireSubscriptionOrRedirect(user);

  const [privateScenes, sharedScenesRaw, pendingImports, activeSceneIds] = await Promise.all([
    fetchUserPrivateScenes(user.id),
    fetchScenesSharedWithUser(user.id),
    fetchPendingImports(user.id),
    fetchActiveSceneIds(user.id),
  ]);

  // Exclure des scènes partagées tout ID déjà présent dans les scènes privées (évite les doublons)
  const privateSceneIds = new Set(privateScenes.map((s) => s.id));
  const sharedScenes = sharedScenesRaw.filter((s) => !privateSceneIds.has(s.id));

  const filteredPrivateScenes = query
    ? privateScenes.filter(
        (scene) =>
          scene.title.toLowerCase().includes(query.toLowerCase()) ||
          (scene.author && scene.author.toLowerCase().includes(query.toLowerCase()))
      )
    : privateScenes;

  const filteredSharedScenes = query
    ? sharedScenes.filter(
        (scene) =>
          scene.title.toLowerCase().includes(query.toLowerCase()) ||
          (scene.author && scene.author.toLowerCase().includes(query.toLowerCase()))
      )
    : sharedScenes;

  const filteredPendingImports = query
    ? pendingImports.filter(
        (pending) =>
          pending.title.toLowerCase().includes(query.toLowerCase()) ||
          (pending.author && pending.author.toLowerCase().includes(query.toLowerCase()))
      )
    : pendingImports;

  const hasContent =
    filteredPrivateScenes.length > 0 ||
    filteredSharedScenes.length > 0 ||
    filteredPendingImports.length > 0;
  const hasAnyScene = privateScenes.length > 0 || sharedScenes.length > 0 || pendingImports.length > 0;

  return (
    <div className="flex flex-col gap-8">
      {/* En-tête de page */}
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

      {/* Barre de recherche + CTA import */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {hasAnyScene && (
          <div className="flex-1">
            <SearchBar />
          </div>
        )}
        <Link
          href="/scenes/import"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#3b1f4a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d1638] sm:w-auto"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Importer une scène
        </Link>
      </div>

      {/* Grille des scènes */}
      {hasContent ? (
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
                <Link href={`/scenes/${scene.id}`} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">{scene.title}</h3>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="rounded-full bg-[#f4c95d33] px-2 py-1 text-xs font-semibold text-[#3b1f4a]">
                          En cours
                        </span>
                      )}
                      <span className="rounded-full bg-[#f4c95d33] px-2 py-1 text-xs font-semibold text-[#3b1f4a]">
                        {t.scenes.works.privateScenes.badge}
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

          {/* Scènes partagées par un autre utilisateur */}
          {filteredSharedScenes.map((scene) => {
            const isActive = activeSceneIds.has(scene.id);
            return (
              <div
                key={scene.id}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14] transition hover:-translate-y-[1px] hover:border-[#3b1f4a33] hover:shadow-lg"
              >
                <Link href={`/scenes/${scene.id}`} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">{scene.title}</h3>
                    <div className="flex items-center gap-2">
                      {isActive && (
                        <span className="rounded-full bg-[#f4c95d33] px-2 py-1 text-xs font-semibold text-[#3b1f4a]">
                          En cours
                        </span>
                      )}
                      <span className="rounded-full bg-[#dbeafe] px-2 py-1 text-xs font-semibold text-[#1e40af]">
                        {t.scenes.works.privateScenes.sharedBadge}
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
      ) : hasAnyScene && query ? (
        /* Aucun résultat pour la recherche */
        <div className="rounded-2xl border border-dashed border-[#e7e1d9] bg-white/85 p-8 text-center">
          <p className="mb-2 text-sm font-semibold text-[#3b1f4a]">
            Aucune scène trouvée pour &ldquo;{query}&rdquo;
          </p>
          <p className="mb-4 text-sm text-[#524b5a]">Essayez de modifier votre recherche.</p>
          <Link
            href="/bibliotheque"
            className="rounded-full border border-[#3b1f4a] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:bg-[#3b1f4a08]"
          >
            Voir toutes mes scènes
          </Link>
        </div>
      ) : (
        /* État vide — aucune scène importée */
        <EmptyState />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-[#e7e1d9] bg-white/85 px-8 py-16 text-center">
      {/* Icône */}
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3b1f4a0d]">
        <svg className="h-8 w-8 text-[#3b1f4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-semibold text-[#1c1b1f]">
          Importez votre première scène
        </h2>
        <p className="max-w-sm text-sm text-[#524b5a] leading-relaxed">
          Photographiez ou scannez n&apos;importe quel texte — le rôle sera extrait automatiquement pour que vous puissiez commencer à travailler.
        </p>
        <p className="max-w-sm text-xs text-[#7a7184] leading-relaxed">
          Bientôt, vous pourrez aussi partager vos scènes avec d&apos;autres utilisateurs.
        </p>
      </div>

      <Link
        href="/scenes/import"
        className="flex items-center gap-2 rounded-xl bg-[#3b1f4a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2d1638]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        Importer une scène
      </Link>
    </div>
  );
}
