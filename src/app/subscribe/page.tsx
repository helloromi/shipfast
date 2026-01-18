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

      {/* Fonctionnalités incluses */}
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#e7e1d9] bg-gradient-to-br from-[#f4c95d11] to-[#ff6b6b11] p-6">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Plan Mensuel */}
        <div className="rounded-3xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm transition hover:shadow-lg">
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

            <p className="text-xs text-[#7a7184]">
              {t.pricing.plans.monthly.description}
            </p>

            <CheckoutButton 
              plan="monthly"
              className="mt-auto w-full rounded-full bg-gradient-to-r from-[#3b1f4a] to-[#5a3d6b] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px]"
            >
              {t.pricing.cta}
            </CheckoutButton>
          </div>
        </div>

        {/* Plan Trimestriel */}
        <div className="rounded-3xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm transition hover:shadow-lg">
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

            <CheckoutButton 
              plan="quarterly"
              className="mt-auto w-full rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px]"
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

            <CheckoutButton 
              plan="yearly"
              className="mt-auto w-full rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px]"
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
