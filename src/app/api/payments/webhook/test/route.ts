import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/utils/admin";

/**
 * Endpoint de test pour vérifier la configuration du webhook Stripe
 * GET /api/payments/webhook/test
 * 
 * ⚠️ PROTÉGÉ: Accessible uniquement aux administrateurs
 */
export async function GET(_request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await isAdmin(user.id);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Toucher le client Stripe suffit à valider la configuration.
    void getStripe();

    // Vérifier que la clé Stripe est configurée
    const hasStripeKey = !!process.env.STRIPE_SECRET_KEY;
    const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET;
    
    // Récupérer l'URL du site pour construire l'URL du webhook
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";
    
    const webhookUrl = `${siteUrl}/api/payments/webhook`;
    
    // Informations de configuration
    const config = {
      stripeConfigured: hasStripeKey,
      webhookSecretConfigured: hasWebhookSecret,
      webhookUrl: webhookUrl,
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    };
    
    // Instructions pour configurer le webhook dans Stripe
    const instructions = {
      step1: "Allez dans votre dashboard Stripe → Developers → Webhooks",
      step2: "Cliquez sur 'Add endpoint'",
      step3: `Entrez l'URL: ${webhookUrl}`,
      step4: "Sélectionnez les événements: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted",
      step5: "Copiez le 'Signing secret' et ajoutez-le à STRIPE_WEBHOOK_SECRET",
    };
    
    return NextResponse.json({
      status: "ok",
      config,
      instructions,
      message: hasStripeKey && hasWebhookSecret 
        ? "Configuration détectée. Vérifiez que le webhook est bien configuré dans Stripe Dashboard."
        : "Configuration incomplète. Vérifiez vos variables d'environnement.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        status: "error", 
        error: message,
        message: "Erreur lors de la vérification de la configuration"
      },
      { status: 500 }
    );
  }
}

