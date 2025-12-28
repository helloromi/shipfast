"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

export function LearnSession({
  sceneTitle,
  sceneId,
  characterId,
  userCharacterName,
  lines,
  userId,
}: LearnSessionProps) {
  const router = useRouter();
  const { supabase } = useSupabase();

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
  const storageKey = useMemo(() => `drafts:${sceneTitle}`, [sceneTitle]);

  // Mode auto : desktop -> liste, mobile -> flashcard
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    queueMicrotask(() => setMode(isMobile ? "flashcard" : "list"));
  }, []);

  // Démarrer le tracking de session
  useEffect(() => {
    const startSession = async () => {
      const userLines = lines.filter((l) => l.isUserLine);
      try {
        const response = await fetch("/api/sessions/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneId,
            characterId,
            totalLines: userLines.length,
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
    startSession();
  }, [sceneId, characterId, lines]);

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

  const userLines = useMemo(() => lines.filter((l) => l.isUserLine), [lines]);
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

  const revealLine = (lineId: string) => {
    setLineState((prev) => ({ ...prev, [lineId]: "revealed" }));
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
    setShowSummary(false);
    setToast(null);
    setCurrentIndex(0);
  };

  const currentFlashcard = mode === "flashcard" ? userLines[currentIndex] : null;
  const flashcardContext =
    currentFlashcard &&
    (() => {
      const idx = lines.findIndex((l) => l.id === currentFlashcard.id);
      for (let i = idx - 1; i >= 0; i -= 1) {
        if (!lines[i].isUserLine) return lines[i];
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
      {lines.map((line) => {
        const state = lineState[line.id];
        const isHidden = state === "hidden";
        return (
          <div
            key={line.id}
            className="flex flex-col gap-2 rounded-2xl border border-[#e7e1d9] bg-white/90 p-4 shadow-sm shadow-[#3b1f4a0f]"
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
              className={`text-sm text-[#1c1b1f] ${
                isHidden ? "blur-sm select-none" : ""
              }`}
            >
              {line.text}
            </p>

            {line.isUserLine && (
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
                <button
                  onClick={() => revealLine(line.id)}
                  className="w-fit rounded-full bg-[#ff6b6b] px-3 py-1 text-sm font-semibold text-white shadow-sm hover:-translate-y-[1px] hover:bg-[#e75a5a]"
                >
                  {t.learn.buttons.reveler}
                </button>
              ) : (
                renderScoreButtons(line.id, Boolean(saving[line.id]))
              )
            )}

            {line.isUserLine && state === "scored" && (
              <div className="text-xs font-medium text-[#2cb67d]">
                {t.learn.messages.feedbackEnregistre}
              </div>
            )}

            {line.isUserLine && !isHidden && (
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

    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/90 p-4 shadow-sm shadow-[#3b1f4a0f]">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
            {currentFlashcard.characterName} — {t.learn.labels.carte} {currentIndex + 1}/{userLines.length}
          </div>
          <div className="text-xs font-medium text-[#7a7184]">
            {t.learn.labels.restantes} : {remainingCount}
          </div>
        </div>

        {flashcardContext && (
          <div className="rounded-xl border border-[#e7e1d9] bg-[#f9f7f3] px-3 py-2 text-sm text-[#1c1b1f]">
            <div className="text-xs uppercase text-[#7a7184]">{t.learn.labels.repliqueAdverse}</div>
            <div>{flashcardContext.text}</div>
          </div>
        )}

        <div
          className={`rounded-xl border border-[#e7e1d9] px-3 py-3 text-sm text-[#1c1b1f] ${
            isHidden ? "blur-sm select-none" : ""
          }`}
        >
          {currentFlashcard.text}
        </div>

        <textarea
          value={drafts[currentFlashcard.id] ?? ""}
          onChange={(e) =>
            setDrafts((prev) => ({
              ...prev,
              [currentFlashcard.id]: e.target.value,
            }))
          }
          placeholder="Écris ta réplique"
          rows={2}
          className="w-full rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
        />

        {state !== "scored" && (
          <div className="flex flex-col gap-2">
            {isHidden ? (
              <button
                onClick={() => revealLine(currentFlashcard.id)}
                className="w-full rounded-full bg-[#ff6b6b] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:-translate-y-[1px] hover:bg-[#e75a5a]"
              >
                Révéler
              </button>
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
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[#e7e1d9] bg-white/90 p-4 shadow-sm shadow-[#3b1f4a0f]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">{t.learn.sectionLabel}</p>
        <h2 className="font-display text-xl font-semibold text-[#1c1b1f]">{sceneTitle}</h2>
        <p className="text-sm text-[#524b5a]">
          {t.learn.labels.tuJoues} : <span className="font-semibold text-[#1c1b1f]">{userCharacterName}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#524b5a]">
          <span className="rounded-full bg-[#f4c95d33] px-2 py-1 font-semibold text-[#3b1f4a]">
            {t.learn.labels.mode} : {mode === "flashcard" ? t.learn.modes.flashcard : t.learn.modes.liste}
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

      {mode === "flashcard" ? renderFlashcard() : renderListMode()}

      {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}

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
    </div>
  );
}


