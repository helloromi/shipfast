import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";

import { hasActiveSubscription } from "@/lib/queries/access";
import { isAdmin } from "@/lib/utils/admin";

/**
 * Enforce the new paywall: only admins or users with an active subscription can access protected pages.
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

  redirect(redirectTo);
}

