import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";

import { hasActiveSubscription } from "@/lib/queries/access";
import { hasClassMembership } from "@/lib/queries/teacher";
import { isAdmin } from "@/lib/utils/admin";

/**
 * Enforce the paywall: admins, abonnés et membres d'une classe (élèves couverts
 * par le compte de leur professeur) accèdent aux pages protégées.
 * - If user is null: redirect to /login
 * - If not entitled: redirect to /subscribe (default)
 *
 * NB : les seuls appelants restants gardent des actions payantes (import, edit,
 * export, scène privée, espace prof). Un utilisateur qui les atteint sans droit
 * tente explicitement du contenu payant → on l'envoie sur la page de paiement,
 * pas sur l'onboarding.
 */
export async function requireSubscriptionOrRedirect(
  user: User | null,
  redirectTo: string = "/subscribe"
): Promise<void> {
  if (!user) redirect("/login");

  // Les trois vérifications sont indépendantes : on les lance en parallèle
  // (latence = la plus lente, pas la somme des trois).
  const [admin, subscribed, inClass] = await Promise.all([
    isAdmin(user.id),
    hasActiveSubscription(user.id),
    hasClassMembership(user.id),
  ]);

  if (admin || subscribed || inClass) return;

  redirect(redirectTo);
}

