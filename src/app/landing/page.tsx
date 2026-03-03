import Link from "next/link";
import { redirect } from "next/navigation";

import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { t } from "@/locales/fr";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FAQSection } from "@/components/landing/faq-section";
import { PricingSection } from "@/components/pricing/pricing-section";

export default async function LandingPage() {
  const user = await getSupabaseSessionUser();
  if (user) {
    redirect("/home");
  }

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
                  href="#comment-ca-marche"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#e7e1d9] bg-white px-5 py-3 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:border-[#3b1f4a33] hover:text-[#3b1f4a] active:scale-95"
                >
                  {t.landing.cta.commentImporter}
                </Link>
              </div>
              <p className="text-xs text-[#524b5a] sm:text-sm">{t.landing.cta.commencerSubtext}</p>
            </div>
            {/* Trust Signals */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#524b5a]">
              <span className="font-semibold text-[#3b1f4a]">
                {t.landing.trustSignals.importFocused}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-[#524b5a]">
              <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">{t.landing.features.flashcardsScene}</span>
              <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">{t.landing.features.rappelsAuditions}</span>
              <span className="rounded-full bg-white/80 px-3 py-1 shadow-sm">{t.landing.features.feedbackRapide}</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/90 p-4 shadow-lg lg:max-w-md">
            {[
              t.landing.importSteps.step1,
              t.landing.importSteps.step2,
              t.landing.importSteps.step3,
            ].map((step, index) => (
              <div
                key={step.title}
                className="flex items-center gap-3 rounded-xl border border-[#e7e1d9] bg-white/90 px-3 py-3 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4c95d33] text-sm font-bold text-[#3b1f4a]">
                  {index + 1}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#3b1f4a]">{step.title}</div>
                  <div className="text-xs text-[#524b5a]">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi choisir Côté-Cour (problème + bénéfices) */}
      <section className="rounded-3xl border border-[#e7e1d9] bg-[#524b5a08] px-8 py-10 shadow-lg">
        <h2 className="font-display text-2xl font-semibold text-[#1c1b1f] sm:text-3xl">
          Pourquoi choisir Côté-Cour ?
        </h2>
        {t.landing.problemSection.subtitle && (
          <p className="mx-auto mt-3 max-w-2xl text-lg text-[#524b5a]">
            {t.landing.problemSection.subtitle}
          </p>
        )}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
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



