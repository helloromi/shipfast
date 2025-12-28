import Link from "next/link";
import { redirect } from "next/navigation";

import { getSupabaseSessionUser, countPublicScenes } from "@/lib/queries/scenes";
import { t } from "@/locales/fr";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FAQSection } from "@/components/landing/faq-section";
import { PricingSection } from "@/components/pricing/pricing-section";

export default async function LandingPage() {
  const user = await getSupabaseSessionUser();
  if (user) {
    redirect("/home");
  }

  const scenesCount = await countPublicScenes();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 py-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-[#e7e1d9] bg-white/80 px-8 py-10 shadow-xl">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[#f4c95d33] blur-3xl" />
          <div className="absolute -right-10 top-10 h-52 w-52 rounded-full bg-[#ff6b6b22] blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
          <div className="flex-1 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f4c95d33] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
              {t.landing.badge}
            </span>
            <h1 className="font-display text-4xl font-semibold leading-tight text-[#1c1b1f] sm:text-5xl">
              {t.landing.title}
            </h1>
            <p className="max-w-2xl text-lg text-[#524b5a]">
              {t.landing.description}
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#ff6b6b] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ff6b6b33] transition hover:-translate-y-[1px] hover:bg-[#e75a5a] active:scale-95"
                >
                  {t.landing.cta.commencer}
                </Link>
                <Link
                  href="/scenes"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#e7e1d9] bg-white px-5 py-3 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:border-[#3b1f4a33] hover:text-[#3b1f4a] active:scale-95"
                >
                  {t.landing.cta.voirBibliotheque}
                </Link>
              </div>
              <p className="text-xs text-[#524b5a] sm:text-sm">{t.landing.cta.commencerSubtext}</p>
            </div>
            {/* Trust Signals */}
            {scenesCount > 0 && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-[#524b5a]">
                <span className="font-semibold text-[#3b1f4a]">
                  {scenesCount} {t.landing.trustSignals.scenesAvailable}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#524b5a]">
              <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">{t.landing.features.flashcardsScene}</span>
              <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">{t.landing.features.rappelsAuditions}</span>
              <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">{t.landing.features.feedbackRapide}</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/90 p-4 shadow-lg lg:max-w-md">
            {/* TODO: Remplacer par screenshots réels ou GIFs du produit */}
            {[
              t.landing.demoCards.casting,
              t.landing.demoCards.selftape,
              t.landing.demoCards.replique,
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start justify-between gap-3 rounded-xl border border-[#e7e1d9] bg-white/90 px-3 py-3 shadow-sm"
              >
                <div>
                  <div className="text-sm font-semibold text-[#3b1f4a]">{item.title}</div>
                  <div className="text-xs text-[#524b5a]">{item.meta}</div>
                </div>
                <span className="rounded-full bg-[#f4c95d33] px-3 py-1 text-[11px] font-semibold text-[#3b1f4a]">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section>
        <h2 className="mb-6 font-display text-2xl font-semibold text-[#1c1b1f] sm:text-3xl">
          Pourquoi choisir Côté-Cour ?
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            t.landing.sections.masquage,
            t.landing.sections.progression,
            t.landing.sections.mobile,
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[#e7e1d9] bg-white/85 p-5 shadow-sm shadow-[#3b1f4a0d] transition hover:-translate-y-[1px] hover:shadow-lg"
            >
              <h3 className="font-display text-xl font-semibold text-[#3b1f4a]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#524b5a]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Bottom CTA */}
      <section className="rounded-3xl border border-[#e7e1d9] bg-gradient-to-br from-[#f4c95d22] to-[#ff6b6b22] px-8 py-12 text-center shadow-xl">
        <h2 className="font-display text-3xl font-semibold text-[#1c1b1f] sm:text-4xl">
          {t.landing.ctaBottom.title}
        </h2>
        <p className="mt-2 text-lg text-[#524b5a]">{t.landing.ctaBottom.subtitle}</p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#ff6b6b] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#ff6b6b33] transition hover:-translate-y-[1px] hover:bg-[#e75a5a] active:scale-95"
          >
            {t.landing.ctaBottom.button}
          </Link>
        </div>
      </section>
    </div>
  );
}



