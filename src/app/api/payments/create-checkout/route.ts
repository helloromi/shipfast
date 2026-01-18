import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe/client";
import { getSiteUrl } from "@/lib/url";
import { assertSameOrigin } from "@/lib/utils/csrf";
import { checkRateLimit } from "@/lib/utils/rate-limit";

function getSubscriptionPriceId(plan: "monthly" | "quarterly" | "yearly"): string {
  const envKey = plan === "monthly" 
    ? "STRIPE_SUBSCRIPTION_PRICE_ID_MONTHLY"
    : plan === "quarterly"
    ? "STRIPE_SUBSCRIPTION_PRICE_ID_QUARTERLY"
    : "STRIPE_SUBSCRIPTION_PRICE_ID_YEARLY";
  
  const priceId = process.env[envKey];
  if (!priceId) {
    throw new Error(`${envKey} is not set`);
  }
  return priceId;
}

export async function POST(request: NextRequest) {
  try {
    const csrf = assertSameOrigin(request);
    if (!csrf.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const stripe = getStripe();
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit(`checkout:${user.id}`, { windowMs: 60_000, max: 5 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    // Parse request body to get the plan
    const body = await request.json();
    const plan = body.plan as "monthly" | "quarterly" | "yearly" | undefined;
    
    // Default to monthly if no plan specified (backward compatibility)
    const selectedPlan = plan || "monthly";
    
    // Validate plan
    if (!["monthly", "quarterly", "yearly"].includes(selectedPlan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
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
      line_items: [{ price: getSubscriptionPriceId(selectedPlan), quantity: 1 }],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        plan: selectedPlan,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan: selectedPlan,
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


