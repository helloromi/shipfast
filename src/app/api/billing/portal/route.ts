import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { getSiteUrl } from "@/lib/url";
import { requireAuth } from "@/lib/utils/api-auth";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, { key: (id) => `portal:${id}`, max: 10 });
    if (!auth.ok) return auth.response;
    const { user, supabase } = auth;

    const customerResult = await getOrCreateStripeCustomer(supabase, user.id, user.email ?? undefined);
    if ("error" in customerResult) {
      return NextResponse.json({ error: customerResult.error }, { status: customerResult.status });
    }
    const { stripeCustomerId } = customerResult;

    const stripe = getStripe();

    // Create portal session
    const siteUrl = getSiteUrl();
    const returnUrl = `${siteUrl}/compte`;

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error creating billing portal session:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

