import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe/client";
import { getSiteUrl } from "@/lib/url";

function getSubscriptionPriceId(): string {
  const priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
  if (!priceId) {
    throw new Error("STRIPE_SUBSCRIPTION_PRICE_ID is not set");
  }
  return priceId;
}

export async function POST(request: NextRequest) {
  try {
    void request;
    const stripe = getStripe();
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Reuse billing_customers mapping to attach the Checkout session to a Stripe customer.
    const { data: existingCustomer, error: customerReadError } = await supabase
      .from("billing_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (customerReadError) {
      return NextResponse.json(
        { error: "Failed to load billing customer" },
        { status: 500 }
      );
    }

    let stripeCustomerId = existingCustomer?.stripe_customer_id ?? null;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      stripeCustomerId = customer.id;

      const { error: customerWriteError } = await supabase
        .from("billing_customers")
        .upsert(
          { user_id: user.id, stripe_customer_id: stripeCustomerId },
          { onConflict: "user_id" }
        );

      if (customerWriteError) {
        return NextResponse.json(
          { error: "Failed to save billing customer" },
          { status: 500 }
        );
      }
    }

    const siteUrl = getSiteUrl();
    const successUrl = `${siteUrl}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/subscribe`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: stripeCustomerId,
      line_items: [{ price: getSubscriptionPriceId(), quantity: 1 }],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


