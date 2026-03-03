import { notFound, redirect } from "next/navigation";

import { fetchSceneWithRelations, getSupabaseSessionUser } from "@/lib/queries/scenes";
import { fetchUserLineNotes, fetchUserLineHighlights } from "@/lib/queries/notes";
import { hasAccess } from "@/lib/queries/access";
import { ensurePersonalSceneForCurrentUser } from "@/lib/utils/personal-scene";
import { requireSubscriptionOrRedirect } from "@/lib/utils/require-subscription";
import { ExportPrintTrigger } from "@/components/scenes/export-print-trigger";
import { t } from "@/locales/fr";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function SceneExportPage({ params }: Props) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const scene = await fetchSceneWithRelations(id);
  if (!scene) {
    notFound();
  }

  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }
  await requireSubscriptionOrRedirect(user);

  if (!scene.is_private) {
    const access = await hasAccess(user.id, scene.work_id ?? undefined, scene.id);
    if (access) {
      const ensured = await ensurePersonalSceneForCurrentUser(scene.id);
      if (ensured.ok && ensured.personalSceneId !== scene.id) {
        redirect(`/scenes/${ensured.personalSceneId}/export`);
      }
    }
  }

  const sortedLines = [...scene.lines].sort((a, b) => a.order - b.order);
  const lineIds = sortedLines.map((l) => l.id);

  const [notesByLineId, highlightsByLineId] = await Promise.all([
    fetchUserLineNotes(user.id, lineIds),
    fetchUserLineHighlights(user.id, lineIds),
  ]);

  const printStyles = `
    @media print {
      body * { visibility: hidden; }
      .export-print-view, .export-print-view * { visibility: visible; }
      .export-print-view { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
    }
    .print-line-block { break-inside: avoid; page-break-inside: avoid; }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <div className="export-print-view print-only max-w-3xl mx-auto px-4 py-6 sm:px-6">
        <ExportPrintTrigger />
        <header className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-[#1c1b1f]">{scene.title}</h1>
          {scene.author && (
            <p className="mt-1 text-sm text-[#524b5a]">
              {t.common.labels.par} {scene.author}
            </p>
          )}
          {scene.chapter && (
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
              {t.common.labels.chapitre} : {scene.chapter}
            </p>
          )}
        </header>

        <div className="flex flex-col gap-6">
          {sortedLines.map((line) => {
            const lineNote = notesByLineId[line.id]?.trim();
            const highlights = highlightsByLineId[line.id] ?? [];

            return (
              <section key={line.id} className="print-line-block border-b border-[#e7e1d9] pb-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                  {line.characters?.name ?? t.common.labels.personnage}
                </div>
                <p className="mt-0.5 text-sm text-[#1c1b1f]">{line.text}</p>

                {lineNote && (
                  <div className="mt-2 text-sm text-[#524b5a]">
                    <span className="font-semibold">{t.scenes.detail.notes.notePerso} : </span>
                    {lineNote}
                  </div>
                )}

                {highlights.length > 0 && (
                  <ul className="mt-2 list-none space-y-2 pl-0">
                    {highlights.map((h, i) => {
                      const parts: string[] = [];
                      if (h.noteFree?.trim()) parts.push(`${t.scenes.detail.highlights.labels.free}: ${h.noteFree.trim()}`);
                      if (h.noteSubtext?.trim()) parts.push(`${t.scenes.detail.highlights.labels.subtext}: ${h.noteSubtext.trim()}`);
                      if (h.noteIntonation?.trim()) parts.push(`${t.scenes.detail.highlights.labels.intonation}: ${h.noteIntonation.trim()}`);
                      if (h.notePlay?.trim()) parts.push(`${t.scenes.detail.highlights.labels.play}: ${h.notePlay.trim()}`);
                      return (
                        <li key={i} className="rounded border border-[#e7e1d9] bg-[#f9f7f3] p-2 text-sm">
                          {h.selectedText && (
                            <p className="font-medium text-[#3b1f4a]">
                              « {h.selectedText} »
                            </p>
                          )}
                          {parts.length > 0 && (
                            <p className="mt-1 text-[#524b5a]">{parts.join(" — ")}</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
