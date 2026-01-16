import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import Stripe from "stripe";

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  return secret;
}

function toTimestamptzFromUnixSeconds(value: number | null | undefined): string | null {
  if (!value || Number.isNaN(value)) return null;
  return new Date(value * 1000).toISOString();
}

type SubscriptionPeriodFields = {
  current_period_end?: number | null;
  cancel_at_period_end?: boolean;
};

async function resolveUserIdFromCustomerId(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  customerId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("billing_customers")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle<{ user_id: string }>();

  if (error) {
    console.error("[WEBHOOK] Error resolving user_id from billing_customers:", error);
    return null;
  }
  return data?.user_id ?? null;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // Log de réception du webhook
  console.log("[WEBHOOK] Webhook reçu à", new Date().toISOString());
  console.log("[WEBHOOK] Signature présente:", !!signature);

  if (!signature) {
    console.error("[WEBHOOK] ERREUR: Pas de signature Stripe");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = getWebhookSecret();
  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log("[WEBHOOK] Événement vérifié avec succès:", event.type, "ID:", event.id);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[WEBHOOK] ERREUR: Échec de vérification de signature:", message);
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    );
  }

  // Logger tous les événements reçus (pour debug)
  console.log(`[WEBHOOK] Événement reçu: ${event.type} (ID: ${event.id})`);

  // Subscription-centric billing sync
  if (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    try {
      const supabase = createSupabaseAdminClient();

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[WEBHOOK] Traitement de checkout.session.completed");
        console.log("[WEBHOOK] Session ID:", session.id);
        console.log("[WEBHOOK] Mode:", session.mode);
        console.log("[WEBHOOK] Metadata:", JSON.stringify(session.metadata, null, 2));

        const userId = session.metadata?.user_id ?? null;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;

        if (!userId) {
          console.error("[WEBHOOK] ERREUR: Pas de user_id dans les metadata");
          return NextResponse.json({ error: "No user_id" }, { status: 400 });
        }
        if (!customerId) {
          console.error("[WEBHOOK] ERREUR: Pas de customer dans la session");
          return NextResponse.json({ error: "No customer" }, { status: 400 });
        }
        if (!subscriptionId) {
          console.error("[WEBHOOK] ERREUR: Pas de subscription dans la session");
          return NextResponse.json({ error: "No subscription" }, { status: 400 });
        }

        // 1) Upsert customer mapping
        const { error: customerWriteError } = await supabase
          .from("billing_customers")
          .upsert(
            { user_id: userId, stripe_customer_id: customerId },
            { onConflict: "user_id" }
          );
        if (customerWriteError) {
          console.error("[WEBHOOK] ERREUR upsert billing_customers:", customerWriteError);
          return NextResponse.json({ error: "Failed to upsert billing_customers" }, { status: 500 });
        }

        // 2) Fetch subscription snapshot from Stripe and upsert
        const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
        const subscription = subscriptionResponse as unknown as Stripe.Subscription;
        const subscriptionPeriod = subscription as unknown as SubscriptionPeriodFields;
        const { error: subWriteError } = await supabase
          .from("billing_subscriptions")
          .upsert(
            {
              stripe_subscription_id: subscription.id,
              user_id: userId,
              status: subscription.status,
              current_period_end: toTimestamptzFromUnixSeconds(subscriptionPeriod.current_period_end),
              cancel_at_period_end: Boolean(subscriptionPeriod.cancel_at_period_end),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "stripe_subscription_id" }
          );

        if (subWriteError) {
          console.error("[WEBHOOK] ERREUR upsert billing_subscriptions:", subWriteError);
          return NextResponse.json({ error: "Failed to upsert billing_subscriptions" }, { status: 500 });
        }

        console.log("[WEBHOOK] ✅ Billing snapshot upsert OK (checkout)");
        return NextResponse.json({ received: true });
      }

      // subscription.updated / subscription.deleted
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      const userId =
        (subscription.metadata && typeof subscription.metadata.user_id === "string" && subscription.metadata.user_id) ||
        (await resolveUserIdFromCustomerId(supabase, customerId));

      if (!userId) {
        console.error("[WEBHOOK] ERREUR: impossible de résoudre user_id pour subscription", subscription.id);
        return NextResponse.json({ error: "No user_id for subscription" }, { status: 400 });
      }

      // Ensure customer mapping exists as well
      const { error: customerWriteError } = await supabase
        .from("billing_customers")
        .upsert(
          { user_id: userId, stripe_customer_id: customerId },
          { onConflict: "user_id" }
        );
      if (customerWriteError) {
        console.error("[WEBHOOK] ERREUR upsert billing_customers:", customerWriteError);
        return NextResponse.json({ error: "Failed to upsert billing_customers" }, { status: 500 });
      }

      const { error: subWriteError } = await supabase
        .from("billing_subscriptions")
        .upsert(
          {
            stripe_subscription_id: subscription.id,
            user_id: userId,
            status: subscription.status,
            current_period_end: toTimestamptzFromUnixSeconds((subscription as unknown as SubscriptionPeriodFields).current_period_end),
            cancel_at_period_end: Boolean((subscription as unknown as SubscriptionPeriodFields).cancel_at_period_end),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "stripe_subscription_id" }
        );

      if (subWriteError) {
        console.error("[WEBHOOK] ERREUR upsert billing_subscriptions:", subWriteError);
        return NextResponse.json({ error: "Failed to upsert billing_subscriptions" }, { status: 500 });
      }

      console.log("[WEBHOOK] ✅ Billing snapshot upsert OK (subscription event)", event.type);
      return NextResponse.json({ received: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Internal server error";
      console.error("[WEBHOOK] ERREUR lors du traitement billing:", error);
      if (error instanceof Error) console.error("[WEBHOOK] Stack:", error.stack);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  console.log(`[WEBHOOK] Événement non géré: ${event.type} (ignoré)`);

  return NextResponse.json({ received: true });
}




