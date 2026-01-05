import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import Stripe from "stripe";

function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  }
  return secret;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  // Log de réception du webhook
  console.log("[WEBHOOK] Webhook reçu à", new Date().toISOString());
  console.log("[WEBHOOK] Signature présente:", !!signature);

  if (!signature) {
    console.error("[WEBHOOK] ERREUR: Pas de signature Stripe");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = getWebhookSecret();
  let event: Stripe.Event;
  const stripe = getStripe();

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log("[WEBHOOK] Événement vérifié avec succès:", event.type, "ID:", event.id);
  } catch (err: any) {
    console.error("[WEBHOOK] ERREUR: Échec de vérification de signature:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Logger tous les événements reçus (pour debug)
  console.log(`[WEBHOOK] Événement reçu: ${event.type} (ID: ${event.id})`);

  // Gérer l'événement checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("[WEBHOOK] Traitement de checkout.session.completed");
    console.log("[WEBHOOK] Session ID:", session.id);
    console.log("[WEBHOOK] Payment status:", session.payment_status);
    console.log("[WEBHOOK] Metadata:", JSON.stringify(session.metadata, null, 2));

    try {
      const supabase = await createSupabaseServerClient();
      const userId = session.metadata?.user_id;
      const workId = session.metadata?.work_id;
      const sceneId = session.metadata?.scene_id;

      console.log("[WEBHOOK] Données extraites - userId:", userId, "workId:", workId, "sceneId:", sceneId);

      if (!userId) {
        console.error("[WEBHOOK] ERREUR: Pas de user_id dans les metadata");
        return NextResponse.json({ error: "No user_id" }, { status: 400 });
      }

      // Vérifier si l'accès existe déjà (idempotence)
      const { data: existingAccess } = await supabase
        .from("user_work_access")
        .select("id")
        .eq("user_id", userId)
        .eq("purchase_id", session.id)
        .maybeSingle();

      if (existingAccess) {
        console.log("[WEBHOOK] Accès déjà existant pour cette session, ignoré (idempotence)");
        return NextResponse.json({ received: true, message: "Access already granted" });
      }

      // Créer l'entrée dans user_work_access
      const accessData: any = {
        user_id: userId,
        access_type: "purchased",
        purchase_id: session.id,
      };

      if (workId) {
        accessData.work_id = workId;
      }
      if (sceneId) {
        accessData.scene_id = sceneId;
      }

      console.log("[WEBHOOK] Insertion de l'accès:", JSON.stringify(accessData, null, 2));

      const { data: insertedAccess, error: insertError } = await supabase
        .from("user_work_access")
        .insert(accessData)
        .select()
        .single();

      if (insertError) {
        console.error("[WEBHOOK] ERREUR lors de l'insertion:", insertError);
        return NextResponse.json(
          { error: "Failed to grant access" },
          { status: 500 }
        );
      }

      console.log("[WEBHOOK] ✅ Accès accordé avec succès!");
      console.log("[WEBHOOK] Access ID:", insertedAccess?.id);
      console.log("[WEBHOOK] User:", userId, "Work:", workId || "N/A", "Scene:", sceneId || "N/A");
    } catch (error: any) {
      console.error("[WEBHOOK] ERREUR lors du traitement:", error);
      console.error("[WEBHOOK] Stack:", error.stack);
      return NextResponse.json(
        { error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  } else {
    console.log(`[WEBHOOK] Événement non géré: ${event.type} (ignoré)`);
  }

  return NextResponse.json({ received: true });
}




