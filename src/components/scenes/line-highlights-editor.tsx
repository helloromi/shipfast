"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { Toast } from "@/components/ui/toast";
import type { UserLineHighlight } from "@/lib/queries/notes";
import { t } from "@/locales/fr";

type HighlightDraft = UserLineHighlight & {
  isDraft?: boolean;
};

type Props = {
  lineId: string;
  userId: string;
  text: string;
  initialHighlights: UserLineHighlight[];
  className?: string;
  isUserCharacter?: boolean;
};

type PopoverState =
  | { open: false }
  | {
      open: true;
      x: number;
      y: number;
      key: string; // `${startOffset}:${endOffset}`
    };

function highlightKey(h: { startOffset: number; endOffset: number }) {
  return `${h.startOffset}:${h.endOffset}`;
}

function clampRange(start: number, end: number, max: number) {
  const s = Math.max(0, Math.min(start, max));
  const e = Math.max(0, Math.min(end, max));
  if (e <= s) return { start: 0, end: 0 };
  return { start: s, end: e };
}

function getSelectionOffsets(container: HTMLElement, range: Range) {
  if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
    return null;
  }

  const beforeStart = document.createRange();
  beforeStart.setStart(container, 0);
  beforeStart.setEnd(range.startContainer, range.startOffset);
  const startOffset = beforeStart.toString().length;

  const beforeEnd = document.createRange();
  beforeEnd.setStart(container, 0);
  beforeEnd.setEnd(range.endContainer, range.endOffset);
  const endOffset = beforeEnd.toString().length;

  const start = Math.min(startOffset, endOffset);
  const end = Math.max(startOffset, endOffset);

  return { startOffset: start, endOffset: end };
}

export function LineHighlightsEditor(props: Props) {
  const { lineId, userId, text, initialHighlights, className, isUserCharacter } = props;
  const { supabase } = useSupabase();

  const containerRef = useRef<HTMLSpanElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSuccessToastAtRef = useRef<number>(0);

  const [highlights, setHighlights] = useState<HighlightDraft[]>(() =>
    [...(initialHighlights ?? [])].sort((a, b) => a.startOffset - b.startOffset || a.endOffset - b.endOffset)
  );
  const [popover, setPopover] = useState<PopoverState>({ open: false });
  const [activeField, setActiveField] = useState<"noteFree" | "noteSubtext" | "noteIntonation" | "notePlay" | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    setHighlights(
      [...(initialHighlights ?? [])].sort((a, b) => a.startOffset - b.startOffset || a.endOffset - b.endOffset)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineId]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!popover.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopover({ open: false });
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (popoverRef.current?.contains(target)) return;
      if (containerRef.current?.contains(target)) return;
      setPopover({ open: false });
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [popover.open]);

  useEffect(() => {
    if (!popover.open) return;
    if (!activeField) return;
    // Focus après render
    const tmr = window.setTimeout(() => textareaRef.current?.focus(), 0);
    return () => window.clearTimeout(tmr);
  }, [activeField, popover.open]);

  const sortedHighlights = useMemo(() => {
    return [...highlights].sort((a, b) => a.startOffset - b.startOffset || a.endOffset - b.endOffset);
  }, [highlights]);

  const segments = useMemo(() => {
    const max = (text ?? "").length;
    const out: Array<
      | { kind: "text"; text: string; idx: number }
      | { kind: "hl"; text: string; idx: number; key: string }
    > = [];
    let cursor = 0;
    let idx = 0;
    for (const h of sortedHighlights) {
      const { start, end } = clampRange(h.startOffset, h.endOffset, max);
      if (start === 0 && end === 0) continue;
      if (start > cursor) {
        out.push({ kind: "text", text: text.slice(cursor, start), idx: idx++ });
      }
      const slice = text.slice(start, end);
      out.push({ kind: "hl", text: slice, idx: idx++, key: highlightKey(h) });
      cursor = end;
    }
    if (cursor < max) out.push({ kind: "text", text: text.slice(cursor), idx: idx++ });
    if (out.length === 0) out.push({ kind: "text", text: text ?? "", idx: 0 });
    return out;
  }, [sortedHighlights, text]);

  const findHighlight = (key: string) => highlights.find((h) => highlightKey(h) === key) ?? null;

  const openPopoverAt = (key: string, rect: DOMRect, opts?: { preferField?: typeof activeField }) => {
    const x = Math.min(Math.max(12, rect.left), window.innerWidth - 320);
    const y = Math.min(Math.max(12, rect.bottom + 8), window.innerHeight - 24);
    setPopover({ open: true, x, y, key });
    const h = findHighlight(key);
    const preferred = opts?.preferField ?? null;
    if (preferred) {
      setActiveField(preferred);
      return;
    }
    // Par défaut: ouvrir la première catégorie déjà remplie, sinon rien.
    const firstFilled =
      (h?.noteFree ?? "").trim() ? "noteFree" :
      (h?.noteSubtext ?? "").trim() ? "noteSubtext" :
      (h?.noteIntonation ?? "").trim() ? "noteIntonation" :
      (h?.notePlay ?? "").trim() ? "notePlay" :
      null;
    setActiveField(firstFilled);
  };

  const createOrOpenFromSelection = () => {
    setToast(null);
    const container = containerRef.current;
    if (!container) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;

    if (!container.contains(range.commonAncestorContainer)) return;
    const offsets = getSelectionOffsets(container, range);
    if (!offsets) return;

    const max = (text ?? "").length;
    const { start, end } = clampRange(offsets.startOffset, offsets.endOffset, max);
    if (end <= start) return;

    const selectedText = (text ?? "").slice(start, end);
    if (selectedText.trim().length === 0) return;

    const key = `${start}:${end}`;

    const exact = highlights.find((h) => highlightKey(h) === key);
    const overlaps = highlights.find(
      (h) => start < h.endOffset && end > h.startOffset && highlightKey(h) !== key
    );
    if (!exact && overlaps) {
      setToast({ message: t.scenes.detail.highlights.overlapError, variant: "error" });
      sel.removeAllRanges();
      return;
    }

    const rect = range.getBoundingClientRect();

    if (exact) {
      openPopoverAt(key, rect);
      sel.removeAllRanges();
      return;
    }

    const now = new Date().toISOString();
    const draft: HighlightDraft = {
      lineId,
      startOffset: start,
      endOffset: end,
      selectedText,
      noteFree: null,
      noteSubtext: null,
      noteIntonation: null,
      notePlay: null,
      createdAt: now,
      updatedAt: now,
      isDraft: true,
    };

    setHighlights((prev) => [...prev, draft].sort((a, b) => a.startOffset - b.startOffset || a.endOffset - b.endOffset));
    openPopoverAt(key, rect, { preferField: "noteFree" });
    sel.removeAllRanges();
  };

  const schedulePersist = (h: HighlightDraft) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      const noteFree = (h.noteFree ?? "").trim();
      const noteSubtext = (h.noteSubtext ?? "").trim();
      const noteIntonation = (h.noteIntonation ?? "").trim();
      const notePlay = (h.notePlay ?? "").trim();

      const isEmpty = !noteFree && !noteSubtext && !noteIntonation && !notePlay;
      const key = highlightKey(h);

      try {
        if (isEmpty) {
          if (h.isDraft) {
            // Ne pas persister les drafts vides.
            return;
          }
          const { error } = await supabase
            .from("user_line_highlights")
            .delete()
            .eq("user_id", userId)
            .eq("line_id", lineId)
            .eq("start_offset", h.startOffset)
            .eq("end_offset", h.endOffset);
          if (error) {
            console.error("Error deleting highlight:", error);
          }
          return;
        }

        const { error } = await supabase
          .from("user_line_highlights")
          .upsert(
            {
              user_id: userId,
              line_id: lineId,
              start_offset: h.startOffset,
              end_offset: h.endOffset,
              selected_text: h.selectedText ?? "",
              note_free: noteFree || null,
              note_subtext: noteSubtext || null,
              note_intonation: noteIntonation || null,
              note_play: notePlay || null,
            },
            { onConflict: "user_id,line_id,start_offset,end_offset" }
          );
        if (error) {
          console.error("Error saving highlight:", error);
          return;
        }

        // Toast succès (throttlé) pour éviter le spam pendant la saisie.
        const nowMs = Date.now();
        const shouldToast = h.isDraft || nowMs - lastSuccessToastAtRef.current > 2500;
        if (shouldToast) {
          lastSuccessToastAtRef.current = nowMs;
          setToast({ message: t.scenes.detail.highlights.savedToast, variant: "success" });
        }

        // Marquer comme non-draft après une première persistance.
        setHighlights((prev) =>
          prev.map((x) => (highlightKey(x) === key ? { ...x, isDraft: false } : x))
        );
      } catch (err) {
        console.error("Error persisting highlight:", err);
      }
    }, 450);
  };

  const updateField = (key: string, field: "noteFree" | "noteSubtext" | "noteIntonation" | "notePlay", value: string) => {
    setHighlights((prev) => {
      const next = prev.map((h) => (highlightKey(h) === key ? { ...h, [field]: value } : h));
      const current = next.find((h) => highlightKey(h) === key);
      if (current) schedulePersist(current);
      return next;
    });
  };

  const deleteHighlight = async (key: string) => {
    const h = findHighlight(key);
    if (!h) return;

    setPopover({ open: false });
    setHighlights((prev) => prev.filter((x) => highlightKey(x) !== key));

    if (h.isDraft) return;
    try {
      const { error } = await supabase
        .from("user_line_highlights")
        .delete()
        .eq("user_id", userId)
        .eq("line_id", lineId)
        .eq("start_offset", h.startOffset)
        .eq("end_offset", h.endOffset);
      if (error) console.error("Error deleting highlight:", error);
      else setToast({ message: t.scenes.detail.highlights.deletedToast, variant: "success" });
    } catch (err) {
      console.error("Error deleting highlight:", err);
    }
  };

  const current = popover.open ? findHighlight(popover.key) : null;

  const categories: Array<{
    field: NonNullable<typeof activeField>;
    label: string;
    placeholder: string;
    getValue: (h: HighlightDraft) => string;
  }> = [
    {
      field: "noteFree",
      label: t.scenes.detail.highlights.labels.free,
      placeholder: t.scenes.detail.highlights.placeholders.free,
      getValue: (h) => h.noteFree ?? "",
    },
    {
      field: "noteSubtext",
      label: t.scenes.detail.highlights.labels.subtext,
      placeholder: t.scenes.detail.highlights.placeholders.subtext,
      getValue: (h) => h.noteSubtext ?? "",
    },
    {
      field: "noteIntonation",
      label: t.scenes.detail.highlights.labels.intonation,
      placeholder: t.scenes.detail.highlights.placeholders.intonation,
      getValue: (h) => h.noteIntonation ?? "",
    },
    {
      field: "notePlay",
      label: t.scenes.detail.highlights.labels.play,
      placeholder: t.scenes.detail.highlights.placeholders.play,
      getValue: (h) => h.notePlay ?? "",
    },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <span
        ref={containerRef}
        onMouseUp={() => createOrOpenFromSelection()}
        className={className}
      >
        {segments.map((seg) => {
          if (seg.kind === "text") return <span key={seg.idx}>{seg.text}</span>;
          return (
            <span
              key={seg.idx}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                openPopoverAt(seg.key, rect);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  openPopoverAt(seg.key, rect);
                }
              }}
              className="rounded-[6px] bg-[#f4c95d55] px-0.5 outline-none ring-offset-2 transition hover:bg-[#f4c95d77] focus-visible:ring-2 focus-visible:ring-[#ff6b6b]"
              title="Cliquer pour éditer la note"
            >
              {seg.text}
            </span>
          );
        })}
      </span>

      {popover.open && current && (
        <div
          ref={popoverRef}
          style={{ position: "fixed", left: popover.x, top: popover.y, width: 320, zIndex: 60 }}
          className="rounded-2xl border border-[#e7e1d9] bg-white/95 p-4 shadow-lg shadow-[#3b1f4a22] backdrop-blur"
          role="dialog"
          aria-label={t.scenes.detail.highlights.title}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
              {t.scenes.detail.highlights.passage}
            </div>
            <button
              type="button"
              onClick={() => {
                // Si draft vide, on le retire.
                const k = popover.key;
                const h = findHighlight(k);
                const empty =
                  !(h?.noteFree ?? "").trim() &&
                  !(h?.noteSubtext ?? "").trim() &&
                  !(h?.noteIntonation ?? "").trim() &&
                  !(h?.notePlay ?? "").trim();
                if (h?.isDraft && empty) {
                  setHighlights((prev) => prev.filter((x) => highlightKey(x) !== k));
                }
                setPopover({ open: false });
                setActiveField(null);
              }}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold text-[#524b5a] hover:bg-black/5"
              aria-label={t.scenes.detail.highlights.actions.close}
            >
              ×
            </button>
          </div>
          <div className="mt-1 line-clamp-2 text-sm text-[#1c1b1f]">{current.selectedText}</div>

          <div className="mt-3 grid gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#7a7184]">
              {t.scenes.detail.highlights.chooseCategory}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => {
                const filled = c.getValue(current).trim().length > 0;
                const isActive = activeField === c.field;
                return (
                  <button
                    key={c.field}
                    type="button"
                    onClick={() => setActiveField((prev) => (prev === c.field ? null : c.field))}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                      isActive
                        ? "border-[#3b1f4a66] bg-[#3b1f4a0a] text-[#3b1f4a]"
                        : "border-[#e7e1d9] bg-white text-[#3b1f4a] hover:border-[#3b1f4a66]"
                    }`}
                  >
                    <span className="truncate">{c.label}</span>
                    <span className="text-xs font-semibold text-[#7a7184]">
                      {filled ? t.scenes.detail.highlights.status.filled : t.scenes.detail.highlights.status.empty}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeField && (
              <textarea
                ref={textareaRef}
                rows={4}
                value={(current[activeField] as string | null) ?? ""}
                onChange={(e) => updateField(popover.key, activeField, e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
                placeholder={categories.find((c) => c.field === activeField)?.placeholder ?? ""}
              />
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => void deleteHighlight(popover.key)}
              className="text-sm font-semibold text-[#b42318] underline underline-offset-4"
            >
              {t.scenes.detail.highlights.actions.delete}
            </button>
            <div className="text-xs font-semibold text-[#7a7184]">{isUserCharacter ? "Ton personnage" : ""}</div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          duration={toast.variant === "success" ? 1600 : 4000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

