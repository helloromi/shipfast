"use client";

import { useState } from "react";
import { t } from "@/locales/fr";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = t.landing.faq.order.map(
    (key) => t.landing.faq.items[key as keyof typeof t.landing.faq.items]
  );

  return (
    <section className="mx-auto w-full max-w-3xl">
      <h2 className="font-display text-3xl font-semibold text-[#211a26] sm:text-4xl">
        {t.landing.faq.title}
      </h2>

      <div className="mt-8 space-y-3">
        {faqItems.map((item, index) => {
          const open = openIndex === index;
          return (
            <div
              key={index}
              className={`card overflow-hidden transition ${open ? "ring-1 ring-[#f4c95d]" : ""}`}
            >
              <button
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex min-h-[56px] w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={open}
              >
                <span className="font-semibold text-[#3b1f4a]">{item.question}</span>
                <span
                  className={`text-xl text-[#8a8093] transition-transform duration-200 ${open ? "rotate-45" : ""}`}
                  aria-hidden
                >
                  +
                </span>
              </button>
              {open && (
                <div className="border-t border-[#efe9dd] px-5 pb-4 pt-3">
                  <p className="text-sm leading-relaxed text-[#5d5468]">{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
