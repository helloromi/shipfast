"use client";

import Link from "next/link";
import { useState } from "react";

import { ScoreEvolutionChart } from "@/components/stats/score-evolution-chart";
import { t } from "@/locales/fr";

const STEPS = [
  {
    id: 1,
    title: "Apprends tes textes simplement",
    body: "Commence avec un texte test, choisis ton personnage, puis révèle tes répliques au bon rythme pour apprendre sans stress.",
    visual: "interactive",
  },
  {
    id: 2,
    title: "Suis ta progression",
    body: "La page Statistiques te montre ton avancement, tes séances et ton évolution pour ne rien perdre.",
    visual: "stats",
  },
  {
    id: 3,
    title: "Importe n'importe quel texte",
    body: "Prends une photo de ton script ou uploade un PDF : on s'occupe du reste pour créer ta scène.",
    visual: "import",
  },
] as const;

// Court extrait de dialogue pour la démo étape 1
const DEMO_LINES = [
  { character: "Marie", text: "Tu as passé une bonne soirée ?" },
  { character: "Paul", text: "Oui, merci. Et toi, ce projet de pièce avance ?" },
  { character: "Marie", text: "On répète la scène 2 demain. Tu pourrais me faire répéter ?" },
  { character: "Paul", text: "Avec plaisir. On commence par tes répliques ?" },
] as const;

const SCORE_OPTIONS = [
  { value: 0, emoji: t.learn.scores.rate.emoji, label: t.learn.scores.rate.label, color: "bg-[#e11d48] text-white hover:bg-[#c4153c]" },
  { value: 3, emoji: t.learn.scores.hesitant.emoji, label: t.learn.scores.hesitant.label, color: "bg-[#f59e0b] text-white hover:bg-[#d88405]" },
  { value: 7, emoji: t.learn.scores.bon.emoji, label: t.learn.scores.bon.label, color: "bg-[#f4c95d] text-[#1c1b1f] hover:bg-[#e6b947]" },
  { value: 10, emoji: t.learn.scores.parfait.emoji, label: t.learn.scores.parfait.label, color: "bg-[#2cb67d] text-white hover:bg-[#239b6a]" },
] as const;

function Step1Interactive() {
  const [selectedCharacter, setSelectedCharacter] = useState<"Marie" | "Paul" | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const userLines = DEMO_LINES.filter((l) => l.character === selectedCharacter);
  const currentLine = userLines[0];

  const handleSelectCharacter = (c: "Marie" | "Paul") => {
    setSelectedCharacter(c);
    setRevealed(false);
    setScore(null);
  };

  return (
    <div className="rounded-3xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#7a7184]">Texte test</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["Marie", "Paul"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleSelectCharacter(c)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedCharacter === c
                ? "bg-[#ff6b6b] text-white"
                : "bg-[#e7e1d9] text-[#524b5a] hover:bg-[#ddd6cc]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Aperçu du dialogue */}
      <div className="mb-4 rounded-xl bg-[#f8f6f3] p-3 text-sm">
        {DEMO_LINES.map((line, i) => (
          <p key={i} className={line.character === selectedCharacter ? "font-medium text-[#1c1b1f]" : "text-[#7a7184]"}>
            <span className="text-[#3b1f4a]">{line.character}</span> — {line.character === selectedCharacter && !revealed ? "••••••••" : `« ${line.text} »`}
          </p>
        ))}
      </div>

      {selectedCharacter && (
        <>
          {!revealed ? (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-lg bg-[#3b1f4a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2a1638]"
            >
              Révéler ma réplique
            </button>
          ) : (
            <div className="flex flex-col gap-3 rounded-xl border border-[#e7e1d9] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7a7184]">Noter ta réplique</p>
              <p className="text-sm font-medium text-[#1c1b1f]">« {currentLine?.text} »</p>
              <div className="flex flex-wrap gap-2">
                {SCORE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setScore(opt.value)}
                    className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${opt.color} ${
                      score === opt.value ? "ring-2 ring-[#3b1f4a] ring-offset-2" : ""
                    }`}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const FAKE_STATS_DATA = [
  { date: "2025-01-01", value: 4.2, label: "Lun" },
  { date: "2025-01-02", value: 5.5, label: "Mar" },
  { date: "2025-01-03", value: 6, label: "Mer" },
  { date: "2025-01-04", value: 7.2, label: "Jeu" },
  { date: "2025-01-05", value: 7.8, label: "Ven" },
  { date: "2025-01-06", value: 8.5, label: "Sam" },
  { date: "2025-01-07", value: 8.2, label: "Dim" },
];

function Step2StatsVisual() {
  return (
    <div className="rounded-3xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm">
      <h3 className="mb-4 font-display text-lg font-semibold text-[#3b1f4a]">
        Évolution de ta note
      </h3>
      <ScoreEvolutionChart data={FAKE_STATS_DATA} />
    </div>
  );
}

function ImportPicto() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#e7e1d9] bg-white/90 p-8 shadow-sm">
      <div className="rounded-full bg-[#f4c95d33] p-5">
        <svg
          className="h-10 w-10 text-[#3b1f4a]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>
      <p className="text-center text-sm text-[#524b5a]">
        Glisse une photo ou un PDF ici — la scène est créée automatiquement.
      </p>
    </div>
  );
}

export default function OnboardingPageClient() {
  const [step, setStep] = useState(1);
  const current = STEPS[step - 1];
  const isLastStep = step === STEPS.length;

  return (
    <div className="relative">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 pb-32">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
            Bienvenue
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#1c1b1f] sm:text-4xl">
            {current.title}
          </h1>
          <p className="text-sm leading-relaxed text-[#524b5a]">{current.body}</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              aria-current={step === s.id}
              className={`h-2 flex-1 rounded-full transition ${
                step === s.id ? "bg-[#ff6b6b]" : "bg-[#e7e1d9]"
              }`}
              aria-label={`Étape ${s.id}`}
            />
          ))}
        </div>

        {/* Visual: step 1 = interactive, 2 = fake graph, 3 = picto import */}
        {current.visual === "interactive" && <Step1Interactive />}
        {current.visual === "stats" && <Step2StatsVisual />}
        {current.visual === "import" && <ImportPicto />}

        {/* Navigation */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="text-sm font-semibold text-[#524b5a] hover:text-[#3b1f4a]"
              >
                ← Précédent
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isLastStep ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px] hover:shadow-lg active:scale-95"
              >
                Suivant
              </button>
            ) : (
              <Link
                href="/subscribe"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px] hover:shadow-lg active:scale-95"
              >
                Découvrir les plans
              </Link>
            )}
          </div>
        </div>

        {/* Guarantee - visible on last step */}
        {isLastStep && (
          <div className="flex flex-col gap-2 text-xs text-[#7a7184]">
            <p className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span className="font-semibold">Garantie satisfait ou remboursé sous 14 jours</span>
            </p>
            <p>Tu pourras annuler à tout moment depuis &quot;Mon compte&quot;.</p>
          </div>
        )}
      </div>

      {/* CTA sticky mobile - only on last step */}
      {isLastStep && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e7e1d9] bg-white/95 p-4 shadow-lg backdrop-blur-sm md:hidden">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/subscribe"
              className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] py-3 text-sm font-semibold text-white shadow-md transition active:scale-95"
            >
              Découvrir les plans
            </Link>
            <p className="mt-2 text-center text-xs font-semibold text-green-600">
              ✓ Garantie satisfait ou remboursé sous 14 jours
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
