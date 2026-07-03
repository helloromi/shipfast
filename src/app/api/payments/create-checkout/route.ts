import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { getSiteUrl } from "@/lib/url";
import { requireAuth } from "@/lib/utils/api-auth";

// "quarterly" est le pass 3 mois : paiement unique (mode "payment"), price
// one-time dédié. monthly/yearly restent des abonnements legacy (plus aucune
// UI ne les propose).
function getPriceEnvKey(plan: "monthly" | "quarterly" | "yearly"): string {
  return plan === "monthly"
    ? "STRIPE_SUBSCRIPTION_PRICE_ID_MONTHLY"
    : plan === "quarterly"
      ? "STRIPE_PASS_PRICE_ID"
      : "STRIPE_SUBSCRIPTION_PRICE_ID_YEARLY";
}

function getPriceId(plan: "monthly" | "quarterly" | "yearly"): string {
  const envKey = getPriceEnvKey(plan);
  const priceId = process.env[envKey];
  if (!priceId) {
    throw new Error(`${envKey} is not set`);
  }
  return priceId;
}

function checkCheckoutEnv(plan: "monthly" | "quarterly" | "yearly"): { error?: string } {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { error: "STRIPE_SECRET_KEY is not set" };
  }
  const priceIdKey = getPriceEnvKey(plan);
  if (!process.env[priceIdKey]) {
    return { error: `${priceIdKey} is not set` };
  }
  return {};
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, { key: (id) => `checkout:${id}`, max: 5 });
    if (!auth.ok) return auth.response;
    const { user, supabase } = auth;

    // Parse request body to get the plan
    const body = await request.json().catch(() => ({}));
    const plan = body.plan as "monthly" | "quarterly" | "yearly" | undefined;
    const selectedPlan = plan || "monthly";

    if (!["monthly", "quarterly", "yearly"].includes(selectedPlan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const envCheck = checkCheckoutEnv(selectedPlan);
    if (envCheck.error) {
      console.error("Create checkout env missing:", envCheck.error);
      return NextResponse.json(
        { error: "Configuration paiement manquante. Vérifiez les variables d'environnement Stripe." },
        { status: 503 }
      );
    }

    const stripe = getStripe();

    const customerResult = await getOrCreateStripeCustomer(supabase, user.id, user.email ?? undefined);
    if ("error" in customerResult) {
      return NextResponse.json({ error: customerResult.error }, { status: customerResult.status });
    }
    const { stripeCustomerId } = customerResult;

    const siteUrl = getSiteUrl();
    const successUrl = `${siteUrl}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/subscribe`;

    const isPass = selectedPlan === "quarterly";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: stripeCustomerId,
      line_items: [{ price: getPriceId(selectedPlan), quantity: 1 }],
      mode: isPass ? "payment" : "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        plan: selectedPlan,
      },
      ...(isPass
        ? {}
        : {
            subscription_data: {
              metadata: {
                user_id: user.id,
                plan: selectedPlan,
              },
            },
          }),
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


