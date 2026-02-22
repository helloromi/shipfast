import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe/client";

type GetOrCreateResult =
  | { stripeCustomerId: string }
  | { error: string; status: number };

/**
 * Récupère le Stripe customer lié à l'utilisateur, ou le crée s'il n'existe pas.
 * Persiste la correspondance dans `billing_customers`.
 */
export async function getOrCreateStripeCustomer(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string | undefined
): Promise<GetOrCreateResult> {
  const { data: existingCustomer, error: customerReadError } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (customerReadError) {
    return { error: "Failed to load billing customer", status: 500 };
  }

  if (existingCustomer?.stripe_customer_id) {
    return { stripeCustomerId: existingCustomer.stripe_customer_id };
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: userEmail ?? undefined,
    metadata: { supabase_user_id: userId },
  });

  const { error: customerWriteError } = await supabase
    .from("billing_customers")
    .upsert(
      { user_id: userId, stripe_customer_id: customer.id },
      { onConflict: "user_id" }
    );

  if (customerWriteError) {
    return { error: "Failed to save billing customer", status: 500 };
  }

  return { stripeCustomerId: customer.id };
}
