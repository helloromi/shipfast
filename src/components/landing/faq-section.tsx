"use client";

import { useState } from "react";
import { t } from "@/locales/fr";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = [
    t.landing.faq.items.q1,
    t.landing.faq.items.q2,
    t.landing.faq.items.q3,
    t.landing.faq.items.q4,
    t.landing.faq.items.q5,
    t.landing.faq.items.q6,
  ];

  return (
    <section className="rounded-3xl border border-[#e7e1d9] bg-white/80 px-8 py-12 shadow-xl">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-3xl font-semibold text-[#1c1b1f] sm:text-4xl">
          {t.landing.faq.title}
        </h2>

        <div className="mt-8 space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-[#e7e1d9] bg-white/90 shadow-sm transition hover:shadow-md"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex min-h-[56px] w-full items-center justify-between px-6 py-4 text-left transition active:bg-[#f4c95d11]"
              >
                <span className="font-semibold text-[#3b1f4a]">{item.question}</span>
                <span className="text-2xl text-[#524b5a]">{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && (
                <div className="border-t border-[#e7e1d9] px-6 pb-4 pt-2">
                  <p className="text-sm text-[#524b5a]">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

