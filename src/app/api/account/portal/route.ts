import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getStripeCustomerId, createPortalSession } from "@/lib/stripe/subscriptions";
import { getSiteUrl } from "@/lib/url";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Récupérer le customer Stripe ID
    const customerId = await getStripeCustomerId(user.id);
    if (!customerId) {
      return NextResponse.json(
        { error: "Aucun compte Stripe trouvé. Veuillez d'abord créer un abonnement." },
        { status: 404 }
      );
    }

    const siteUrl = getSiteUrl();
    const returnUrl = `${siteUrl}/account`;

    // Créer la session du Customer Portal
    const portalUrl = await createPortalSession(customerId, returnUrl);

    return NextResponse.json({ url: portalUrl });
  } catch (error: any) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

