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
          {t.pricing.passCheckout.eyebrow}
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f] sm:text-4xl">
          {t.pricing.passCheckout.title}
        </h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          {t.pricing.passCheckout.priceLine}
        </p>
      </div>

      <div className="mx-auto w-full max-w-md rounded-3xl border-2 border-[#3b1f4a] bg-white/90 p-6 shadow-md sm:p-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            {t.pricing.passCheckout.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-[#524b5a]">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
                  ✓
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <CheckoutButton
            plan="quarterly"
            className="w-full rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px]"
          >
            {t.pricing.passCheckout.cta}
          </CheckoutButton>

          <p className="text-center text-xs text-[#7a7184]">
            {t.pricing.passCheckout.note}
          </p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-[#7a7184]">
          {t.pricing.credibility.secure} • {t.pricing.credibility.instantAccess}
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
