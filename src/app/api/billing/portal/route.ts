import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe/client";
import { getSiteUrl } from "@/lib/url";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1) Find existing Stripe customer id
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

    const stripe = getStripe();
    let stripeCustomerId = existingCustomer?.stripe_customer_id ?? null;

    // 2) Create Stripe customer if missing
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

    // 3) Create portal session
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

