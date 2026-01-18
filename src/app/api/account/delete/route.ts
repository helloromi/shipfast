import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getStripe } from "@/lib/stripe/client";
import { setAudienceUnsubscribedFromMarketing } from "@/lib/resend/automation";
import { assertSameOrigin } from "@/lib/utils/csrf";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const csrf = assertSameOrigin(request);
    if (!csrf.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = checkRateLimit(`account_delete:${user.id}`, { windowMs: 60_000, max: 3 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
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
        // Stripe types don't accept null; overwrite with a non-PII placeholder instead.
        email: `deleted+${stripeCustomerId}@example.invalid`,
        name: "Deleted user",
        metadata: {
          gdpr_deleted: "true",
          gdpr_deleted_at: new Date().toISOString(),
          // Ensure we don't keep a direct mapping after deletion.
          supabase_user_id: "deleted",
        },
      });
    }

    // Best effort (or strict when possible): ensure the email is marked unsubscribed in Resend
    // BEFORE deleting the user, because we may lose access to the email afterwards.
    //
    // If Resend is configured and returns an explicit API error, we abort deletion so we don't
    // leave the user subscribed on the marketing audience.
    const unsubscribeRes = await setAudienceUnsubscribedFromMarketing({
      userId: user.id,
      unsubscribed: true,
    }).catch((e: unknown) => {
      const message = e instanceof Error ? e.message : "Unknown error";
      return { ok: false as const, reason: "exception" as const, error: message };
    });

    if (!unsubscribeRes.ok) {
      // If Resend isn't configured or we can't resolve an email, don't block account deletion.
      const isNonBlocking = unsubscribeRes.reason === "no_audience" || unsubscribeRes.reason === "no_email";
      if (!isNonBlocking) {
        return NextResponse.json(
          {
            error:
              "Impossible de désabonner votre email côté Resend pour le moment. Réessayez plus tard.",
            code: "RESEND_UNSUBSCRIBE_FAILED",
            details: "error" in unsubscribeRes ? unsubscribeRes.error : undefined,
          },
          { status: 502 }
        );
      }
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

