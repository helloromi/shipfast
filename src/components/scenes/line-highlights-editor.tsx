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
      key: string; // `${startOffset}:${endOffset}`
      top: number;
      left: number;
    };

type CategoryField = "noteSubtext" | "noteIntonation" | "notePlay";

const CATEGORY_CONFIG: Record<
  CategoryField,
  { label: string; accent: string; bg: string; placeholder: (typeof t)["scenes"]["detail"]["highlights"]["placeholders"][keyof (typeof t)["scenes"]["detail"]["highlights"]["placeholders"]] }
> = {
  noteSubtext: {
    label: t.scenes.detail.highlights.labels.subtext,
    accent: "#16a34a",
    bg: "rgba(22, 163, 74, 0.14)",
    placeholder: t.scenes.detail.highlights.placeholders.subtext,
  },
  noteIntonation: {
    label: t.scenes.detail.highlights.labels.intonation,
    accent: "#2563eb",
    bg: "rgba(37, 99, 235, 0.13)",
    placeholder: t.scenes.detail.highlights.placeholders.intonation,
  },
  notePlay: {
    label: t.scenes.detail.highlights.labels.play,
    accent: "#7c3aed",
    bg: "rgba(124, 58, 237, 0.13)",
    placeholder: t.scenes.detail.highlights.placeholders.play,
  },
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

function compactOneLine(s: string, maxLen: number) {
  const one = (s ?? "").replace(/\s+/g, " ").trim();
  if (one.length <= maxLen) return one;
  return `${one.slice(0, Math.max(0, maxLen - 1)).trimEnd()}…`;
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

  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSuccessToastAtRef = useRef<number>(0);
  const popoverCheckRafRef = useRef<number | null>(null);
  const hoverCheckRafRef = useRef<number | null>(null);

  const [highlights, setHighlights] = useState<HighlightDraft[]>(() =>
    [...(initialHighlights ?? [])].sort((a, b) => a.startOffset - b.startOffset || a.endOffset - b.endOffset)
  );
  const [popover, setPopover] = useState<PopoverState>({ open: false });
  const [activeField, setActiveField] = useState<CategoryField | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const [hoverTip, setHoverTip] = useState<
    | { open: false }
    | { open: true; text: string; top: number; left: number }
  >({ open: false });

  useEffect(() => {
    setHighlights(
      [...(initialHighlights ?? [])].sort((a, b) => a.startOffset - b.startOffset || a.endOffset - b.endOffset)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineId]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (hoverCheckRafRef.current != null) {
        window.cancelAnimationFrame(hoverCheckRafRef.current);
        hoverCheckRafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!popover.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        void flushCurrentAndClose();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (popoverRef.current?.contains(target)) return;
      if (containerRef.current?.contains(target)) return;
      void flushCurrentAndClose();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popover.open, popoverRef, containerRef, highlights, activeField, popover]);

  useEffect(() => {
    if (!popover.open) return;
    if (!activeField) return;
    // Focus après render
    const tmr = window.setTimeout(() => textareaRef.current?.focus(), 0);
    return () => window.clearTimeout(tmr);
  }, [activeField, popover.open]);

  useEffect(() => {
    if (!popover.open) return;
    // Sur scroll/resize: si le popover sort de l'écran, on le ferme (avec flush).
    const check = () => {
      if (popoverCheckRafRef.current != null) return;
      popoverCheckRafRef.current = window.requestAnimationFrame(() => {
        popoverCheckRafRef.current = null;
        const el = popoverRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const isOut = r.bottom > vh || r.top < 0 || r.right > vw || r.left < 0;
        if (isOut) {
          void flushCurrentAndClose();
        }
      });
    };

    window.addEventListener("scroll", check, { passive: true, capture: true });
    window.addEventListener("resize", check, { passive: true });
    // Check initial (après mount)
    window.setTimeout(check, 0);

    return () => {
      window.removeEventListener("scroll", check, true);
      window.removeEventListener("resize", check);
      if (popoverCheckRafRef.current != null) {
        window.cancelAnimationFrame(popoverCheckRafRef.current);
        popoverCheckRafRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popover.open]);

  useEffect(() => {
    if (!hoverTip.open) return;
    const hide = () => hideHoverTip();
    window.addEventListener("scroll", hide, { passive: true, capture: true });
    window.addEventListener("resize", hide, { passive: true });
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoverTip.open]);

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

  const getFilledFields = (h: HighlightDraft | null): CategoryField[] => {
    if (!h) return [];
    const out: CategoryField[] = [];
    for (const f of ["noteSubtext", "noteIntonation", "notePlay"] as const) {
      const v = ((h as any)[f] as string | null | undefined) ?? "";
      if (v.trim().length > 0) out.push(f);
    }
    return out;
  };

  const getHoverTitle = (h: HighlightDraft | null) => {
    if (!h) return "";
    const fields = getFilledFields(h);
    if (fields.length === 0) return "";
    const lines = fields.map((f) => {
      const cfg = CATEGORY_CONFIG[f];
      const v = ((h as any)[f] as string | null | undefined) ?? "";
      return `${cfg.label} : ${compactOneLine(v, 80)}`;
    });
    return lines.join("\n");
  };

  const getPrimaryHoverSummary = (h: HighlightDraft | null) => {
    if (!h) return "";
    const priority: CategoryField[] = ["notePlay", "noteIntonation", "noteSubtext"];
    for (const f of priority) {
      const v = ((h as any)[f] as string | null | undefined) ?? "";
      if (!v.trim()) continue;
      const cfg = CATEGORY_CONFIG[f];
      return `${cfg.label} : ${compactOneLine(v, 80)}`;
    }
    return "";
  };

  const getHighlightStyle = (h: HighlightDraft | null): React.CSSProperties => {
    if (!h) return {};
    const fields = getFilledFields(h);
    if (fields.length === 0) {
      return { backgroundColor: "rgba(244, 201, 93, 0.25)" };
    }

    const colors = fields.map((f) => CATEGORY_CONFIG[f].accent);
    const bg = fields.length === 1 ? CATEGORY_CONFIG[fields[0]]!.bg : "rgba(244, 201, 93, 0.20)";

    if (colors.length === 1) {
      return {
        backgroundColor: bg,
        borderBottom: `2px solid ${colors[0]}`,
      };
    }

    // Underline multicolore (réparti sur la largeur du surlignage).
    const step = 100 / colors.length;
    const stops = colors
      .map((c, i) => {
        const a = i * step;
        const b = (i + 1) * step;
        return `${c} ${a}%, ${c} ${b}%`;
      })
      .join(", ");

    return {
      backgroundColor: bg,
      backgroundImage: `linear-gradient(to right, ${stops})`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "0 100%",
      backgroundSize: "100% 2px",
    };
  };

  const showHoverTip = (target: HTMLElement, text: string) => {
    const root = rootRef.current;
    if (!root) return;
    const rootRect = root.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    const width = 320;
    const padding = 10;

    // Position désirée: au-dessus du surlignage.
    let leftViewport = r.left + r.width / 2 - width / 2;
    let topViewport = r.top - 10;

    leftViewport = Math.max(padding, Math.min(leftViewport, window.innerWidth - width - padding));
    topViewport = Math.max(padding, topViewport);

    setHoverTip({
      open: true,
      text,
      left: leftViewport - rootRect.left,
      top: topViewport - rootRect.top,
    });
  };

  const hideHoverTip = () => setHoverTip({ open: false });

  const persistHighlightNow = async (h: HighlightDraft) => {
    const noteSubtext = (h.noteSubtext ?? "").trim();
    const noteIntonation = (h.noteIntonation ?? "").trim();
    const notePlay = (h.notePlay ?? "").trim();

    const isEmpty = !noteSubtext && !noteIntonation && !notePlay;
    const key = highlightKey(h);

    try {
      if (isEmpty) {
        if (h.isDraft) return { ok: true as const, deleted: false as const };
        const { error } = await supabase
          .from("user_line_highlights")
          .delete()
          .eq("user_id", userId)
          .eq("line_id", lineId)
          .eq("start_offset", h.startOffset)
          .eq("end_offset", h.endOffset);
        if (error) {
          console.error("Error deleting highlight:", error);
          setToast({ message: t.scenes.detail.highlights.saveErrorToast, variant: "error" });
          return { ok: false as const, deleted: false as const };
        }
        return { ok: true as const, deleted: true as const };
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
            // Catégorie "Libre" retirée de l'UI: on force à null pour éviter de conserver d'anciennes valeurs.
            note_free: null,
            note_subtext: noteSubtext || null,
            note_intonation: noteIntonation || null,
            note_play: notePlay || null,
          },
          { onConflict: "user_id,line_id,start_offset,end_offset" }
        );

      if (error) {
        console.error("Error saving highlight:", error);
        setToast({ message: t.scenes.detail.highlights.saveErrorToast, variant: "error" });
        return { ok: false as const, deleted: false as const };
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

      return { ok: true as const, deleted: false as const };
    } catch (err) {
      console.error("Error persisting highlight:", err);
      setToast({ message: t.scenes.detail.highlights.saveErrorToast, variant: "error" });
      return { ok: false as const, deleted: false as const };
    }
  };

  const flushCurrentAndClose = async () => {
    if (!popover.open) return;
    const key = popover.key;
    const h = findHighlight(key);
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    if (h) {
      // Sauvegarde immédiate pour éviter de perdre la note si l’utilisateur refresh/ferme trop vite.
      await persistHighlightNow(h);
    }

    // Si draft vide, on le retire.
    const hh = findHighlight(key);
    const empty =
      !(hh?.noteSubtext ?? "").trim() &&
      !(hh?.noteIntonation ?? "").trim() &&
      !(hh?.notePlay ?? "").trim();
    if (hh?.isDraft && empty) {
      setHighlights((prev) => prev.filter((x) => highlightKey(x) !== key));
    }

    setPopover({ open: false });
    setActiveField(null);
  };

  const openPopoverForKey = (key: string, anchorRect: DOMRect, opts?: { preferField?: typeof activeField }) => {
    const root = rootRef.current;
    const rootRect = root?.getBoundingClientRect();

    // Fallback: si on ne peut pas mesurer, on ouvre juste "sous le texte".
    if (!rootRect) {
      setPopover({ open: true, key, top: 8, left: 0 });
      return;
    }

    const popoverWidth = 360;
    const padding = 12;

    // Position désirée en coordonnées viewport.
    let leftViewport = anchorRect.left;
    let topViewport = anchorRect.bottom + 8;

    // Clamp viewport (pour éviter de sortir de l'écran).
    leftViewport = Math.max(padding, Math.min(leftViewport, window.innerWidth - popoverWidth - padding));
    topViewport = Math.max(padding, Math.min(topViewport, window.innerHeight - padding));

    // Convertir en coordonnées relatives au root.
    const left = leftViewport - rootRect.left;
    const top = topViewport - rootRect.top;

    setPopover({ open: true, key, top, left });
    const h = findHighlight(key);
    const preferred = opts?.preferField ?? null;
    if (preferred) {
      setActiveField(preferred);
      return;
    }
    // Par défaut: ouvrir la première catégorie déjà remplie, sinon rien.
    const firstFilled =
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
      openPopoverForKey(key, rect);
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
    openPopoverForKey(key, rect, { preferField: "noteSubtext" });
    sel.removeAllRanges();
  };

  const schedulePersist = (h: HighlightDraft) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      await persistHighlightNow(h);
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
      if (error) {
        console.error("Error deleting highlight:", error);
        setToast({ message: t.scenes.detail.highlights.saveErrorToast, variant: "error" });
      } else {
        setToast({ message: t.scenes.detail.highlights.deletedToast, variant: "success" });
      }
    } catch (err) {
      console.error("Error deleting highlight:", err);
      setToast({ message: t.scenes.detail.highlights.saveErrorToast, variant: "error" });
    }
  };

  const current = popover.open ? findHighlight(popover.key) : null;
  const categoryFields: CategoryField[] = ["noteSubtext", "noteIntonation", "notePlay"];

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1.5">
      <span
        ref={containerRef}
        onMouseUp={() => createOrOpenFromSelection()}
        className={className}
      >
        {segments.map((seg) => {
          if (seg.kind === "text") return <span key={seg.idx}>{seg.text}</span>;
          const h = findHighlight(seg.key);
          const title = getHoverTitle(h);
          const style = getHighlightStyle(h);
          const summary = getPrimaryHoverSummary(h);
          return (
            <span
              key={seg.idx}
              role="button"
              tabIndex={0}
              onMouseEnter={(e) => {
                if (popover.open) return; // pas de tooltip pendant l'édition
                if (!summary) return;
                const el = e.currentTarget as HTMLElement;
                if (hoverCheckRafRef.current != null) window.cancelAnimationFrame(hoverCheckRafRef.current);
                hoverCheckRafRef.current = window.requestAnimationFrame(() => {
                  hoverCheckRafRef.current = null;
                  showHoverTip(el, summary);
                });
              }}
              onMouseLeave={() => hideHoverTip()}
              onClick={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                openPopoverForKey(seg.key, rect);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  openPopoverForKey(seg.key, rect);
                }
              }}
              style={style}
              className="rounded-[6px] px-0.5 outline-none ring-offset-2 transition hover:brightness-[0.98] focus-visible:ring-2 focus-visible:ring-[#ff6b6b]"
              title={title || undefined}
            >
              {seg.text}
            </span>
          );
        })}
      </span>

      {hoverTip.open && (
        <div
          style={{ top: hoverTip.top, left: hoverTip.left, width: 320 }}
          className="pointer-events-none absolute z-50 rounded-xl border border-[#e7e1d9] bg-white/95 px-3 py-2 text-sm font-semibold text-[#3b1f4a] shadow-lg shadow-[#3b1f4a1a] backdrop-blur"
          role="tooltip"
        >
          {hoverTip.text}
        </div>
      )}

      {popover.open && current && (
        <div
          ref={popoverRef}
          style={{ top: popover.top, left: popover.left }}
          className="absolute z-60 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#e7e1d9] bg-white/95 p-4 shadow-lg shadow-[#3b1f4a22] backdrop-blur"
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
                void flushCurrentAndClose();
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
              {categoryFields.map((field) => {
                const cfg = CATEGORY_CONFIG[field];
                const value = ((current as any)?.[field] as string | null | undefined) ?? "";
                const filled = value.trim().length > 0;
                const isActive = activeField === field;
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => setActiveField((prev) => (prev === field ? null : field))}
                    style={{
                      borderColor: isActive ? `${cfg.accent}66` : undefined,
                      background: isActive ? cfg.bg : undefined,
                    }}
                    className="flex items-center justify-between gap-2 rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-left transition hover:border-[#3b1f4a66]"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: cfg.accent }} />
                      <span className="min-w-0 whitespace-normal text-sm font-semibold text-[#3b1f4a] leading-tight">
                        {cfg.label}
                      </span>
                    </span>
                    <span className="flex-none text-xs font-semibold text-[#7a7184]">
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
                style={{ outline: "none" }}
                className="mt-1 w-full rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner !outline-none focus:border-[#3b1f4a] focus:!outline-none focus-visible:!outline-none focus-visible:ring-2 focus-visible:ring-[#3b1f4a66] focus-visible:ring-offset-2"
                placeholder={CATEGORY_CONFIG[activeField]?.placeholder ?? ""}
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

