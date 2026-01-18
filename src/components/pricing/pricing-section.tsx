import Link from "next/link";
import { t } from "@/locales/fr";

export function PricingSection() {
  return (
    <section className="rounded-3xl border border-[#e7e1d9] bg-white/80 px-8 py-12 shadow-xl">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold text-[#1c1b1f] sm:text-4xl">
            {t.pricing.title}
          </h2>
          <p className="mt-2 text-lg text-[#524b5a]">{t.pricing.subtitle}</p>
        </div>

        {/* Fonctionnalités incluses */}
        <div className="mt-8 rounded-2xl border border-[#e7e1d9] bg-gradient-to-br from-[#f4c95d11] to-[#ff6b6b11] p-6">
          <h3 className="text-center text-lg font-semibold text-[#3b1f4a]">
            {t.pricing.includedFeatures.title}
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {t.pricing.includedFeatures.items.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-[#524b5a]">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
                  ✓
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Plan Mensuel */}
          <div className="rounded-2xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm transition hover:shadow-md">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold text-[#3b1f4a]">
                {t.pricing.plans.monthly.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#3b1f4a]">
                  {t.pricing.plans.monthly.price}
                </span>
                <span className="text-sm text-[#7a7184]">
                  {t.pricing.plans.monthly.period}
                </span>
              </div>
            </div>
          </div>

          {/* Plan Trimestriel */}
          <div className="rounded-2xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm transition hover:shadow-md">
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold text-[#3b1f4a]">
                {t.pricing.plans.quarterly.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#3b1f4a]">
                  {t.pricing.plans.quarterly.price}
                </span>
                <span className="text-sm text-[#7a7184]">
                  {t.pricing.plans.quarterly.period}
                </span>
              </div>
              <p className="text-sm font-semibold text-green-600">
                💰 {t.pricing.plans.quarterly.savings}
              </p>
            </div>
          </div>

          {/* Plan Annuel */}
          <div className="relative rounded-2xl border-2 border-[#ff6b6b] bg-white/90 p-6 shadow-md transition hover:shadow-lg">
            <div className="absolute -top-2 right-4 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-3 py-0.5 text-xs font-semibold text-white shadow">
              Populaire
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold text-[#3b1f4a]">
                {t.pricing.plans.yearly.name}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[#3b1f4a]">
                  {t.pricing.plans.yearly.price}
                </span>
                <span className="text-sm text-[#7a7184]">
                  {t.pricing.plans.yearly.period}
                </span>
              </div>
              <p className="text-sm font-semibold text-green-600">
                💰 {t.pricing.plans.yearly.savings}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-[#524b5a]">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>{t.pricing.credibility.secure}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>{t.pricing.credibility.noCommitment}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span>{t.pricing.credibility.instantAccess}</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#524b5a]">
            {t.pricing.contact.question}{" "}
            <Link href="/login" className="font-semibold text-[#3b1f4a] underline underline-offset-4">
              {t.pricing.contact.link}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

