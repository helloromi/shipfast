import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";

type ImportJobRow = {
  id: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  draft_data: any;
  scene_id: string | null;
  error_message: string | null;
  progress_percentage: number | null;
  processing_stage: string | null;
  status_message: string | null;
};

function getTitleAuthor(draftData: any): { title: string; author: string | null } {
  if (!draftData || typeof draftData !== "object") return { title: "Import", author: null };
  const title = typeof draftData.title === "string" && draftData.title.trim() ? draftData.title.trim() : "Import";
  const author =
    typeof draftData.author === "string" && draftData.author.trim() ? draftData.author.trim() : null;
  return { title, author };
}

function badge(status: string) {
  switch (status) {
    case "preview_ready":
      return { label: "À valider", className: "bg-[#ff6b6b] text-white" };
    case "processing":
      return { label: "En cours", className: "bg-[#f4c95d33] text-[#3b1f4a]" };
    case "pending":
      return { label: "En attente", className: "bg-[#e7e1d9] text-[#3b1f4a]" };
    case "completed":
      return { label: "Terminé", className: "bg-[#d9f2e4] text-[#1c6b4f]" };
    case "error":
      return { label: "Erreur", className: "bg-red-100 text-red-700" };
    default:
      return { label: status, className: "bg-[#e7e1d9] text-[#3b1f4a]" };
  }
}

export default async function ImportsPage() {
  const user = await getSupabaseSessionUser();
  if (!user) redirect("/login");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("import_jobs")
    .select("id, status, created_at, updated_at, draft_data, scene_id, error_message, progress_percentage, processing_stage, status_message")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<ImportJobRow[]>();

  const jobs = error ? [] : data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">Imports</p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">Mes imports</h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          Retrouvez ici tous vos imports, même s'ils sont en cours ou en erreur.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/scenes/import"
            className="rounded-full bg-[#3b1f4a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2d1638]"
          >
            Lancer un import
          </Link>
          <Link
            href="/bibliotheque"
            className="rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33]"
          >
            Retour à la bibliothèque
          </Link>
        </div>
        {error ? (
          <p className="text-xs text-red-700">Impossible de charger les imports: {error.message}</p>
        ) : null}
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e7e1d9] bg-white/85 p-8 text-center">
          <p className="text-sm font-semibold text-[#3b1f4a]">Aucun import pour le moment</p>
          <p className="mt-2 text-sm text-[#524b5a]">
            Lancez un import depuis la page d'import, puis revenez ici pour suivre son statut.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => {
            const meta = getTitleAuthor(job.draft_data);
            const b = badge(job.status);

            const primaryHref =
              job.status === "completed" && job.scene_id ? `/scenes/${job.scene_id}` : `/imports/${job.id}/preview`;

            return (
              <Link
                key={job.id}
                href={primaryHref}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14] transition hover:-translate-y-[1px] hover:border-[#3b1f4a33] hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-semibold text-[#3b1f4a] line-clamp-1">
                    {meta.title}
                  </h2>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${b.className}`}>{b.label}</span>
                </div>

                {meta.author ? (
                  <p className="text-sm text-[#524b5a]">par {meta.author}</p>
                ) : (
                  <p className="text-sm text-[#7a7184]">Auteur inconnu</p>
                )}

                {job.status === "error" && job.error_message ? (
                  <p className="text-xs text-red-700 line-clamp-3">{job.error_message}</p>
                ) : (
                  <p className="text-xs text-[#7a7184]">
                    Créé le {new Date(job.created_at).toLocaleString("fr-FR")}
                  </p>
                )}

                {/* Barre de progression pour les imports en cours */}
                {(job.status === "processing" || job.status === "pending") && job.progress_percentage !== null && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-[#7a7184]">
                        {job.status_message || "Traitement en cours…"}
                      </span>
                      <span className="text-xs font-semibold text-[#3b1f4a]">
                        {job.progress_percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e7e1d9]">
                      <div
                        className="h-full rounded-full bg-[#3b1f4a] transition-[width] duration-300"
                        style={{ width: `${job.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                <p className="text-xs font-semibold text-[#3b1f4a] underline underline-offset-4">
                  {job.status === "completed" && job.scene_id ? "Ouvrir la scène" : "Ouvrir le preview / suivi"}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

