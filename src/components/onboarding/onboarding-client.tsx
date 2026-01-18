"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OnboardingPageClient() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const cards = [
    {
      title: "Apprends tes textes 2x plus vite",
      desc: "Révèle tes répliques au bon rythme, garde le contexte, et progresse avec un feedback clair.",
      img: "/window.svg",
      alt: "Aperçu apprentissage",
      color: "bg-[#ff6b6b15]",
    },
    {
      title: "Zéro saisie manuelle",
      desc: "Importe ta scène automatiquement, modifie-la à ta guise, puis choisis les répliques à travailler.",
      img: "/file.svg",
      alt: "Aperçu import",
      color: "bg-[#f4c95d25]",
    },
    {
      title: "Tout ton historique centralisé",
      desc: "Retrouve tes scènes, tes statistiques, et ton évolution — tout au même endroit.",
      img: "/globe.svg",
      alt: "Aperçu bibliothèque",
      color: "bg-[#6b9fff15]",
    },
    {
      title: "N'oublie plus aucun détail",
      desc: "Ajoute des indications précises de jeu, de sous-texte ou d'intonation directement sur tes scènes.",
      img: "/pencil.svg",
      alt: "Aperçu annotations",
      color: "bg-[#c7488415]",
    }
  ] as const;

  return (
    <div className="relative">
      {/* Barre de progression */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#e7e1d9] px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between text-xs font-semibold text-[#7a7184]">
            <span>Étape 2 sur 3</span>
            <span>66%</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e7e1d9]">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] transition-all duration-500" />
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 pb-32">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
            Bienvenue
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#1c1b1f] sm:text-4xl">
            Tout débloquer en 1 abonnement
          </h1>
          <p className="text-sm text-[#524b5a] leading-relaxed">
            Débloques l'apprentissage, l'import, la bibliothèque et le suivi de progression.
          </p>
          {/* Preuve sociale */}
          <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#ff6b6b]">
            <span className="text-lg">🎭</span>
            <span>Rejoint par +500 comédiens cette semaine</span>
          </div>
        </div>

        <div className="grid gap-4">
          {cards.map((c, index) => (
            <div
              key={c.title}
              className={`flex flex-col gap-4 rounded-3xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
                    {c.title}
                  </h2>
                  <p className="text-sm text-[#524b5a]">{c.desc}</p>
                </div>
                <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${c.color}`}>
                  <Image src={c.img} alt={c.alt} width={28} height={28} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section - Non sticky sur desktop */}
        <div className="hidden md:block rounded-3xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-[#524b5a]">
              Prêt à passer à la vitesse supérieure ?
            </p>
            <Link
              href="/subscribe"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px] hover:shadow-lg active:scale-95"
            >
              Découvrir les plans
            </Link>
            <div className="flex flex-col gap-2 text-xs text-[#7a7184]">
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="font-semibold">Garantie satisfait ou remboursé sous 14 jours</span>
              </p>
              <p>Tu pourras annuler à tout moment depuis "Mon compte".</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Sticky Mobile uniquement */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#e7e1d9] bg-white/95 backdrop-blur-sm p-4 shadow-lg md:hidden">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/subscribe"
            className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md transition active:scale-95"
          >
            Découvrir les plans
          </Link>
          <p className="mt-2 text-center text-xs font-semibold text-green-600">
            ✓ Garantie satisfait ou remboursé sous 14 jours
          </p>
        </div>
      </div>
    </div>
  );
}
