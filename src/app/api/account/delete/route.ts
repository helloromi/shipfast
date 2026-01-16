import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getStripe } from "@/lib/stripe/client";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load Stripe customer id (if any)
    const { data: billingCustomer, error: billingCustomerError } = await supabase
      .from("billing_customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (billingCustomerError) {
      return NextResponse.json(
        { error: "Failed to load billing customer" },
        { status: 500 }
      );
    }

    const stripeCustomerId = billingCustomer?.stripe_customer_id ?? null;
    const stripe = getStripe();

    // Guard: do not allow deletion if any subscription is active or trialing
    if (stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "all",
        limit: 100,
      });

      const hasBlockingSubscription = subscriptions.data.some((s) =>
        s.status === "active" || s.status === "trialing"
      );

      if (hasBlockingSubscription) {
        return NextResponse.json(
          {
            error:
              "Suppression impossible: vous avez un abonnement actif. Annulez l’abonnement puis réessayez.",
            code: "SUBSCRIPTION_ACTIVE",
          },
          { status: 403 }
        );
      }

      // Anonymize Stripe customer (keep accounting history)
      await stripe.customers.update(stripeCustomerId, {
        email: null,
        name: "Deleted user",
        metadata: {
          gdpr_deleted: "true",
          gdpr_deleted_at: new Date().toISOString(),
        },
      });
    }

    // Delete Supabase user (cascades in DB handle app data cleanup)
    const admin = createSupabaseAdminClient();
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message ?? "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

