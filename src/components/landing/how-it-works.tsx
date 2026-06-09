import { t } from "@/locales/fr";

export function HowItWorks() {
  const steps = [
    t.landing.howItWorks.steps.step1,
    t.landing.howItWorks.steps.step2,
    t.landing.howItWorks.steps.step3,
  ];

  return (
    <section id="comment-ca-marche" className="mx-auto w-full max-w-6xl scroll-mt-6">
      <div className="text-center">
        <h2 className="font-display text-3xl font-semibold text-[#211a26] sm:text-4xl">
          {t.landing.howItWorks.title}
        </h2>
        <p className="mt-2 text-lg text-[#5d5468]">{t.landing.howItWorks.subtitle}</p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {steps.map((step, index) => (
          <div key={index} className="relative flex flex-col">
            {/* Fil conducteur entre les étapes */}
            {index < steps.length - 1 && (
              <div
                className="absolute right-[-12px] top-7 hidden h-px w-6 bg-gradient-to-r from-[#d8cfc0] to-transparent sm:block"
                aria-hidden
              />
            )}
            <div className="card card-hover flex h-full flex-col p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f4c95d] to-[#d9a93a] font-display text-xl font-bold text-[#3b1f4a] shadow-md shadow-[#f4c95d4d]">
                {index + 1}
              </div>
              <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5d5468]">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
