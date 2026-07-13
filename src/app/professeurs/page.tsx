import type { Metadata } from "next";
import Link from "next/link";

import { t } from "@/locales/fr";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.cote-cour.studio").replace(/\/$/, "");
const PAGE_URL = `${BASE_URL}/professeurs`;

export const metadata: Metadata = {
  title: "Espace professeur : distribue les textes de ta classe | Côté-Cour",
  description:
    "Crée ta classe, invite tes élèves par un code, distribue à chacun son texte et son personnage. Gratuit pour les textes du domaine public.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    // Next.js ne fusionne pas openGraph en profondeur avec le layout parent :
    // type/locale doivent être répétés ici pour ne pas disparaître du HTML.
    title: "Espace professeur : distribue les textes de ta classe | Côté-Cour",
    description:
      "Crée ta classe, invite tes élèves par un code, distribue à chacun son texte et son personnage. Gratuit pour les textes du domaine public.",
    url: PAGE_URL,
    type: "website",
    locale: "fr_FR",
  },
};

/** Section pleine largeur qui s'échappe du conteneur du layout. */
function FullBleed({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative left-1/2 w-screen -translate-x-1/2 ${className ?? ""}`}>
      {children}
    </div>
  );
}

const FAQ_ITEMS = [t.professeurs.faq.items.q1, t.professeurs.faq.items.q2, t.professeurs.faq.items.q3];

const STEPS = [
  t.professeurs.howItWorks.steps.step1,
  t.professeurs.howItWorks.steps.step2,
  t.professeurs.howItWorks.steps.step3,
  t.professeurs.howItWorks.steps.step4,
];

export default async function ProfesseursPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="flex flex-col gap-16 pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ------------------------------------------------ Hero */}
      <FullBleed className="-mt-10 stage-dark overflow-hidden">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="spotlight absolute -top-32 left-[8%] h-[480px] w-[480px] rounded-full bg-[#f4c95d1f] blur-3xl" />
          <div className="spotlight absolute -top-20 right-[5%] h-[380px] w-[380px] rounded-full bg-[#ff6b6b24] blur-3xl [animation-delay:-7s]" />
        </div>

        <div className="relative mx-auto flex max-w-4xl flex-col gap-6 px-4 pb-20 pt-16 sm:px-6 lg:pb-24 lg:pt-24">
          <span className="reveal reveal-1 inline-flex w-fit items-center gap-2 rounded-full border border-[#f4c95d4d] bg-[#f4c95d14] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#f4c95d]">
            {t.professeurs.hero.badge}
          </span>
          <h1 className="reveal reveal-2 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
            {t.professeurs.hero.title}
          </h1>
          <p className="reveal reveal-3 max-w-2xl text-lg leading-relaxed text-[#e9e2d6]/90">
            {t.professeurs.hero.subtitle}
          </p>
          <div className="reveal reveal-4 flex flex-wrap items-center gap-3">
            <Link href="/login" className="btn-primary !min-h-[52px] !px-8 text-base">
              {t.professeurs.hero.ctaPrimary}
            </Link>
            <Link
              href="#comment-ca-marche"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-sm font-semibold text-white backdrop-blur transition hover:border-[#f4c95d] hover:text-[#f4c95d]"
            >
              {t.professeurs.hero.ctaSecondary}
            </Link>
          </div>
          <p className="reveal reveal-5 text-sm text-[#e9e2d6]/60">{t.professeurs.hero.ctaNote}</p>
        </div>

        <div className="h-1.5 w-full bg-gradient-to-r from-[#f4c95d] via-[#ff6b6b] to-[#3b1f4a]" aria-hidden />
      </FullBleed>

      {/* ------------------------------------------------ Comment ça marche */}
      <section id="comment-ca-marche" className="mx-auto w-full max-w-6xl scroll-mt-6">
        <h2 className="font-display text-3xl font-semibold text-[#211a26] sm:text-4xl">
          {t.professeurs.howItWorks.title}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <div key={step.title} className="card card-hover flex h-full flex-col p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f4c95d] to-[#d9a93a] font-display text-xl font-bold text-[#3b1f4a] shadow-md shadow-[#f4c95d4d]">
                {index + 1}
              </div>
              <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5d5468]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ Méthode */}
      <FullBleed>
        <section className="stage-dark overflow-hidden">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="spotlight absolute -bottom-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#f4c95d12] blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:py-20">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              {t.professeurs.methode.title}
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#e9e2d6]/85">
              {t.professeurs.methode.body}
            </p>
          </div>
        </section>
      </FullBleed>

      {/* ------------------------------------------------ Scènes du domaine public */}
      <section className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-[#e7e1d9] bg-white/92 p-6 shadow-sm shadow-[#3b1f4a14] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base text-[#3f3946]">{t.professeurs.scenesBanner.text}</p>
          <Link
            href="/scenes"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full border border-[#3b1f4a] bg-white px-6 text-sm font-semibold text-[#3b1f4a] transition hover:bg-[#3b1f4a] hover:text-white"
          >
            {t.professeurs.scenesBanner.cta} →
          </Link>
        </div>
      </section>

      {/* ------------------------------------------------ FAQ (SSR complet : questions ET réponses dans le HTML servi) */}
      <section className="mx-auto w-full max-w-3xl">
        <h2 className="font-display text-3xl font-semibold text-[#211a26] sm:text-4xl">
          {t.professeurs.faq.title}
        </h2>
        <div className="mt-8 space-y-3">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="card group overflow-hidden open:ring-1 open:ring-[#f4c95d]">
              <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left [&::-webkit-details-marker]:hidden">
                <span className="font-semibold text-[#3b1f4a]">{item.question}</span>
                <span
                  className="text-xl text-[#8a8093] transition-transform duration-200 group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <div className="border-t border-[#efe9dd] px-5 pb-4 pt-3">
                <p className="text-sm leading-relaxed text-[#5d5468]">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
