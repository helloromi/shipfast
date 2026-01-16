import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckoutButton } from "@/components/payments/checkout-button";
import { getSupabaseSessionUser } from "@/lib/queries/scenes";
import { hasActiveSubscription } from "@/lib/queries/access";
import { isAdmin } from "@/lib/utils/admin";

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
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
          Abonnement
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          Débloque toute l’app
        </h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          5€/mois. Accès complet à l’apprentissage, l’import, la bibliothèque et tes statistiques.
        </p>
      </div>

      <div className="rounded-3xl border border-[#e7e1d9] bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#3b1f4a]">
                Abonnement mensuel
              </p>
              <p className="text-xs text-[#7a7184]">
                Annulable à tout moment
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#3b1f4a]">5€</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                / mois
              </div>
            </div>
          </div>

          <ul className="list-disc pl-5 text-sm text-[#524b5a]">
            <li>Apprentissage complet</li>
            <li>Import illimité</li>
            <li>Bibliothèque + stats</li>
          </ul>

          <CheckoutButton className="w-full rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:-translate-y-[1px]">
            S’abonner maintenant
          </CheckoutButton>

          <p className="text-xs text-[#7a7184]">
            En continuant, tu acceptes le paiement sécurisé via Stripe.
          </p>
        </div>
      </div>

      <div className="text-sm text-[#524b5a]">
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

