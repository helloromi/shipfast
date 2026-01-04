"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useSupabase } from "@/components/supabase-provider";
import { Toast } from "@/components/ui/toast";
import { t } from "@/locales/fr";

type LearnLine = {
  id: string;
  order: number;
  text: string;
  characterName: string;
  isUserLine: boolean;
};

type LearnSessionProps = {
  sceneTitle: string;
  sceneId: string;
  characterId: string;
  userCharacterName: string;
  lines: LearnLine[];
  userId: string;
};

type LineState = "hidden" | "revealed" | "scored";

type ToastState = {
  message: string;
  variant: "success" | "error";
};

type InputMode = "write" | "revealOnly";
type HintMode = "nextWord" | "initials";

type ScoreOption = {
  value: number;
  emoji: string;
  label: string;
  color: string;
};

const scoreOptions: ScoreOption[] = [
  { value: 0, emoji: t.learn.scores.rate.emoji, label: t.learn.scores.rate.label, color: "bg-[#e11d48] text-white hover:bg-[#c4153c]" },
  { value: 1, emoji: t.learn.scores.hesitant.emoji, label: t.learn.scores.hesitant.label, color: "bg-[#f59e0b] text-white hover:bg-[#d88405]" },
  { value: 2, emoji: t.learn.scores.bon.emoji, label: t.learn.scores.bon.label, color: "bg-[#f4c95d] text-[#1c1b1f] hover:bg-[#e6b947]" },
  { value: 3, emoji: t.learn.scores.parfait.emoji, label: t.learn.scores.parfait.label, color: "bg-[#2cb67d] text-white hover:bg-[#239b6a]" },
];

function isLikelyStageDirection(line: Pick<LearnLine, "text" | "characterName">) {
  const name = (line.characterName || "").trim().toLowerCase();
  if (/(didascalie|didas|sc[eè]ne|narrateur|stage)/i.test(name)) return true;
  const text = (line.text || "").trim();
  if (!text) return false;
  if ((text.startsWith("[") && text.endsWith("]")) || (text.startsWith("(") && text.endsWith(")"))) {
    return true;
  }
  return false;
}

function renderCue(text: string, lastWords = 5) {
  const trimmed = (text || "").trim();
  if (!trimmed) return null;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= lastWords) {
    return <strong>{trimmed}</strong>;
  }
  const head = words.slice(0, Math.max(0, words.length - lastWords)).join(" ");
  const tail = words.slice(-lastWords).join(" ");
  return (
    <>
      {head} <strong>{tail}</strong>
    </>
  );
}

export function LearnSession({
  sceneTitle,
  sceneId,
  characterId,
  userCharacterName,
  lines,
  userId,
}: LearnSessionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();

  const isZen = searchParams?.get("zen") === "1";

  const [showSetupModal, setShowSetupModal] = useState(true);
  const [limitCount, setLimitCount] = useState<number | null>(null); // null => toutes
  const [inputMode, setInputMode] = useState<InputMode>("write");
  const [hintMode, setHintMode] = useState<HintMode>("nextWord");
  const [hintProgress, setHintProgress] = useState<Record<string, number>>({});
  const [showStageDirections, setShowStageDirections] = useState(true);

  const [lineState, setLineState] = useState<Record<string, LineState>>(() =>
    lines.reduce(
      (acc, line) => ({
        ...acc,
        [line.id]: line.isUserLine ? "hidden" : "scored",
      }),
      {} as Record<string, LineState>
    )
  );

  const [scoreValue, setScoreValue] = useState<Record<string, number | null>>(() =>
    lines.reduce(
      (acc, line) => ({
        ...acc,
        [line.id]: line.isUserLine ? null : null,
      }),
      {} as Record<string, number | null>
    )
  );

  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<ToastState | null>(null);
  const [mode, setMode] = useState<"list" | "flashcard">("list");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showZenReview, setShowZenReview] = useState(false);
  const [zenSaving, setZenSaving] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const timeInterval = useRef<NodeJS.Timeout | null>(null);
  const lineRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  // IMPORTANT: on ne veut pas "réutiliser" les brouillons d'une session à l'autre.
  // On lie donc la clé de persistance à la session (créée côté serveur).
  const storageKey = useMemo(() => {
    if (!sessionId) return null;
    return `drafts:${sceneId}:${characterId}:${sessionId}`;
  }, [sceneId, characterId, sessionId]);

  // Mode auto : desktop -> liste, mobile -> flashcard
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    queueMicrotask(() => setMode(isMobile ? "flashcard" : "list"));
  }, []);

  // En mode Zen, on force un flow "une réplique à la fois" et on épure l'UI.
  useEffect(() => {
    if (!isZen) return;
    queueMicrotask(() => setMode("flashcard"));
    queueMicrotask(() => setInputMode("revealOnly"));
  }, [isZen]);

  // Timer pour afficher le temps écoulé
  useEffect(() => {
    if (sessionStartTime === null) return;

    timeInterval.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => {
      if (timeInterval.current) {
        clearInterval(timeInterval.current);
      }
    };
  }, [sessionStartTime]);

  // Charger les brouillons depuis localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!storageKey) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;
        queueMicrotask(() => setDrafts(parsed));
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Sauvegarder les brouillons (debounce)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!storageKey) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(drafts));
      } catch {
        // ignore
      }
    }, 300);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [drafts, storageKey]);

  const userLinesAll = useMemo(() => lines.filter((l) => l.isUserLine), [lines]);
  const userLines = useMemo(() => {
    if (limitCount === null) return userLinesAll;
    return userLinesAll.slice(0, limitCount);
  }, [limitCount, userLinesAll]);

  const displayLines = useMemo(() => {
    if (limitCount === null) return lines;
    const lastUserLine = userLines[userLines.length - 1];
    if (!lastUserLine) return [];
    return lines.filter((l) => l.order <= lastUserLine.order);
  }, [lines, limitCount, userLines]);

  const visibleLines = useMemo(() => {
    if (showStageDirections) return displayLines;
    return displayLines.filter((l) => !isLikelyStageDirection(l));
  }, [displayLines, showStageDirections]);

  const cueLineIds = useMemo(() => {
    // Pour chaque réplique utilisateur, identifier la réplique (non didascalie) immédiatement précédente
    // et marquer cette réplique comme "amorce" (mise en gras des 5 derniers mots).
    const ids = new Set<string>();
    const sorted = [...visibleLines].sort((a, b) => a.order - b.order);
    for (let i = 0; i < sorted.length; i += 1) {
      const line = sorted[i];
      if (!line.isUserLine) continue;
      for (let j = i - 1; j >= 0; j -= 1) {
        const prev = sorted[j];
        if (isLikelyStageDirection(prev)) continue;
        if (!prev.isUserLine) {
          ids.add(prev.id);
        }
        break;
      }
    }
    return ids;
  }, [visibleLines]);

  useEffect(() => {
    // Sécurité : si on change la limite, on revient au début du paquet.
    setCurrentIndex(0);
  }, [limitCount]);

  const remainingCount = useMemo(
    () => userLines.filter((l) => scoreValue[l.id] === null || scoreValue[l.id] === undefined).length,
    [userLines, scoreValue]
  );

  const summaryCounts = useMemo(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    userLines.forEach((l) => {
      const val = scoreValue[l.id];
      if (val !== null && val !== undefined) {
        counts[val] = (counts[val] ?? 0) + 1;
      }
    });
    return counts;
  }, [scoreValue, userLines]);

  const startTrackingSession = async (totalLines: number) => {
    try {
      const response = await fetch("/api/sessions/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId,
          characterId,
          totalLines,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.sessionId) {
          setSessionId(data.sessionId);
          setSessionStartTime(Date.now());
        }
      }
    } catch (error) {
      console.error("Error starting session:", error);
    }
  };

  const lineById = useMemo(() => new Map(lines.map((l) => [l.id, l])), [lines]);

  const getWordCount = (text: string) => (text || "").trim().split(/\s+/).filter(Boolean).length;

  const renderHintedText = (text: string, revealedWords: number) => {
    const trimmed = (text || "").trim();
    if (!trimmed) return "—";
    const words = trimmed.split(/\s+/).filter(Boolean);
    const shown = Math.max(0, Math.min(revealedWords, words.length));
    const out = words.map((w, idx) => {
      if (idx < shown) return w;
      if (hintMode === "initials") {
        const first = w.trim().charAt(0);
        return first ? `${first}…` : "…";
      }
      // nextWord: masquer le mot
      return "▢▢▢";
    });
    return out.join(" ");
  };

  const revealLine = (lineId: string) => {
    const text = lineById.get(lineId)?.text ?? "";
    const total = getWordCount(text);
    if (total > 0) {
      setHintProgress((prev) => ({ ...prev, [lineId]: total }));
    }
    setLineState((prev) => ({ ...prev, [lineId]: "revealed" }));
  };

  const revealNextWord = (lineId: string) => {
    const text = lineById.get(lineId)?.text ?? "";
    const total = getWordCount(text);
    if (total <= 0) return;
    setHintProgress((prev) => {
      const cur = prev[lineId] ?? 0;
      const nextCount = Math.min(total, cur + 1);
      const next = { ...prev, [lineId]: nextCount };
      if (nextCount >= total) {
        queueMicrotask(() => revealLine(lineId));
      }
      return next;
    });
  };

  const saveScore = async (lineId: string, score: number) => {
    setSaving((prev) => ({ ...prev, [lineId]: true }));
    setToast(null);
    const { error } = await supabase.from("user_line_feedback").insert({
      line_id: lineId,
      user_id: userId,
      score,
    });
    setSaving((prev) => ({ ...prev, [lineId]: false }));
    if (error) {
      setToast({ message: `${t.learn.messages.erreur} ${error.message}`, variant: "error" });
      return;
    }

    setLineState((prev) => ({ ...prev, [lineId]: "scored" }));
    setScoreValue((prev) => {
      const next = { ...prev, [lineId]: score };
      const completed = userLines.every((l) => next[l.id] !== null && next[l.id] !== undefined);
      if (completed) {
        setShowSummary(true);
        // Terminer la session
        if (sessionId) {
          const completedLines = userLines.filter((l) => next[l.id] !== null && next[l.id] !== undefined).length;
          const scores = userLines.map((l) => next[l.id]).filter((s): s is number => s !== null && s !== undefined);
          const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
          fetch("/api/sessions/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              completedLines,
              averageScore,
            }),
          }).catch((error) => {
            console.error("Error ending session:", error);
          });
        }
        if (timeInterval.current) {
          clearInterval(timeInterval.current);
        }
      }
      return next;
    });
    setToast({ message: t.learn.messages.feedbackEnregistreToast, variant: "success" });

    if (mode === "flashcard") {
      const idx = userLines.findIndex((l) => l.id === lineId);
      if (idx >= 0 && idx < userLines.length - 1) {
        setCurrentIndex(idx + 1);
      }
    }

    if (mode === "list") {
      // Auto-scroll intelligent: centrer la prochaine réplique utilisateur (non notée) dans l'écran.
      const sorted = [...visibleLines].sort((a, b) => a.order - b.order);
      const current = sorted.find((l) => l.id === lineId);
      const currentOrder = current?.order ?? -Infinity;
      const nextUser = sorted.find(
        (l) => l.isUserLine && l.order > currentOrder && lineState[l.id] === "hidden"
      ) ?? sorted.find((l) => l.isUserLine && l.order > currentOrder);
      if (nextUser) {
        queueMicrotask(() => {
          const el = lineRefs.current.get(nextUser.id);
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    }
  };

  const resetLocalState = () => {
    setLineState(
      lines.reduce(
        (acc, line) => ({
          ...acc,
          [line.id]: line.isUserLine ? "hidden" : "scored",
        }),
        {} as Record<string, LineState>
      )
    );
    setScoreValue(
      lines.reduce(
        (acc, line) => ({
          ...acc,
          [line.id]: line.isUserLine ? null : null,
        }),
        {} as Record<string, number | null>
      )
    );
    setHintProgress({});
    // Nouvelle session d'apprentissage côté UI -> on vide la saisie.
    setDrafts({});
    if (typeof window !== "undefined" && storageKey) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    }
    setSessionId(null);
    setSessionStartTime(null);
    setElapsedTime(0);
    if (timeInterval.current) {
      clearInterval(timeInterval.current);
    }
    setShowZenReview(false);
    setZenSaving(false);
    setShowSummary(false);
    setToast(null);
    setCurrentIndex(0);
  };

  const canWrite = inputMode === "write";
  const currentFlashcard = mode === "flashcard" ? userLines[currentIndex] : null;
  const flashcardContext =
    currentFlashcard &&
    (() => {
      const idx = visibleLines.findIndex((l) => l.id === currentFlashcard.id);
      for (let i = idx - 1; i >= 0; i -= 1) {
        const candidate = visibleLines[i];
        if (isLikelyStageDirection(candidate)) continue;
        if (!candidate.isUserLine) return candidate;
      }
      return null;
    })();

  const renderScoreButtons = (lineId: string, disabled: boolean) => (
    <div className="flex flex-wrap gap-2 md:flex-nowrap">
      {scoreOptions.map((score) => (
        <button
          key={score.value}
          onClick={() => saveScore(lineId, score.value)}
          disabled={disabled}
          aria-label={`Score ${score.value} - ${score.label} (${score.emoji})`}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-50 ${score.color}`}
        >
          <span>{score.emoji}</span>
          <span>{score.label}</span>
        </button>
      ))}
    </div>
  );

  const legend = t.learn.scores.legend;

  const toggleZen = () => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (isZen) params.delete("zen");
    else params.set("zen", "1");
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  };

  const zenCompleted = useMemo(() => {
    if (!isZen) return false;
    if (showSetupModal) return false;
    if (userLines.length === 0) return false;
    return userLines.every((l) => lineState[l.id] !== "hidden");
  }, [isZen, showSetupModal, userLines, lineState]);

  useEffect(() => {
    if (!isZen) return;
    if (!zenCompleted) return;
    setShowZenReview(true);
  }, [isZen, zenCompleted]);

  const saveZenScores = async () => {
    if (zenSaving) return;
    const missing = userLines.some((l) => scoreValue[l.id] === null || scoreValue[l.id] === undefined);
    if (missing) {
      setToast({ message: t.learn.messages.attribueScores, variant: "error" });
      return;
    }

    const rows = userLines.map((l) => ({
      line_id: l.id,
      user_id: userId,
      score: scoreValue[l.id] as number,
    }));

    setZenSaving(true);
    setToast(null);
    const { error } = await supabase.from("user_line_feedback").insert(rows);
    setZenSaving(false);
    if (error) {
      setToast({ message: `${t.learn.messages.erreur} ${error.message}`, variant: "error" });
      return;
    }

    // Marquer comme "scored" côté UI
    setLineState((prev) => {
      const next = { ...prev };
      userLines.forEach((l) => {
        next[l.id] = "scored";
      });
      return next;
    });

    // Terminer la session
    if (sessionId) {
      const scores = userLines
        .map((l) => scoreValue[l.id])
        .filter((s): s is number => s !== null && s !== undefined);
      const averageScore =
        scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      fetch("/api/sessions/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          completedLines: userLines.length,
          averageScore,
        }),
      }).catch((error) => {
        console.error("Error ending session:", error);
      });
    }
    if (timeInterval.current) {
      clearInterval(timeInterval.current);
    }

    setToast({ message: t.learn.messages.feedbackEnregistreToast, variant: "success" });
    setShowZenReview(false);
    setShowSummary(true);
  };

  const renderListMode = () => (
    <div className="flex flex-col gap-2">
      {visibleLines.map((line) => {
        const state = lineState[line.id];
        const isHidden = state === "hidden";
        const isCue = cueLineIds.has(line.id);
        const isStage = isLikelyStageDirection(line);
        return (
          <div
            key={line.id}
            ref={(el) => {
              lineRefs.current.set(line.id, el);
            }}
            className={`flex flex-col gap-2 rounded-2xl border p-4 shadow-sm shadow-[#3b1f4a0f] ${
              line.isUserLine
                ? "border-[#f4c95d66] bg-[#f4c95d1f]"
                : "border-[#e7e1d9] bg-white/90"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                {line.characterName}
              </div>
              {line.isUserLine && (
                <span className="text-xs font-semibold text-[#3b1f4a]">{t.learn.labels.taReplique}</span>
              )}
            </div>

            <p
              className={`text-sm ${
                line.isUserLine ? "text-[#1c1b1f]" : "text-[#3f3946]"
              } ${isStage ? "italic text-[#6a6274]" : ""} ${isHidden ? "blur-sm select-none" : ""}`}
            >
              {line.isUserLine && isHidden
                ? renderHintedText(line.text, hintProgress[line.id] ?? 0)
                : isCue && !line.isUserLine && !isHidden
                  ? renderCue(line.text, 5)
                  : line.text}
            </p>

            {line.isUserLine && canWrite && !isZen && (
              <div className="flex flex-col gap-2">
                <textarea
                  value={drafts[line.id] ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [line.id]: e.target.value,
                    }))
                  }
                  placeholder={t.learn.placeholders.ecrisReplique}
                  rows={2}
                  className="w-full rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
                />
              </div>
            )}

            {line.isUserLine && state !== "scored" && (
              isHidden ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => revealNextWord(line.id)}
                    className="w-fit rounded-full border border-[#e7e1d9] bg-white px-3 py-1 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:border-[#3b1f4a33]"
                  >
                    {t.learn.buttons.indice}
                  </button>
                  <button
                    type="button"
                    onClick={() => revealLine(line.id)}
                    className="w-fit rounded-full bg-[#ff6b6b] px-3 py-1 text-sm font-semibold text-white shadow-sm hover:-translate-y-[1px] hover:bg-[#e75a5a]"
                  >
                    {t.learn.buttons.reveler}
                  </button>
                </div>
              ) : (
                isZen ? (
                  <div className="text-xs font-medium text-[#7a7184]">
                    {t.learn.buttons.reveler} ✓
                  </div>
                ) : (
                  renderScoreButtons(line.id, Boolean(saving[line.id]))
                )
              )
            )}

            {line.isUserLine && state === "scored" && (
              <div className="text-xs font-medium text-[#2cb67d]">
                {t.learn.messages.feedbackEnregistre}
              </div>
            )}

            {line.isUserLine && !isHidden && canWrite && !isZen && (
              <div className="mt-2 grid gap-2 rounded-xl border border-[#e7e1d9] bg-[#f9f7f3] p-3 text-sm">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                    {t.learn.labels.taVersion}
                  </div>
                  <div className="whitespace-pre-wrap text-[#1c1b1f]">
                    {(drafts[line.id] ?? "").trim() || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                    {t.learn.labels.original}
                  </div>
                  <div className="whitespace-pre-wrap text-[#1c1b1f]">{line.text}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderFlashcard = () => {
    if (!currentFlashcard) {
      return (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
          {t.learn.messages.aucuneReplique}
        </div>
      );
    }

    const state = lineState[currentFlashcard.id];
    const isHidden = state === "hidden";
    const isLast = currentIndex >= userLines.length - 1;
    const hinted = isHidden ? renderHintedText(currentFlashcard.text, hintProgress[currentFlashcard.id] ?? 0) : null;

    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/90 p-4 shadow-sm shadow-[#3b1f4a0f]">
        {!isZen && (
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
              {currentFlashcard.characterName} — {t.learn.labels.carte} {currentIndex + 1}/{userLines.length}
            </div>
            <div className="text-xs font-medium text-[#7a7184]">
              {t.learn.labels.restantes} : {remainingCount}
            </div>
          </div>
        )}

        {flashcardContext && (
          <div className="rounded-xl border border-[#e7e1d9] bg-[#f9f7f3] px-3 py-2 text-sm text-[#1c1b1f]">
            <div className="text-xs uppercase text-[#7a7184]">{t.learn.labels.repliqueAdverse}</div>
            <div>{renderCue(flashcardContext.text, 5) ?? flashcardContext.text}</div>
          </div>
        )}

        <div
          className={`rounded-xl border border-[#e7e1d9] px-3 py-3 text-sm text-[#1c1b1f] ${
            isHidden ? "select-none" : ""
          }`}
        >
          {isHidden ? hinted : currentFlashcard.text}
        </div>

        <textarea
          value={drafts[currentFlashcard.id] ?? ""}
          onChange={(e) =>
            setDrafts((prev) => ({
              ...prev,
              [currentFlashcard.id]: e.target.value,
            }))
          }
          placeholder={t.learn.placeholders.ecrisReplique}
          rows={2}
          className={`w-full rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a] ${
            canWrite && !isZen ? "" : "hidden"
          }`}
        />

        {state !== "scored" && (
          <div className="flex flex-col gap-2">
            {isHidden ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => revealNextWord(currentFlashcard.id)}
                  className="w-full rounded-full border border-[#e7e1d9] bg-white px-3 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:border-[#3b1f4a33]"
                >
                  {t.learn.buttons.indice}
                </button>
                <button
                  type="button"
                  onClick={() => revealLine(currentFlashcard.id)}
                  className="w-full rounded-full bg-[#ff6b6b] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:-translate-y-[1px] hover:bg-[#e75a5a]"
                >
                  {t.learn.buttons.reveler}
                </button>
              </div>
            ) : (
              isZen ? (
                <button
                  onClick={() => {
                    if (!isLast) setCurrentIndex((i) => Math.min(userLines.length - 1, i + 1));
                    else setShowZenReview(true);
                  }}
                  className="w-full rounded-full bg-[#3b1f4a] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#2d1638]"
                >
                  {isLast ? t.learn.buttons.terminer : t.learn.buttons.suivant}
                </button>
              ) : (
                renderScoreButtons(currentFlashcard.id, Boolean(saving[currentFlashcard.id]))
              )
            )}
          </div>
        )}

        {state === "scored" && (
          <div className="text-xs font-medium text-[#2cb67d]">
            Feedback enregistré pour cette réplique.
          </div>
        )}

        {!isZen && (
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
                className="rounded-full border border-[#e7e1d9] bg-white px-3 py-1 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33] disabled:opacity-50"
              >
                {t.learn.buttons.precedent}
              </button>
              <button
                onClick={() => setCurrentIndex((i) => Math.min(userLines.length - 1, i + 1))}
                disabled={currentIndex >= userLines.length - 1}
                className="rounded-full border border-[#e7e1d9] bg-white px-3 py-1 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33] disabled:opacity-50"
              >
                {t.learn.buttons.suivant}
              </button>
            </div>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(userLines.length - 1, i + 1))}
              disabled={currentIndex >= userLines.length - 1}
              className="rounded-full bg-[#ff6b6b] px-3 py-1 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#e75a5a] disabled:opacity-50"
            >
              {t.learn.buttons.passer}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {!isZen ? (
        <div className="rounded-2xl border border-[#e7e1d9] bg-white/90 p-4 shadow-sm shadow-[#3b1f4a0f]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">{t.learn.sectionLabel}</p>
              <h2 className="font-display text-xl font-semibold text-[#1c1b1f]">{sceneTitle}</h2>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={toggleZen}
                className="rounded-full border border-[#e7e1d9] bg-white px-3 py-2 text-xs font-semibold text-[#3b1f4a] shadow-sm transition hover:border-[#3b1f4a33]"
              >
                {t.learn.buttons.activerZen}
              </button>
              <button
                type="button"
                onClick={() => setHintMode((m) => (m === "nextWord" ? "initials" : "nextWord"))}
                className="rounded-full bg-[#3b1f4a0d] px-3 py-2 text-xs font-semibold text-[#3b1f4a] transition hover:bg-[#3b1f4a14]"
              >
                {t.learn.labels.indiceMode} {hintMode === "nextWord" ? t.learn.labels.indiceMotSuivant : t.learn.labels.indiceInitiales}
              </button>
              <button
                type="button"
                onClick={() => setShowStageDirections((v) => !v)}
                className="rounded-full bg-[#f4c95d33] px-3 py-2 text-xs font-semibold text-[#3b1f4a] transition hover:bg-[#f4c95d44]"
              >
                {t.learn.labels.didascalies} : {showStageDirections ? t.learn.labels.affichees : t.learn.labels.masquees}
              </button>
            </div>
          </div>
          <p className="text-sm text-[#524b5a]">
            {t.learn.labels.tuJoues} : <span className="font-semibold text-[#1c1b1f]">{userCharacterName}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#524b5a]">
            <span className="rounded-full bg-[#f4c95d33] px-2 py-1 font-semibold text-[#3b1f4a]">
              {t.learn.labels.mode} : {mode === "flashcard" ? t.learn.modes.flashcard : t.learn.modes.liste}
            </span>
            <span className="rounded-full bg-[#3b1f4a0d] px-2 py-1 font-semibold text-[#3b1f4a]">
              {t.learn.labels.session} : {limitCount === null ? t.learn.labels.toutes : `${limitCount}`} ·{" "}
              {canWrite ? t.learn.labels.modeEcriture : t.learn.labels.modeRevelerSeulement}
            </span>
            <span className="text-xs font-semibold text-[#7a7184]">
              {t.learn.labels.restantes} : {remainingCount}
            </span>
            {elapsedTime > 0 && (
              <span className="text-xs font-semibold text-[#7a7184]">
                {Math.floor(elapsedTime / 60)} min {elapsedTime % 60} s
              </span>
            )}
            <span className="text-xs text-[#7a7184]">{legend}</span>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowStageDirections((v) => !v)}
            className="rounded-full border border-[#e7e1d9] bg-white/90 px-4 py-2 text-xs font-semibold text-[#3b1f4a] shadow-sm backdrop-blur transition hover:border-[#3b1f4a33]"
          >
            {t.learn.labels.didascalies} : {showStageDirections ? t.learn.labels.affichees : t.learn.labels.masquees}
          </button>
          <button
            type="button"
            onClick={toggleZen}
            className="rounded-full border border-[#e7e1d9] bg-white/90 px-4 py-2 text-xs font-semibold text-[#3b1f4a] shadow-sm backdrop-blur transition hover:border-[#3b1f4a33]"
          >
            {t.learn.buttons.quitterZen}
          </button>
        </div>
      )}

      {mode === "flashcard" ? renderFlashcard() : renderListMode()}

      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

      {showSetupModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.learn.setup.title}
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#e7e1d9] bg-white p-6 shadow-2xl">
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-lg font-semibold text-[#1c1b1f]">{t.learn.setup.title}</h3>
              <p className="text-sm text-[#524b5a]">{t.learn.setup.description}</p>
            </div>

            <div className="mt-5 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                  {t.learn.setup.limitLabel}
                </div>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setLimitCount(n)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        limitCount === n
                          ? "border-[#3b1f4a] bg-[#3b1f4a] text-white"
                          : "border-[#e7e1d9] bg-white text-[#3b1f4a] hover:border-[#3b1f4a66]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setLimitCount(null)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      limitCount === null
                        ? "border-[#3b1f4a] bg-[#3b1f4a] text-white"
                        : "border-[#e7e1d9] bg-white text-[#3b1f4a] hover:border-[#3b1f4a66]"
                    }`}
                  >
                    {t.learn.labels.toutes}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                  {t.learn.setup.modeLabel}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setInputMode("revealOnly")}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      inputMode === "revealOnly"
                        ? "border-[#3b1f4a] bg-[#3b1f4a0d]"
                        : "border-[#e7e1d9] bg-white hover:border-[#3b1f4a66]"
                    }`}
                  >
                    <div className="font-semibold text-[#1c1b1f]">{t.learn.setup.revealOnlyTitle}</div>
                    <div className="mt-1 text-xs text-[#524b5a]">{t.learn.setup.revealOnlyDesc}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode("write")}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      inputMode === "write"
                        ? "border-[#3b1f4a] bg-[#3b1f4a0d]"
                        : "border-[#e7e1d9] bg-white hover:border-[#3b1f4a66]"
                    }`}
                  >
                    <div className="font-semibold text-[#1c1b1f]">{t.learn.setup.writeTitle}</div>
                    <div className="mt-1 text-xs text-[#524b5a]">{t.learn.setup.writeDesc}</div>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push(`/scenes/${sceneId}`)}
                className="w-full rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33] sm:w-auto"
              >
                {t.learn.setup.cancel}
              </button>
              <button
                type="button"
                disabled={userLines.length === 0}
                onClick={() => {
                  resetLocalState();
                  setShowSetupModal(false);
                  void startTrackingSession(userLines.length);
                }}
                className="w-full rounded-full bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#e75a5a] disabled:opacity-50 sm:w-auto"
              >
                {t.learn.setup.start}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#e7e1d9] bg-white p-6 shadow-2xl">
            <h3 className="font-display text-lg font-semibold text-[#1c1b1f]">{t.learn.messages.sessionTerminee}</h3>
            <p className="mt-1 text-sm text-[#524b5a]">
              {t.learn.messages.resumeFeedbacks}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              {scoreOptions.map((score) => {
                const count = summaryCounts[score.value] ?? 0;
                const total = userLines.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={score.value} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm text-[#1c1b1f]">
                      <span className="flex items-center gap-2 font-semibold">
                        <span>{score.emoji}</span>
                        <span>{score.label}</span>
                      </span>
                      <span className="text-xs text-[#7a7184]">{count} · {pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#e7e1d9]">
                      <div
                        className={`h-2 rounded-full ${score.color.replace("text-white", "").replace("text-black", "")}`}
                        style={{ width: `${Math.max(pct, count > 0 ? 6 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  resetLocalState();
                  setShowSummary(false);
                  setShowSetupModal(true);
                }}
                className="w-full rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33] sm:w-auto"
              >
                Recommencer
              </button>
              <button
                onClick={() => {
                  setShowSummary(false);
                  router.push("/home");
                }}
                className="w-full rounded-full bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#e75a5a] sm:w-auto"
              >
                Retourner à l’accueil
              </button>
            </div>
          </div>
        </div>
      )}

      {showZenReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#e7e1d9] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-lg font-semibold text-[#1c1b1f]">
                  {t.learn.messages.noterSessionTitre}
                </h3>
                <p className="text-sm text-[#524b5a]">
                  {t.learn.messages.noterSessionDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowZenReview(false)}
                className="rounded-full border border-[#e7e1d9] bg-white px-3 py-1 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33]"
              >
                {t.learn.buttons.fermer}
              </button>
            </div>

            <div className="mt-5 max-h-[55vh] overflow-y-auto rounded-2xl border border-[#e7e1d9] bg-white/95">
              <div className="flex flex-col">
                {userLines.map((l) => {
                  const selected = scoreValue[l.id];
                  return (
                    <div key={l.id} className="border-b border-[#f0ece6] p-4">
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                        {userCharacterName} · Réplique {l.order}
                      </div>
                      <div className="text-sm text-[#1c1b1f]">{l.text}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {scoreOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              setScoreValue((prev) => ({
                                ...prev,
                                [l.id]: opt.value,
                              }))
                            }
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold shadow-sm transition ${
                              selected === opt.value ? opt.color : "border border-[#e7e1d9] bg-white text-[#3b1f4a] hover:border-[#3b1f4a33]"
                            }`}
                          >
                            <span>{opt.emoji}</span>
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-[#7a7184]">
                {userLines.filter((l) => scoreValue[l.id] !== null && scoreValue[l.id] !== undefined).length}
                {" / "}
                {userLines.length} {t.learn.messages.notees}
              </div>
              <button
                type="button"
                disabled={zenSaving}
                onClick={() => void saveZenScores()}
                className="rounded-full bg-[#3b1f4a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#2d1638] disabled:opacity-50"
              >
                {zenSaving ? t.learn.messages.enregistrement : t.learn.buttons.enregistrerScores}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




