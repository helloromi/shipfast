"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
    img: "/globe.svg",
    alt: "Aperçu statistiques",
    color: "bg-[#6b9fff15]",
  },
  {
    id: 3,
    title: "Importe n'importe quel texte",
    body: "Prends une photo de ton script ou uploade un PDF : on s'occupe du reste pour créer ta scène.",
    visual: "import",
    img: "/file.svg",
    alt: "Aperçu import",
    color: "bg-[#f4c95d25]",
  },
] as const;

function Step1Interactive() {
  const [selectedCharacter, setSelectedCharacter] = useState<"A" | "B" | null>(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-3xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#7a7184]">Texte test</p>
      <div className="mb-4 flex gap-2">
        {(["A", "B"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setSelectedCharacter(c);
              setRevealed(false);
            }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              selectedCharacter === c
                ? "bg-[#ff6b6b] text-white"
                : "bg-[#e7e1d9] text-[#524b5a] hover:bg-[#ddd6cc]"
            }`}
          >
            Personnage {c}
          </button>
        ))}
      </div>
      <div className="rounded-xl bg-[#f8f6f3] p-4 text-sm text-[#524b5a]">
        {!selectedCharacter && (
          <p className="italic">Choisis un personnage pour voir ta réplique.</p>
        )}
        {selectedCharacter && !revealed && (
          <div className="flex flex-col gap-2">
            <p className="text-[#7a7184]">Réplique masquée…</p>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="self-start rounded-lg bg-[#3b1f4a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2a1638]"
            >
              Révéler ma réplique
            </button>
          </div>
        )}
        {selectedCharacter && revealed && (
          <p className="font-medium text-[#1c1b1f]">
            {selectedCharacter === "A"
              ? "« Bonjour ! Ravi de te rencontrer. »"
              : "« Moi de même. Par où commençons-nous ? »"}
          </p>
        )}
      </div>
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

        {/* Visual: step 1 = interactive, 2 & 3 = image + placeholder */}
        {current.visual === "interactive" && <Step1Interactive />}
        {current.visual !== "interactive" && current.img && (
          <div
            className={`flex flex-col gap-4 rounded-3xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm`}
          >
            <div
              className={`flex h-24 w-24 flex-shrink-0 items-center justify-center self-center rounded-2xl ${current.color}`}
            >
              <Image src={current.img} alt={current.alt} width={48} height={48} />
            </div>
            <p className="text-center text-sm text-[#524b5a]">
              {current.visual === "stats"
                ? "Vue d’ensemble de tes séances et de ta progression."
                : "Photo ou PDF → scène prête à travailler."}
            </p>
          </div>
        )}

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
