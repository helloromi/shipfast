import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe/client";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    redirect("/subscribe");
  }

  try {
    console.log("[SUCCESS] Route success appelée avec session_id:", sessionId);
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log("[SUCCESS] Session récupérée - status:", session.status, "mode:", session.mode);
    console.log("[SUCCESS] Metadata:", JSON.stringify(session.metadata, null, 2));

    const userId = session.metadata?.user_id ?? null;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;

    // Fallback: attempt to upsert billing snapshot directly (in case webhook is delayed)
    if (userId && customerId && subscriptionId) {
      const adminSupabase = createSupabaseAdminClient();

      const { error: customerWriteError } = await adminSupabase
        .from("billing_customers")
        .upsert(
          { user_id: userId, stripe_customer_id: customerId },
          { onConflict: "user_id" }
        );
      if (customerWriteError) {
        console.warn("[SUCCESS] ⚠️ Erreur upsert billing_customers:", customerWriteError);
      }

      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const { error: subWriteError } = await adminSupabase
          .from("billing_subscriptions")
          .upsert(
            {
              stripe_subscription_id: subscription.id,
              user_id: userId,
              status: subscription.status,
              current_period_end: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null,
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "stripe_subscription_id" }
          );
        if (subWriteError) {
          console.warn("[SUCCESS] ⚠️ Erreur upsert billing_subscriptions:", subWriteError);
        }
      } catch (e) {
        console.warn("[SUCCESS] ⚠️ Erreur récupération subscription Stripe:", e);
      }
    } else {
      console.warn("[SUCCESS] ⚠️ Metadata/customer/subscription incomplets, fallback billing ignoré");
    }

    redirect("/home");
  } catch (error) {
    console.error("[SUCCESS] ❌ Erreur lors de la récupération de la session:", error);
    redirect("/subscribe");
  }
}




