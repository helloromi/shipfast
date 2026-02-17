"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  initialNotesByLineId: Record<string, string>;
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

type LimitChoice = { type: "count"; count: number } | { type: "all" };

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

export function LearnSession(props: LearnSessionProps) {
  const { sceneId, characterId, lines, userId, initialNotesByLineId } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();

  // Zen par défaut. `?zen=0` pour debug.
  const isZen = searchParams?.get("zen") !== "0";

  const [showSetupModal, setShowSetupModal] = useState(true);
  const [limitCount, setLimitCount] = useState<number | null>(null); // null => toutes
  const [startIndex, setStartIndex] = useState(0); // Index de départ dans userLinesAll
  const [inputMode, setInputMode] = useState<InputMode>("revealOnly");
  const [showStageDirections, setShowStageDirections] = useState(true);
  const [limitChoice, setLimitChoice] = useState<LimitChoice>({ type: "all" });
  const [showAdvanced, setShowAdvanced] = useState(false);

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
  const [mode, setMode] = useState<"flashcard" | "overview">("flashcard");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [notesOpen, setNotesOpen] = useState<Record<string, boolean>>({});
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

  const userLinesAll = useMemo(() => lines.filter((l) => l.isUserLine), [lines]);

  // Mode Zen = une réplique à la fois (flashcard) pour tous, sauf si peu de répliques (≤5) -> overview
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (userLinesAll.length <= 5) {
      queueMicrotask(() => setMode("overview"));
    } else {
      queueMicrotask(() => setMode("flashcard"));
    }
  }, [userLinesAll.length]);

  // En mode Zen, on reste en flashcard (mais on laisse l'utilisateur choisir s'il écrit ou non).
  // Sauf si peu de répliques (≤5) -> overview
  useEffect(() => {
    if (!isZen) return;
    if (userLinesAll.length <= 5) {
      queueMicrotask(() => setMode("overview"));
    } else {
      queueMicrotask(() => setMode("flashcard"));
    }
  }, [isZen, userLinesAll.length]);

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

  const remainingUserLinesCount = useMemo(() => Math.max(0, userLinesAll.length - startIndex), [userLinesAll.length, startIndex]);
  const computeLimitFromCount = useCallback((count: number) => {
    if (remainingUserLinesCount <= 0) return 0;
    return Math.max(1, Math.min(count, remainingUserLinesCount));
  }, [remainingUserLinesCount]);
  const limitCountPresets = useMemo(() => {
    const max = remainingUserLinesCount;
    if (max <= 0) return [] as number[];
    const desired = max <= 6 ? [5] : [5, 10, 15];
    const clamped = desired.map((n) => Math.min(n, max));
    const unique = [...new Set(clamped)];
    // Éviter de proposer un bouton équivalent à "Toutes" (n === max).
    return unique.filter((n) => n > 0 && n < max);
  }, [remainingUserLinesCount]);
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

  useEffect(() => {
    // Sécurité : si on change le point de départ, on revient au début du paquet.
    setCurrentIndex(0);
  }, [startIndex]);

  useEffect(() => {
    // Si on est en mode "count", recalculer la limite quand le point de départ change
    // (car le nombre s'applique aux répliques restantes et doit être clampé).
    if (limitChoice.type === "count") {
      setLimitCount(computeLimitFromCount(limitChoice.count));
    }
    if (limitChoice.type === "all") {
      setLimitCount(null);
    }
  }, [startIndex, limitChoice, remainingUserLinesCount, computeLimitFromCount]);

  // Gestionnaire de clavier pour révéler avec Entrée ou Espace
  useEffect(() => {
    if (showSetupModal || showSummary) return; // Ne pas écouter si une modale est ouverte

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorer si l'utilisateur est en train de taper dans un input ou textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      // Vérifier si c'est Entrée ou Espace
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();

        // En mode flashcard, révéler la carte actuelle si elle est cachée
        if (mode === "flashcard") {
          const flashcard = userLines[currentIndex];
          if (flashcard) {
            const state = lineState[flashcard.id];
            if (state === "hidden") {
              revealLine(flashcard.id);
              return;
            }
          }
        }

        // En mode overview, révéler la première ligne cachée visible
        if (mode === "overview") {
          const firstHiddenLine = visibleLines.find(
            (line) => line.isUserLine && lineState[line.id] === "hidden"
          );
          if (firstHiddenLine) {
            revealLine(firstHiddenLine.id);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSetupModal, showSummary, mode, userLines, currentIndex, lineState, visibleLines]);

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

    if (mode === "overview") {
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
    setLimitChoice({ type: "all" });
    setLimitCount(null);
    setElapsedTime(0);
    if (timeInterval.current) {
      clearInterval(timeInterval.current);
    }
    setShowSummary(false);
    setToast(null);
    setCurrentIndex(0);
  };

  const canWrite = inputMode === "write" && mode !== "overview";
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

  const getNote = (lineId: string) => (initialNotesByLineId?.[lineId] ?? "").trim();

  const renderNoteAccordion = (lineId: string) => {
    const note = getNote(lineId);
    if (!note) return null;
    const isOpen = Boolean(notesOpen[lineId]);
    return (
      <div className="mt-1 rounded-2xl border border-dashed border-[#e7e1d9] bg-[#f9f7f3] p-3">
        <button
          type="button"
          onClick={() => setNotesOpen((prev) => ({ ...prev, [lineId]: !prev[lineId] }))}
          className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-left text-sm font-semibold text-[#3b1f4a] transition hover:bg-white/60"
          aria-expanded={isOpen}
          aria-controls={`note-${lineId}`}
        >
          <span>{t.learn.labels.notesPerso}</span>
          <span className="text-xs font-semibold text-[#7a7184]">
            {t.learn.labels.noteAjoutee} <span className="ml-2">{isOpen ? "▲" : "▼"}</span>
          </span>
        </button>
        {isOpen && (
          <div id={`note-${lineId}`} className="mt-2 whitespace-pre-wrap text-sm text-[#1c1b1f]">
            {note}
          </div>
        )}
      </div>
    );
  };

  const renderOverviewMode = () => (
    <div className="flex flex-col gap-2">
      {visibleLines.map((line) => {
        const state = lineState[line.id];
        const isHidden = state === "hidden";
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
            } ${line.isUserLine && isHidden ? "cursor-pointer transition hover:opacity-90" : ""}`}
            onClick={line.isUserLine && isHidden ? () => revealLine(line.id) : undefined}
            role={line.isUserLine && isHidden ? "button" : undefined}
            tabIndex={line.isUserLine && isHidden ? 0 : undefined}
            onKeyDown={
              line.isUserLine && isHidden
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      revealLine(line.id);
                    }
                  }
                : undefined
            }
            aria-label={line.isUserLine && isHidden ? t.learn.buttons.reveler : undefined}
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
              } ${isStage ? "italic text-[#6a6274]" : ""} ${line.isUserLine && isHidden ? "blur-sm select-none" : ""}`}
            >
              {line.text}
            </p>

            {renderNoteAccordion(line.id)}

            {line.isUserLine && state !== "scored" && (
              isHidden ? null : (
                renderScoreButtons(line.id, Boolean(saving[line.id]))
              )
            )}

            {line.isUserLine && state === "scored" && (
              <div className="text-xs font-medium text-[#2cb67d]">
                {t.learn.messages.feedbackEnregistre}
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
            <div className="text-xs uppercase text-[#7a7184]">
              {(flashcardContext.characterName || "").trim() || t.learn.labels.repliqueAdverse}
            </div>
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

        {renderNoteAccordion(currentFlashcard.id)}

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

      {mode === "flashcard" ? renderFlashcard() : renderOverviewMode()}

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
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.learn.setup.title}
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#e7e1d9] bg-white p-6 shadow-2xl">
            <div className="flex flex-col gap-0.5">
              <h3 className="font-display text-lg font-semibold text-[#1c1b1f]">{t.learn.setup.title}</h3>
              <p className="text-sm text-[#7a7184]">Configure ta session d'entraînement</p>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {/* 1. Choix du type d'exercice (flashcard ou vue d'ensemble) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                    {t.learn.setup.displayModeLabel}
                  </div>
                  <div className="text-xs font-medium text-[#7a7184]">
                    {userLinesAll.length} réplique{userLinesAll.length > 1 ? "s" : ""} disponible{userLinesAll.length > 1 ? "s" : ""}
                  </div>
                </div>
                {userLinesAll.length <= 5 && (
                  <div className="rounded-xl border border-[#f4c95d66] bg-[#f4c95d1f] p-3 text-sm text-[#3b1f4a]">
                    {t.learn.setup.suggestionPeuRepliques.replace("{count}", String(userLinesAll.length))}
                  </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("flashcard");
                      if (inputMode === "write" && mode === "overview") {
                        setInputMode("revealOnly");
                      }
                    }}
                    className={`flex-1 rounded-full border px-4 py-2 text-center text-sm font-semibold transition ${
                      mode === "flashcard"
                        ? "border-[#3b1f4a] bg-[#3b1f4a] text-white"
                        : "border-[#e7e1d9] bg-white text-[#3b1f4a] hover:border-[#3b1f4a66]"
                    }`}
                  >
                    {t.learn.modes.flashcard}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("overview");
                      setInputMode("revealOnly");
                      // Ne pas réinitialiser la limite : si l'utilisateur a choisi "5 répliques",
                      // on garde ce choix pour éviter de faire toutes les répliques par erreur.
                    }}
                    className={`flex-1 rounded-full border px-4 py-2 text-center text-sm font-semibold transition ${
                      mode === "overview"
                        ? "border-[#3b1f4a] bg-[#3b1f4a] text-white"
                        : "border-[#e7e1d9] bg-white text-[#3b1f4a] hover:border-[#3b1f4a66]"
                    }`}
                  >
                    {t.learn.modes.overview}
                  </button>
                </div>
                <p className="text-xs text-[#7a7184]">
                  {mode === "overview"
                    ? t.learn.setup.overviewDesc
                    : "Une réplique à la fois avec contexte."}
                </p>
              </div>

              {/* 2. Nombre de répliques (seulement si flashcard) */}
              {mode === "flashcard" && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                    {t.learn.setup.limitLabel}
                  </div>
                  <div className="grid gap-2">
                    <div
                      className={`grid gap-2 ${
                        limitCountPresets.length >= 3
                          ? "grid-cols-3"
                          : limitCountPresets.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-1"
                      }`}
                    >
                      {limitCountPresets.map((count) => {
                        const computed = computeLimitFromCount(count);
                        const disabled = remainingUserLinesCount === 0 || computed === 0;
                        const isSelected = limitChoice.type === "count" && limitChoice.count === count;
                        return (
                          <button
                            key={count}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              setLimitChoice({ type: "count", count });
                              setLimitCount(computed);
                            }}
                            className={`w-full rounded-full border px-3 py-1.5 text-center text-sm font-semibold transition disabled:opacity-50 ${
                              isSelected
                                ? "border-[#3b1f4a] bg-[#3b1f4a] text-white"
                                : "border-[#e7e1d9] bg-white text-[#3b1f4a] hover:border-[#3b1f4a66]"
                            }`}
                          >
                            <div className="inline-flex items-baseline justify-center gap-1.5">
                              <span className="text-base">{computed}</span>
                              <span className={`text-[11px] font-medium ${isSelected ? "text-white/70" : "text-[#7a7184]"}`}>
                                {computed === 1 ? "réplique" : "répliques"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      disabled={remainingUserLinesCount === 0}
                      onClick={() => {
                        setLimitChoice({ type: "all" });
                        setLimitCount(null);
                      }}
                      className={`w-full rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                        limitChoice.type === "all"
                          ? "border-[#3b1f4a] bg-[#3b1f4a] text-white"
                          : "border-[#e7e1d9] bg-white text-[#3b1f4a] hover:border-[#3b1f4a66]"
                      }`}
                    >
                      {t.learn.labels.toutes}
                    </button>
                  </div>
                </div>
              )}

              {/* 3. Quand commencer */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-left text-sm font-medium text-[#3b1f4a] transition hover:border-[#3b1f4a33] hover:bg-[#f9f7f3]"
                >
                  <div className="flex flex-col gap-0.5">
                    <span>Choisir quand commencer</span>
                    {!showAdvanced && startIndex > 0 && userLinesAll[startIndex] && (
                      <span className="text-xs font-normal text-[#7a7184]">
                        À partir de la réplique #{userLinesAll[startIndex].order}
                      </span>
                    )}
                  </div>
                  <span className="text-xs">{showAdvanced ? "▲" : "▼"}</span>
                </button>

                {showAdvanced && (
                  <div className="flex flex-col gap-3 rounded-xl border border-[#e7e1d9] bg-[#f9f7f3] p-3">
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                        {t.learn.setup.startAtLabel}
                      </div>
                      <div className="text-xs text-[#524b5a]">{t.learn.setup.startAtDesc}</div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={1}
                          max={Math.max(1, userLinesAll.length)}
                          value={Math.min(Math.max(1, startIndex + 1), Math.max(1, userLinesAll.length))}
                          disabled={userLinesAll.length === 0}
                          onChange={(e) => {
                            const raw = Number(e.target.value);
                            const clamped = Math.min(Math.max(1, raw), Math.max(1, userLinesAll.length));
                            setStartIndex(clamped - 1);
                          }}
                          className="w-full h-2 bg-[#e7e1d9] rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-5
                            [&::-webkit-slider-thumb]:h-5
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-[#3b1f4a]
                            [&::-webkit-slider-thumb]:cursor-pointer
                            [&::-webkit-slider-thumb]:shadow-md
                            [&::-webkit-slider-thumb]:transition-all
                            [&::-webkit-slider-thumb]:hover:scale-110
                            [&::-moz-range-thumb]:w-5
                            [&::-moz-range-thumb]:h-5
                            [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:bg-[#3b1f4a]
                            [&::-moz-range-thumb]:border-0
                            [&::-moz-range-thumb]:cursor-pointer
                            [&::-moz-range-thumb]:shadow-md
                            [&::-moz-range-thumb]:transition-all
                            [&::-moz-range-track]:bg-transparent"
                          aria-label={t.learn.setup.startAtLabel}
                        />
                      </div>

                      {userLinesAll.length > 0 && (
                        <div className="rounded-lg border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f]">
                          <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                            {t.learn.setup.startAtPreviewLabel}
                          </div>
                          <div className="mt-1 min-h-[1.5rem] truncate whitespace-nowrap text-sm leading-6 text-[#1c1b1f]">
                            {(() => {
                              const line = userLinesAll[startIndex];
                              if (!line) return "—";
                              const preview = (line.text || "").trim().slice(0, 160);
                              const suffix = (line.text || "").trim().length > 160 ? "…" : "";
                              return `#${line.order} — ${preview}${suffix}`;
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mode d'input (seulement si flashcard) */}
              {mode === "flashcard" && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                    {t.learn.setup.modeLabel}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setInputMode("revealOnly")}
                      className={`flex-1 rounded-full border px-4 py-2 text-center text-sm font-semibold transition ${
                        inputMode === "revealOnly"
                          ? "border-[#3b1f4a] bg-[#3b1f4a] text-white"
                          : "border-[#e7e1d9] bg-white text-[#3b1f4a] hover:border-[#3b1f4a66]"
                      }`}
                    >
                      {t.learn.setup.revealOnlyTitle}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("write")}
                      className={`flex-1 rounded-full border px-4 py-2 text-center text-sm font-semibold transition ${
                        inputMode === "write"
                          ? "border-[#3b1f4a] bg-[#3b1f4a] text-white"
                          : "border-[#e7e1d9] bg-white text-[#3b1f4a] hover:border-[#3b1f4a66]"
                      }`}
                    >
                      {t.learn.setup.writeTitle}
                    </button>
                  </div>
                  <p className="text-xs text-[#7a7184]">
                    {inputMode === "revealOnly"
                      ? t.learn.setup.revealOnlyDesc
                      : t.learn.setup.writeDesc}
                  </p>
                </div>
              )}
            </div>

            {/* Résumé de la session */}
            {userLines.length > 0 && (
              <div className="mt-4 rounded-xl border border-[#e7e1d9] bg-[#f9f7f3] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                      Résumé de la session
                    </div>
                    <div className="text-sm font-medium text-[#1c1b1f]">
                      {userLines.length === 1
                        ? "1 réplique sera travaillée"
                        : `${userLines.length} répliques seront travaillées`}
                      {startIndex > 0 && (
                        <span className="ml-1 text-xs font-normal text-[#7a7184]">
                          (à partir de la réplique #{userLinesAll[startIndex]?.order ?? startIndex + 1})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium text-[#7a7184]">
                      {userLinesAll.length} réplique{userLinesAll.length > 1 ? "s" : ""} au total
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
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
                {userLines.length > 0
                  ? `${t.learn.setup.start} (${userLines.length} ${userLines.length === 1 ? "réplique" : "répliques"})`
                  : t.learn.setup.start}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSummary && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4">
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
                        className="w-full rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] transition hover:-translate-y-[1px]"
                      >
                        {t.learn.buttons.continuer} : {continueCount} {continueCount === 1 ? "réplique suivante" : "répliques suivantes"}
                      </button>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => {
                          resetLocalState(true);
                          setShowSummary(false);
                          setShowSetupModal(true);
                        }}
                        className="flex-1 rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33]"
                      >
                        {t.learn.buttons.recommencer}
                      </button>
                      <button
                        onClick={() => {
                          setShowSummary(false);
                          router.push("/home");
                        }}
                        className="flex-1 rounded-full bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#e75a5a]"
                      >
                        {t.learn.buttons.retournerAccueil}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}




