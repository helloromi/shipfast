import { t } from "@/locales/fr";

export function HowItWorks() {
  const steps = [
    t.landing.howItWorks.steps.step1,
    t.landing.howItWorks.steps.step2,
    t.landing.howItWorks.steps.step3,
    t.landing.howItWorks.steps.step4,
  ];

  return (
    <section className="rounded-3xl border border-[#e7e1d9] bg-white/80 px-8 py-12 shadow-xl">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="font-display text-3xl font-semibold text-[#1c1b1f] sm:text-4xl">
            {t.landing.howItWorks.title}
          </h2>
          <p className="mt-2 text-lg text-[#524b5a]">{t.landing.howItWorks.subtitle}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col rounded-2xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm transition hover:-translate-y-[1px] hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4c95d33] text-xl font-bold text-[#3b1f4a]">
                {index + 1}
              </div>
              <h3 className="font-display text-lg font-semibold text-[#3b1f4a]">{step.title}</h3>
              <p className="mt-2 text-sm text-[#524b5a]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


