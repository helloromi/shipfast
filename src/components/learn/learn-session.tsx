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

type ScoreOption = {
  value: number;
  emoji: string;
  label: string;
  color: string;
};

const scoreOptions: ScoreOption[] = [
  { value: 0, emoji: t.learn.scores.rate.emoji, label: t.learn.scores.rate.label, color: "bg-[#e11d48] text-white hover:bg-[#c4153c]" },
  { value: 3, emoji: t.learn.scores.hesitant.emoji, label: t.learn.scores.hesitant.label, color: "bg-[#f59e0b] text-white hover:bg-[#d88405]" },
  { value: 7, emoji: t.learn.scores.bon.emoji, label: t.learn.scores.bon.label, color: "bg-[#f4c95d] text-[#1c1b1f] hover:bg-[#e6b947]" },
  { value: 10, emoji: t.learn.scores.parfait.emoji, label: t.learn.scores.parfait.label, color: "bg-[#2cb67d] text-white hover:bg-[#239b6a]" },
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

  // Zen par défaut. `?zen=0` pour debug.
  const isZen = searchParams?.get("zen") !== "0";

  const [showSetupModal, setShowSetupModal] = useState(true);
  const [limitCount, setLimitCount] = useState<number | null>(null); // null => toutes
  const [startIndex, setStartIndex] = useState(0); // Index de départ dans userLinesAll
  const [inputMode, setInputMode] = useState<InputMode>("write");
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
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const timeInterval = useRef<NodeJS.Timeout | null>(null);
  const lineRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  
  const formatSessionTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }
    if (remainingSeconds === 0) {
      return `${minutes}min`;
    }
    return `${minutes}min ${remainingSeconds}s`;
  };

  // IMPORTANT: on ne veut pas "réutiliser" les brouillons d'une session à l'autre.
  // On lie donc la clé de persistance à la session (créée côté serveur).
  const storageKey = useMemo(() => {
    if (!sessionId) return null;
    return `drafts:${sceneId}:${characterId}:${sessionId}`;
  }, [sceneId, characterId, sessionId]);

  // Mode Zen = une réplique à la fois (flashcard) pour tous.
  useEffect(() => {
    if (typeof window === "undefined") return;
    queueMicrotask(() => setMode("flashcard"));
  }, []);

  // En mode Zen, on reste en flashcard (mais on laisse l'utilisateur choisir s'il écrit ou non).
  useEffect(() => {
    if (!isZen) return;
    queueMicrotask(() => setMode("flashcard"));
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
    const availableLines = userLinesAll.slice(startIndex);
    if (limitCount === null) return availableLines;
    return availableLines.slice(0, limitCount);
  }, [limitCount, userLinesAll, startIndex]);

  const displayLines = useMemo(() => {
    if (limitCount === null) {
      // Si on a un startIndex, on doit filtrer les lignes pour ne garder que celles après les répliques déjà travaillées
      if (startIndex > 0) {
        const startUserLine = userLinesAll[startIndex];
        if (startUserLine) {
          return lines.filter((l) => l.order >= startUserLine.order);
        }
      }
      return lines;
    }
    const lastUserLine = userLines[userLines.length - 1];
    if (!lastUserLine) return [];
    return lines.filter((l) => l.order <= lastUserLine.order);
  }, [lines, limitCount, userLines, startIndex, userLinesAll]);

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

  const [hintUsed, setHintUsed] = useState<Record<string, boolean>>({});
  const PREVIEW_WORDS = 4;

  const renderBlurHint = (text: string, showFirstWords: number) => {
    const trimmed = (text || "").trim();
    if (!trimmed) return "—";
    const words = trimmed.split(/\s+/).filter(Boolean);
    return (
      <span className="leading-relaxed">
        {words.map((w, idx) => {
          const revealed = idx < showFirstWords;
          return (
            <span
              key={`${idx}-${w}`}
              className={revealed ? "" : "blur-sm"}
            >
              {w}
              {idx < words.length - 1 ? " " : ""}
            </span>
          );
        })}
      </span>
    );
  };

  const revealLine = (lineId: string) => {
    setLineState((prev) => ({ ...prev, [lineId]: "revealed" }));
  };

  const revealHintOnce = (lineId: string) => {
    setHintUsed((prev) => ({ ...prev, [lineId]: true }));
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

  const quitSession = async () => {
    // Finir proprement (si on a une session en cours) puis revenir à la page scène (stats + reprise).
    try {
      if (sessionId) {
        const scored = userLines.filter(
          (l) => scoreValue[l.id] !== null && scoreValue[l.id] !== undefined
        );
        const scores = scored
          .map((l) => scoreValue[l.id])
          .filter((s): s is number => s !== null && s !== undefined);
        const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        await fetch("/api/sessions/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            completedLines: scored.length,
            averageScore,
          }),
        });
      }
    } catch (error) {
      console.error("Error ending session:", error);
    } finally {
      if (timeInterval.current) {
        clearInterval(timeInterval.current);
      }
      router.push(`/scenes/${sceneId}`);
    }
  };

  const resetLocalState = (resetStartIndex = false) => {
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
    setHintUsed({});
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
    if (resetStartIndex) {
      setStartIndex(0);
    }
    setElapsedTime(0);
    if (timeInterval.current) {
      clearInterval(timeInterval.current);
    }
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
                ? renderBlurHint(line.text, hintUsed[line.id] ? PREVIEW_WORDS : 0)
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
                    onClick={() => revealHintOnce(line.id)}
                    className="w-fit rounded-full border border-[#e7e1d9] bg-white px-3 py-1 text-sm font-medium text-[#3b1f4a] shadow-sm transition hover:border-[#3b1f4a33]"
                  >
                    {t.learn.buttons.indice}
                  </button>
                  <button
                    type="button"
                    onClick={() => revealLine(line.id)}
                    className="w-fit rounded-full bg-[#ff6b6b] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#e75a5a]"
                  >
                    {t.learn.buttons.reveler}
                  </button>
                </div>
              ) : (
                renderScoreButtons(line.id, Boolean(saving[line.id]))
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
    const hinted = isHidden ? renderBlurHint(currentFlashcard.text, hintUsed[currentFlashcard.id] ? PREVIEW_WORDS : 0) : null;

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
          className={`relative rounded-xl border border-[#e7e1d9] px-3 py-3 text-sm text-[#1c1b1f] ${
            isHidden ? "select-none" : ""
          }`}
        >
          {isHidden && !hintUsed[currentFlashcard.id] && (
            <button
              type="button"
              onClick={() => revealHintOnce(currentFlashcard.id)}
              className="absolute right-3 top-3 rounded-full border border-[#e7e1d9] bg-white px-3 py-1 text-xs font-medium text-[#3b1f4a] shadow-sm transition hover:border-[#3b1f4a33]"
            >
              {t.learn.buttons.indice}
            </button>
          )}
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
            canWrite ? "" : "hidden"
          }`}
        />

        {state !== "scored" && (
          <div className="flex flex-col gap-2">
            {isHidden ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => revealLine(currentFlashcard.id)}
                  className="w-fit min-w-44 rounded-full bg-[#ff6b6b] px-8 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#e75a5a]"
                >
                  {t.learn.buttons.reveler}
                </button>
              </div>
            ) : (
              renderScoreButtons(currentFlashcard.id, Boolean(saving[currentFlashcard.id]))
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
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => void quitSession()}
          className="rounded-full border border-[#e7e1d9] bg-white/90 px-4 py-2 text-xs font-semibold text-[#3b1f4a] shadow-sm backdrop-blur transition hover:border-[#3b1f4a33]"
          aria-label={t.learn.buttons.quitterSession}
          title={t.learn.buttons.quitterSession}
        >
          {t.learn.buttons.quitterSession}
        </button>
        <button
          type="button"
          onClick={() => setShowStageDirections((v) => !v)}
          className="rounded-full border border-[#e7e1d9] bg-white/90 px-4 py-2 text-xs font-semibold text-[#3b1f4a] shadow-sm backdrop-blur transition hover:border-[#3b1f4a33]"
        >
          {t.learn.labels.didascalies} : {showStageDirections ? t.learn.labels.affichees : t.learn.labels.masquees}
        </button>
      </div>

      {mode === "flashcard" ? renderFlashcard() : renderListMode()}

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          duration={toast.variant === "success" ? 1600 : 4000}
          onClose={() => setToast(null)}
        />
      )}

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
            {elapsedTime > 0 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-[#524b5a]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {t.learn.messages.tempsPratique}: {formatSessionTime(elapsedTime)}
                </span>
              </div>
            )}
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

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                {(() => {
                  const workedCount = userLines.length;
                  const lastWorkedLine = userLines[userLines.length - 1];
                  const lastWorkedIndex = lastWorkedLine 
                    ? userLinesAll.findIndex((l) => l.id === lastWorkedLine.id)
                    : -1;
                  const remainingCount = lastWorkedIndex >= 0 
                    ? userLinesAll.length - (lastWorkedIndex + 1)
                    : 0;
                  
                  // Calculer le nombre de répliques pour continuer
                  let continueCount = workedCount;
                  // Si il reste moins de répliques que ce qu'on a travaillé, prendre toutes les restantes
                  if (remainingCount < continueCount) {
                    continueCount = remainingCount;
                  }
                  // Si il reste exactement 3 répliques et qu'on a travaillé moins de 3, prendre 3
                  if (remainingCount === 3 && workedCount < 3) {
                    continueCount = 3;
                  }
                  
                  const canContinue = remainingCount > 0 && continueCount > 0;
                  
                  return (
                    <>
                      {canContinue && (
                        <button
                          onClick={() => {
                            const nextStartIndex = lastWorkedIndex + 1;
                            resetLocalState();
                            setShowSummary(false);
                            setStartIndex(nextStartIndex);
                            setLimitCount(continueCount);
                            setShowSetupModal(false);
                            void startTrackingSession(continueCount);
                          }}
                          className="w-full rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] transition hover:-translate-y-[1px] sm:w-auto"
                        >
                          {t.learn.buttons.continuer} : {continueCount} {continueCount === 1 ? "réplique suivante" : "répliques suivantes"}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          resetLocalState(true);
                          setShowSummary(false);
                          setShowSetupModal(true);
                        }}
                        className="w-full rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33] sm:w-auto"
                      >
                        {t.learn.buttons.recommencer}
                      </button>
                    </>
                  );
                })()}
              </div>
              <button
                onClick={() => {
                  setShowSummary(false);
                  router.push("/home");
                }}
                className="w-full rounded-full bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#e75a5a]"
              >
                {t.learn.buttons.retournerAccueil}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}




