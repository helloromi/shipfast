"use client";

import { useState } from "react";
import Link from "next/link";
import { t } from "@/locales/fr";

export function PricingSection() {
  const [linesCount, setLinesCount] = useState<string>("");
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const calculatePrice = () => {
    const count = parseInt(linesCount);
    if (isNaN(count) || count <= 0) {
      setEstimatedPrice(null);
      return;
    }

    // 1€ pour 10 répliques, minimum 2€
    const pricePer10Lines = 1;
    const minPrice = 2;
    const price = Math.max(minPrice, Math.ceil((count / 10) * pricePer10Lines));
    setEstimatedPrice(price);
  };

  return (
    <section className="rounded-3xl border border-[#e7e1d9] bg-white/80 px-8 py-12 shadow-xl">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold text-[#1c1b1f] sm:text-4xl">
            {t.pricing.title}
          </h2>
          <p className="mt-2 text-lg text-[#524b5a]">{t.pricing.subtitle}</p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm">
            <h3 className="font-display text-xl font-semibold text-[#3b1f4a]">
              {t.pricing.model.perScene}
            </h3>
            <p className="mt-2 text-sm text-[#524b5a]">{t.pricing.model.perLines}</p>
          </div>

          <div className="rounded-2xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm">
            <label className="block text-sm font-semibold text-[#3b1f4a]">
              {t.pricing.model.calculator.label}
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                value={linesCount}
                onChange={(e) => setLinesCount(e.target.value)}
                placeholder={t.pricing.model.calculator.placeholder}
                className="flex-1 rounded-lg border border-[#e7e1d9] px-3 py-2 text-sm focus:border-[#3b1f4a] focus:outline-none focus:ring-2 focus:ring-[#3b1f4a33]"
                min="1"
              />
              <button
                onClick={calculatePrice}
                className="min-h-[44px] rounded-lg bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e75a5a] active:scale-95"
              >
                {t.pricing.model.calculator.button}
              </button>
            </div>
            {estimatedPrice !== null && (
              <p className="mt-3 text-sm font-semibold text-[#3b1f4a]">
                {t.pricing.model.calculator.result} <span className="text-lg">{estimatedPrice}€</span>
              </p>
            )}
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

