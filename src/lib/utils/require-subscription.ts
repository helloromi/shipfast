import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";

import { hasActiveSubscription } from "@/lib/queries/access";
import { hasClassMembership } from "@/lib/queries/teacher";
import { isAdmin } from "@/lib/utils/admin";

/**
 * Enforce the paywall: admins, abonnés et membres d'une classe (élèves couverts
 * par le compte de leur professeur) accèdent aux pages protégées.
 * - If user is null: redirect to /login
 * - If not entitled: redirect to /onboarding (default)
 */
export async function requireSubscriptionOrRedirect(
  user: User | null,
  redirectTo: string = "/onboarding"
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

