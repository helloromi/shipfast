import Link from "next/link";
import { t } from "@/locales/fr";

export function PricingSection() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold text-[#1c1b1f] sm:text-4xl">
            {t.pricing.title}
          </h2>
          <p className="mt-2 text-lg text-[#524b5a]">{t.pricing.subtitle}</p>
        </div>

        <div className="mx-auto mt-10 max-w-md rounded-2xl border-2 border-[#3b1f4a] bg-white/90 p-6 shadow-md sm:p-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 text-center">
              <h3 className="text-xl font-semibold text-[#3b1f4a]">{t.pricing.pass.name}</h3>
              <span className="text-5xl font-bold text-[#3b1f4a]">{t.pricing.pass.price}</span>
              <p className="text-sm text-[#7a7184]">{t.pricing.pass.period}</p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-[#3b1f4a]">
                {t.pricing.pass.includedTitle}
              </p>
              {t.pricing.pass.included.map((feature, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-[#524b5a]">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
                    ✓
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 rounded-xl bg-[#f4c95d1a] p-4">
              <p className="text-sm font-semibold text-[#3b1f4a]">{t.pricing.pass.freeTitle}</p>
              {t.pricing.pass.free.map((feature, index) => (
                <div key={index} className="flex items-start gap-2 text-sm text-[#524b5a]">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#f4c95d55] text-xs text-[#3b1f4a]">
                    🎭
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/login?redirect=/subscribe"
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px]"
            >
              {t.pricing.pass.cta}
            </Link>
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
