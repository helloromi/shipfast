import { getStripe } from "./client";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export interface StripeCustomer {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Récupère ou crée un customer Stripe pour un utilisateur
 */
export async function getOrCreateStripeCustomer(userId: string, email?: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const stripe = getStripe();

  // Vérifier si un customer existe déjà
  const { data: existing } = await supabase
    .from("user_stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle<StripeCustomer>();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  // Créer un nouveau customer Stripe
  const customer = await stripe.customers.create({
    email: email,
    metadata: {
      user_id: userId,
    },
  });

  // Stocker dans Supabase (utiliser admin pour contourner RLS si nécessaire)
  const adminSupabase = createSupabaseAdminClient();
  await adminSupabase.from("user_stripe_customers").insert({
    user_id: userId,
    stripe_customer_id: customer.id,
  });

  return customer.id;
}

/**
 * Récupère le customer Stripe ID d'un utilisateur
 */
export async function getStripeCustomerId(userId: string): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("user_stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle<StripeCustomer>();

  return data?.stripe_customer_id ?? null;
}

/**
 * Récupère les abonnements actifs d'un utilisateur depuis Stripe
 */
export async function getActiveSubscriptionsFromStripe(customerId: string) {
  const stripe = getStripe();
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "all", // On récupère tous les statuts et on filtre côté app
    limit: 100,
  });

  return subscriptions.data;
}

/**
 * Crée une session du Customer Portal Stripe
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

