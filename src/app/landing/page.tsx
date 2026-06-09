import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { t } from "@/locales/fr";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FAQSection } from "@/components/landing/faq-section";
import { LandingCtaTrackedLink } from "@/components/landing/landing-cta-tracked-link";
import { LandingViewTracker } from "@/components/landing/landing-view-tracker";
import { PricingSection } from "@/components/pricing/pricing-section";

export const metadata: Metadata = {
  alternates: { canonical: "/landing" },
};

/** Section pleine largeur qui s'échappe du conteneur du layout. */
function FullBleed({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative left-1/2 w-screen -translate-x-1/2 ${className ?? ""}`}>
      {children}
    </div>
  );
}

const TEACHER_FEATURES = [
  { icon: "📄", ...t.landing.teacherSection.features.import },
  { icon: "🎟", ...t.landing.teacherSection.features.classe },
  { icon: "🎭", ...t.landing.teacherSection.features.distribution },
  { icon: "✍️", ...t.landing.teacherSection.features.annotations },
  { icon: "🎪", ...t.landing.teacherSection.features.spectacle },
];

export default async function LandingPage() {
  const user = await getSupabaseSessionUser();
  if (user) {
    redirect("/home");
  }

  return (
    <div className="flex flex-col gap-16 pb-8">
      <LandingViewTracker />

      {/* ------------------------------------------------ Hero : la scène */}
      <FullBleed className="-mt-10 stage-dark overflow-hidden">
        {/* Projecteurs */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="spotlight absolute -top-32 left-[8%] h-[480px] w-[480px] rounded-full bg-[#f4c95d1f] blur-3xl" />
          <div className="spotlight absolute -top-20 right-[5%] h-[380px] w-[380px] rounded-full bg-[#ff6b6b24] blur-3xl [animation-delay:-7s]" />
        </div>

        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-20 pt-16 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:pb-28 lg:pt-24">
          <div className="flex-1 space-y-6">
            <span className="reveal reveal-1 inline-flex items-center gap-2 rounded-full border border-[#f4c95d4d] bg-[#f4c95d14] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#f4c95d]">
              {t.landing.hero.badge}
            </span>
            <h1 className="reveal reveal-2 font-display text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              {t.landing.hero.titleLine1}
              <br />
              <span className="bg-gradient-to-r from-[#f4c95d] via-[#ffb27a] to-[#ff6b6b] bg-clip-text text-transparent">
                {t.landing.hero.titleLine2}
              </span>
            </h1>
            <p className="reveal reveal-3 max-w-xl text-lg leading-relaxed text-[#e9e2d6]/90">
              {t.landing.hero.description}
            </p>
            <div className="reveal reveal-4 flex flex-wrap items-center gap-3">
              <LandingCtaTrackedLink href="/login" className="btn-primary !min-h-[52px] !px-8 text-base">
                {t.landing.hero.ctaPrimary}
              </LandingCtaTrackedLink>
              <Link
                href="#professeurs"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/25 bg-white/5 px-7 text-sm font-semibold text-white backdrop-blur transition hover:border-[#f4c95d] hover:text-[#f4c95d]"
              >
                {t.landing.hero.ctaSecondary}
              </Link>
            </div>
            <p className="reveal reveal-5 text-sm text-[#e9e2d6]/60">{t.landing.hero.subtext}</p>
          </div>

          {/* Carte "script" — démo visuelle du masquage + annotation prof */}
          <div className="reveal reveal-4 flex-1 lg:max-w-md">
            <div className="relative rotate-1 rounded-3xl border border-white/10 bg-[#fdfaf3] p-6 text-[#211a26] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] transition hover:rotate-0">
              <div className="absolute -top-3 left-6 rounded-full bg-[#3b1f4a] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#f4c95d]">
                {t.landing.hero.demo.sceneLabel}
              </div>
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl border border-[#efe9dd] bg-white px-4 py-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#8a8093]">
                    {t.landing.hero.demo.otherCharacter}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed">« {t.landing.hero.demo.otherLine} »</p>
                </div>
                <div className="rounded-2xl border-2 border-[#f4c95d] bg-[#f4c95d1a] px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#3b1f4a]">
                      {t.landing.hero.demo.youCharacter}
                    </div>
                    <span className="glow rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-3 py-1 text-[11px] font-bold text-white shadow-md">
                      {t.landing.hero.demo.reveal}
                    </span>
                  </div>
                  <p className="mt-2 select-none text-sm tracking-[0.2em] text-[#8a8093]">
                    {t.landing.hero.demo.masked}
                  </p>
                </div>
                <div className="rounded-xl border-l-4 border-[#f4c95d] bg-[#fdf8ec] px-3 py-2">
                  <p className="text-xs font-medium text-[#7a5c12]">
                    ✎ {t.landing.hero.demo.annotation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rideau : liseré bas */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#f4c95d] via-[#ff6b6b] to-[#3b1f4a]" aria-hidden />
      </FullBleed>

      {/* ------------------------------------------------ Pourquoi */}
      <section className="mx-auto w-full max-w-6xl">
        <h2 className="font-display text-3xl font-semibold text-[#211a26] sm:text-4xl">
          {t.landing.problemSection.title}
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-[#5d5468]">{t.landing.problemSection.subtitle}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[t.landing.sections.masquage, t.landing.sections.progression, t.landing.sections.mobile].map(
            (item, i) => (
              <div key={item.title} className="card card-hover relative overflow-hidden p-6">
                <span
                  className="pointer-events-none absolute -right-3 -top-6 font-display text-[90px] font-bold leading-none text-[#3b1f4a0d]"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <h3 className="font-display text-xl font-semibold text-[#3b1f4a]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5d5468]">{item.desc}</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* ------------------------------------------------ Comment ça marche */}
      <HowItWorks />

      {/* ------------------------------------------------ Professeurs */}
      <FullBleed>
        <section id="professeurs" className="stage-dark scroll-mt-6 overflow-hidden">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="spotlight absolute -bottom-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#f4c95d12] blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6b6b66] bg-[#ff6b6b1a] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#ff9d9d]">
              {t.landing.teacherSection.badge}
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold sm:text-5xl">
              {t.landing.teacherSection.title}
            </h2>
            <p className="mt-3 max-w-2xl text-lg text-[#e9e2d6]/85">
              {t.landing.teacherSection.subtitle}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TEACHER_FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur transition hover:border-[#f4c95d66] hover:bg-white/[0.09]"
                >
                  <div className="text-2xl" aria-hidden>
                    {f.icon}
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold text-[#fdf9f0]">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#e9e2d6]/75">{f.desc}</p>
                </div>
              ))}
              <div className="flex items-center justify-center rounded-2xl border border-dashed border-[#f4c95d66] p-5">
                <LandingCtaTrackedLink href="/login" className="btn-gold">
                  {t.landing.teacherSection.cta} →
                </LandingCtaTrackedLink>
              </div>
            </div>
          </div>
        </section>
      </FullBleed>

      {/* ------------------------------------------------ Tarifs */}
      <PricingSection />

      {/* ------------------------------------------------ FAQ */}
      <FAQSection />

      {/* ------------------------------------------------ Cas d'usage */}
      <section className="mx-auto w-full max-w-6xl">
        <h2 className="mb-6 font-display text-3xl font-semibold text-[#211a26] sm:text-4xl">
          {t.landing.useCases.title}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            t.landing.useCases.items.firstShow,
            t.landing.useCases.items.associativeCourse,
            t.landing.useCases.items.transports,
          ].map((item) => (
            <div key={item.title} className="card card-hover p-6">
              <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5d5468]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ CTA final */}
      <FullBleed>
        <section className="stage-dark overflow-hidden">
          <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
            <div
              className="spotlight pointer-events-none absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-[#f4c95d1a] blur-3xl"
              aria-hidden
            />
            <h2 className="relative font-display text-4xl font-semibold sm:text-5xl">
              {t.landing.ctaBottom.title}
            </h2>
            <p className="relative mt-3 text-lg text-[#e9e2d6]/85">{t.landing.ctaBottom.subtitle}</p>
            <div className="relative mt-8">
              <LandingCtaTrackedLink href="/login" className="btn-primary !min-h-[56px] !px-10 text-base">
                {t.landing.ctaBottom.button}
              </LandingCtaTrackedLink>
            </div>
          </div>
        </section>
      </FullBleed>
    </div>
  );
}
