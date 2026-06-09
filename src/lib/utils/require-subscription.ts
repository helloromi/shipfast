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

  const admin = await isAdmin(user.id);
  if (admin) return;

  const subscribed = await hasActiveSubscription(user.id);
  if (subscribed) return;

  const inClass = await hasClassMembership(user.id);
  if (inClass) return;

  redirect(redirectTo);
}

