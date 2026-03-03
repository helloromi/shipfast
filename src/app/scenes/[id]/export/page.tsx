import { notFound, redirect } from "next/navigation";

import { fetchSceneWithRelations, fetchUserProgressScenes, getSupabaseSessionUser } from "@/lib/queries/scenes";
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

  const [userProgress, notesByLineId, highlightsByLineId] = await Promise.all([
    fetchUserProgressScenes(user.id).then((p) => p.find((p) => p.sceneId === id)),
    fetchUserLineNotes(user.id, lineIds),
    fetchUserLineHighlights(user.id, lineIds),
  ]);
  const lastCharacterId = userProgress?.lastCharacterId ?? null;

  const printStyles = `
    @media print {
      body * { visibility: hidden; }
      .export-print-view, .export-print-view * { visibility: visible; }
      .export-print-view { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
    }
    .print-line-block { break-inside: avoid; page-break-inside: avoid; }
    .export-my-line { font-weight: 700; background-color: rgba(244, 201, 93, 0.25); }
    @media print { .export-my-line { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
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

        <div className="flex flex-col gap-5">
          {sortedLines.map((line) => {
            const lineNote = notesByLineId[line.id]?.trim();
            const highlights = highlightsByLineId[line.id] ?? [];
            const isMyCharacter = lastCharacterId != null && line.character_id === lastCharacterId;

            return (
              <section
                key={line.id}
                className={`print-line-block ${isMyCharacter ? "export-my-line rounded px-2 py-1 -mx-2" : ""}`}
              >
                <div
                  className={`text-xs font-semibold uppercase tracking-wide ${isMyCharacter ? "text-[#3b1f4a]" : "text-[#7a7184]"}`}
                >
                  {line.characters?.name ?? t.common.labels.personnage}
                </div>
                <p
                  className={`mt-0.5 text-sm leading-relaxed ${isMyCharacter ? "font-bold text-[#1c1b1f]" : "text-[#1c1b1f]"}`}
                >
                  {line.text}
                </p>

                {lineNote && (
                  <p className="mt-1.5 pl-3 text-xs text-[#524b5a] border-l-2 border-[#e7e1d9]">
                    <span className="font-medium">{t.scenes.detail.notes.notePerso} — </span>
                    {lineNote}
                  </p>
                )}

                {highlights.length > 0 && (
                  <div className="mt-1.5 space-y-1.5">
                    {highlights.map((h, i) => {
                      const parts: string[] = [];
                      if (h.noteFree?.trim()) parts.push(`${t.scenes.detail.highlights.labels.free}: ${h.noteFree.trim()}`);
                      if (h.noteSubtext?.trim()) parts.push(`${t.scenes.detail.highlights.labels.subtext}: ${h.noteSubtext.trim()}`);
                      if (h.noteIntonation?.trim()) parts.push(`${t.scenes.detail.highlights.labels.intonation}: ${h.noteIntonation.trim()}`);
                      if (h.notePlay?.trim()) parts.push(`${t.scenes.detail.highlights.labels.play}: ${h.notePlay.trim()}`);
                      return (
                        <p key={i} className="pl-3 text-xs text-[#524b5a] border-l-2 border-[#e7e1d9]">
                          {h.selectedText && (
                            <span className="italic text-[#3b1f4a]">« {h.selectedText} »</span>
                          )}
                          {h.selectedText && parts.length > 0 && " — "}
                          {parts.length > 0 && parts.join(" · ")}
                        </p>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
