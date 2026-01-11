import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { UserSubscription } from "@/lib/stripe/subscriptions";

/**
 * Récupère tous les abonnements d'un utilisateur depuis Supabase
 */
export async function getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user subscriptions:", error);
    return [];
  }

  return data ?? [];
}

/**
 * Vérifie si un utilisateur a des abonnements actifs
 */
export async function hasActiveSubscriptions(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("user_subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["active", "trialing", "past_due"]);

  if (error) {
    console.error("Error checking active subscriptions:", error);
    return false;
  }

  return (count ?? 0) > 0;
}

/**
 * Récupère les abonnements actifs d'un utilisateur
 */
export async function getActiveSubscriptions(userId: string): Promise<UserSubscription[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["active", "trialing", "past_due"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching active subscriptions:", error);
    return [];
  }

  return data ?? [];
}

/**
 * Synchronise un abonnement depuis Stripe vers Supabase
 */
export async function syncSubscriptionFromStripe(
  subscription: any,
  userId: string,
  customerId: string
): Promise<void> {
  const adminSupabase = createSupabaseAdminClient();

  const subscriptionData = {
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
  };

  // Utiliser upsert pour créer ou mettre à jour
  const { error } = await adminSupabase
    .from("user_subscriptions")
    .upsert(subscriptionData, {
      onConflict: "stripe_subscription_id",
    });

  if (error) {
    console.error("Error syncing subscription:", error);
    throw error;
  }
}

/**
 * Supprime un abonnement de Supabase (lorsqu'il est supprimé dans Stripe)
 */
export async function deleteSubscription(subscriptionId: string): Promise<void> {
  const adminSupabase = createSupabaseAdminClient();
  const { error } = await adminSupabase
    .from("user_subscriptions")
    .delete()
    .eq("stripe_subscription_id", subscriptionId);

  if (error) {
    console.error("Error deleting subscription:", error);
    throw error;
  }
}

