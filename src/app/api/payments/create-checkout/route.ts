import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { getSiteUrl } from "@/lib/url";
import { requireAuth } from "@/lib/utils/api-auth";

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
    const auth = await requireAuth(request, { key: (id) => `checkout:${id}`, max: 5 });
    if (!auth.ok) return auth.response;
    const { user, supabase } = auth;

    const stripe = getStripe();

    // Parse request body to get the plan
    const body = await request.json();
    const plan = body.plan as "monthly" | "quarterly" | "yearly" | undefined;
    
    // Default to monthly if no plan specified (backward compatibility)
    const selectedPlan = plan || "monthly";
    
    // Validate plan
    if (!["monthly", "quarterly", "yearly"].includes(selectedPlan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const customerResult = await getOrCreateStripeCustomer(supabase, user.id, user.email ?? undefined);
    if ("error" in customerResult) {
      return NextResponse.json({ error: customerResult.error }, { status: customerResult.status });
    }
    const { stripeCustomerId } = customerResult;

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


