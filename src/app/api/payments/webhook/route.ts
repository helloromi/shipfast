import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
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
      // Utiliser le client admin pour contourner RLS (le webhook n'a pas de session utilisateur)
      const supabase = createSupabaseAdminClient();
      const userId = session.metadata?.user_id;
      
      // Les metadata Stripe peuvent contenir des chaînes vides "" ou être absentes
      // On récupère les valeurs brutes d'abord pour le debug
      const rawWorkId = session.metadata?.work_id;
      const rawSceneId = session.metadata?.scene_id;
      
      console.log("[WEBHOOK] Metadata brutes - work_id:", rawWorkId, "(type:", typeof rawWorkId, ")", "scene_id:", rawSceneId, "(type:", typeof rawSceneId, ")");
      
      // Fonction helper pour nettoyer les valeurs (gère undefined, null, chaînes vides)
      const cleanValue = (value: string | undefined | null): string | undefined => {
        if (value === undefined || value === null) return undefined;
        const trimmed = typeof value === 'string' ? value.trim() : String(value).trim();
        return trimmed !== "" ? trimmed : undefined;
      };
      
      const workId = cleanValue(rawWorkId);
      const sceneId = cleanValue(rawSceneId);

      console.log("[WEBHOOK] Données nettoyées - userId:", userId, "workId:", workId, "sceneId:", sceneId);

      if (!userId) {
        console.error("[WEBHOOK] ERREUR: Pas de user_id dans les metadata");
        return NextResponse.json({ error: "No user_id" }, { status: 400 });
      }

      // Vérifier qu'on a soit workId soit sceneId, mais pas les deux ni aucun
      if (!workId && !sceneId) {
        console.error("[WEBHOOK] ERREUR: Ni work_id ni scene_id valides dans les metadata");
        console.error("[WEBHOOK] Raw values - work_id:", rawWorkId, "scene_id:", rawSceneId);
        return NextResponse.json({ error: "work_id or scene_id required" }, { status: 400 });
      }

      if (workId && sceneId) {
        console.error("[WEBHOOK] ERREUR: work_id et scene_id sont tous les deux présents après nettoyage");
        console.error("[WEBHOOK] work_id:", workId, "scene_id:", sceneId);
        console.error("[WEBHOOK] Raw values - work_id:", rawWorkId, "scene_id:", rawSceneId);
        return NextResponse.json({ error: "Cannot have both work_id and scene_id" }, { status: 400 });
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
      // La contrainte de la table exige : (work_id IS NOT NULL AND scene_id IS NULL) OR (work_id IS NULL AND scene_id IS NOT NULL)
      const accessData: any = {
        user_id: userId,
        access_type: "purchased",
        purchase_id: session.id,
      };

      if (workId) {
        accessData.work_id = workId;
        // S'assurer que scene_id est bien null/undefined
        accessData.scene_id = null;
      } else if (sceneId) {
        accessData.scene_id = sceneId;
        // S'assurer que work_id est bien null/undefined
        accessData.work_id = null;
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




