import Link from "next/link";
import { t } from "@/locales/fr";

export function PricingSection() {
  return (
    <section className="rounded-3xl border border-[#e7e1d9] bg-white/80 px-8 py-12 shadow-xl">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold text-[#1c1b1f] sm:text-4xl">
            {t.pricing.title}
          </h2>
          <p className="mt-2 text-lg text-[#524b5a]">{t.pricing.subtitle}</p>
        </div>

        <div className="mt-8">
          <div className="mx-auto max-w-md rounded-2xl border border-[#e7e1d9] bg-white/90 p-8 shadow-sm">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#3b1f4a]">{t.pricing.model.monthly}</div>
              <p className="mt-3 text-sm text-[#524b5a]">{t.pricing.model.description}</p>
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

