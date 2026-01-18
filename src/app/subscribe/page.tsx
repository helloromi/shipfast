import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckoutButton } from "@/components/payments/checkout-button";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { hasActiveSubscription } from "@/lib/queries/access";
import { isAdmin } from "@/lib/utils/admin";
import { t } from "@/locales/fr";

export default async function SubscribePage() {
  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }

  const [admin, subscribed] = await Promise.all([
    isAdmin(user.id),
    hasActiveSubscription(user.id),
  ]);

  if (admin || subscribed) {
    redirect("/home");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
          Abonnement
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f] sm:text-4xl">
          Débloque toute l'app
        </h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          {t.pricing.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Plan Mensuel */}
        <div className="rounded-3xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm transition hover:shadow-lg">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[#3b1f4a]">
                {t.pricing.plans.monthly.name}
              </h3>
              <p className="text-xs text-[#7a7184]">
                {t.pricing.plans.monthly.description}
              </p>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-[#3b1f4a]">
                {t.pricing.plans.monthly.price}
              </span>
              <span className="text-sm text-[#7a7184]">
                {t.pricing.plans.monthly.period}
              </span>
            </div>

            <ul className="flex flex-col gap-2 text-sm text-[#524b5a]">
              {t.pricing.plans.monthly.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <CheckoutButton 
              plan="monthly"
              className="w-full rounded-full bg-gradient-to-r from-[#3b1f4a] to-[#5a3d6b] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px]"
            >
              {t.pricing.cta}
            </CheckoutButton>
          </div>
        </div>

        {/* Plan Trimestriel */}
        <div className="rounded-3xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm transition hover:shadow-lg">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[#3b1f4a]">
                {t.pricing.plans.quarterly.name}
              </h3>
              <p className="text-xs text-[#7a7184]">
                {t.pricing.plans.quarterly.description}
              </p>
              <p className="mt-1 text-xs font-semibold text-green-600">
                {t.pricing.plans.quarterly.savings}
              </p>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-[#3b1f4a]">
                {t.pricing.plans.quarterly.price}
              </span>
              <span className="text-sm text-[#7a7184]">
                {t.pricing.plans.quarterly.period}
              </span>
            </div>

            <ul className="flex flex-col gap-2 text-sm text-[#524b5a]">
              {t.pricing.plans.quarterly.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <CheckoutButton 
              plan="quarterly"
              className="w-full rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px]"
            >
              {t.pricing.cta}
            </CheckoutButton>
          </div>
        </div>

        {/* Plan Annuel - Populaire */}
        <div className="relative rounded-3xl border-2 border-[#ff6b6b] bg-white/90 p-6 shadow-lg transition hover:shadow-xl">
          <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-4 py-1 text-xs font-semibold text-white shadow-md">
            Populaire
          </div>
          
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[#3b1f4a]">
                {t.pricing.plans.yearly.name}
              </h3>
              <p className="text-xs text-[#7a7184]">
                {t.pricing.plans.yearly.description}
              </p>
              <p className="mt-1 text-xs font-semibold text-green-600">
                {t.pricing.plans.yearly.savings}
              </p>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-[#3b1f4a]">
                {t.pricing.plans.yearly.price}
              </span>
              <span className="text-sm text-[#7a7184]">
                {t.pricing.plans.yearly.period}
              </span>
            </div>

            <ul className="flex flex-col gap-2 text-sm text-[#524b5a]">
              {t.pricing.plans.yearly.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <CheckoutButton 
              plan="yearly"
              className="w-full rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px]"
            >
              {t.pricing.cta}
            </CheckoutButton>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-[#7a7184]">
          {t.pricing.credibility.secure} • {t.pricing.credibility.cancellable} • {t.pricing.credibility.instantAccess}
        </p>
      </div>

      <div className="text-center text-sm text-[#524b5a]">
        <Link
          href="/onboarding"
          className="font-semibold text-[#3b1f4a] underline underline-offset-4"
        >
          ← Retour
        </Link>
      </div>
    </div>
  );
}
