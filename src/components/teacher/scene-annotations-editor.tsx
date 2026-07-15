"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { t } from "@/locales/fr";
import type { ClassAnnotation } from "@/types/teacher";

type LineView = {
  id: string;
  text: string;
  characterName: string | null;
};

type Props = {
  classId: string;
  sceneId: string;
  lines: LineView[];
  annotations: ClassAnnotation[];
};

export function SceneAnnotationsEditor({ classId, sceneId, lines, annotations }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sceneDraft, setSceneDraft] = useState("");

  const sceneAnnotations = annotations.filter((a) => a.line_id === null);
  const byLine = new Map<string, ClassAnnotation[]>();
  for (const a of annotations) {
    if (!a.line_id) continue;
    const list = byLine.get(a.line_id) ?? [];
    list.push(a);
    byLine.set(a.line_id, list);
  }

  const call = async (method: string, body?: unknown, query?: string) => {
    if (busy) return false;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/teacher/annotations${query ?? ""}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Une erreur est survenue.");
      return false;
    }
    router.refresh();
    return true;
  };

  const saveLineAnnotation = async (lineId: string) => {
    const content = draft.trim();
    if (!content) return;
    const ok = editingId
      ? await call("PATCH", { id: editingId, content })
      : await call("POST", { classId, sceneId, lineId, content });
    if (ok) {
      setActiveLineId(null);
      setEditingId(null);
      setDraft("");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="rounded-xl bg-[#e11d4815] px-4 py-3 text-sm font-semibold text-[#e11d48]">{error}</p>
      )}

      {/* Note d'intention (niveau scène) */}
      <div className="card flex flex-col gap-3 p-5">
        <h2 id="scene-note-title" className="font-display text-lg font-semibold text-[#3b1f4a]">
          {t.teacher.annotations.sceneLevelTitle}
        </h2>
        {sceneAnnotations.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-3 rounded-xl bg-[#f4c95d1f] px-4 py-3">
            <p className="whitespace-pre-wrap text-sm text-[#211a26]">{a.content}</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (!confirm(t.teacher.annotations.deleteConfirm)) return;
                call("DELETE", undefined, `?id=${a.id}`);
              }}
              className="text-xs text-[#8a8093] hover:text-[#e11d48]"
              aria-label={t.teacher.annotations.delete}
            >
              ✕
            </button>
          </div>
        ))}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const content = sceneDraft.trim();
            if (!content) return;
            call("POST", { classId, sceneId, lineId: null, content }).then((ok) => {
              if (ok) setSceneDraft("");
            });
          }}
          className="flex flex-col gap-2"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={sceneDraft}
              onChange={(e) => setSceneDraft(e.target.value)}
              placeholder={t.teacher.annotations.sceneLevelPlaceholder}
              className="input flex-1"
              aria-labelledby="scene-note-title"
              aria-describedby="scene-note-hint"
            />
            <button type="submit" disabled={busy || !sceneDraft.trim()} className="btn-primary">
              {t.teacher.annotations.save}
            </button>
          </div>
          <p id="scene-note-hint" className="hint">
            {t.teacher.annotations.sceneLevelHint}
          </p>
        </form>
      </div>

      {/* Texte ligne à ligne */}
      <div className="flex flex-col gap-2">
        {lines.map((line) => {
          const lineAnnotations = byLine.get(line.id) ?? [];
          const isActive = activeLineId === line.id;
          return (
            <div
              key={line.id}
              className={`rounded-2xl border px-4 py-3 transition ${
                isActive
                  ? "border-[#f4c95d] bg-[#f4c95d14]"
                  : lineAnnotations.length > 0
                    ? "border-[#e7e0d4] bg-white/90"
                    : "border-[#efe9dd] bg-white/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#8a8093]">
                    {line.characterName ?? "—"}
                  </div>
                  <p className="mt-1 text-[15px] leading-relaxed text-[#211a26]">{line.text}</p>
                </div>
                {!isActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveLineId(line.id);
                      setEditingId(null);
                      setDraft("");
                    }}
                    className="shrink-0 rounded-full border border-[#e7e0d4] bg-white px-3 py-1 text-xs font-semibold text-[#3b1f4a] shadow-sm hover:border-[#3b1f4a55]"
                  >
                    ✎ {t.teacher.annotations.lineLevelHint}
                  </button>
                )}
              </div>

              {lineAnnotations.map((a) => (
                <div
                  key={a.id}
                  className="mt-2 flex items-start justify-between gap-3 rounded-xl border-l-4 border-[#f4c95d] bg-[#fdf8ec] px-3 py-2"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b08a26]">
                      {t.teacher.annotations.byTeacher}
                    </span>
                    <p className="whitespace-pre-wrap text-sm text-[#211a26]">{a.content}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setActiveLineId(line.id);
                        setEditingId(a.id);
                        setDraft(a.content);
                      }}
                      className="text-xs font-semibold text-[#8a8093] hover:text-[#3b1f4a]"
                    >
                      {t.teacher.annotations.edit}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        if (!confirm(t.teacher.annotations.deleteConfirm)) return;
                        call("DELETE", undefined, `?id=${a.id}`);
                      }}
                      className="text-xs text-[#8a8093] hover:text-[#e11d48]"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {isActive && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveLineAnnotation(line.id);
                  }}
                  className="mt-3 flex gap-2"
                >
                  <input
                    type="text"
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={t.teacher.annotations.addPlaceholder}
                    className="input flex-1"
                  />
                  <button type="submit" disabled={busy || !draft.trim()} className="btn-primary !min-h-[40px]">
                    {t.teacher.annotations.save}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveLineId(null);
                      setEditingId(null);
                      setDraft("");
                    }}
                    className="btn-ghost"
                  >
                    ✕
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
