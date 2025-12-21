import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
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

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = getWebhookSecret();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Gérer l'événement checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const supabase = await createSupabaseServerClient();
      const userId = session.metadata?.user_id;
      const workId = session.metadata?.work_id;
      const sceneId = session.metadata?.scene_id;

      if (!userId) {
        console.error("No user_id in session metadata");
        return NextResponse.json({ error: "No user_id" }, { status: 400 });
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

      const { error: insertError } = await supabase
        .from("user_work_access")
        .insert(accessData);

      if (insertError) {
        console.error("Error inserting access:", insertError);
        return NextResponse.json(
          { error: "Failed to grant access" },
          { status: 500 }
        );
      }

      console.log(`Access granted for user ${userId}, work: ${workId}, scene: ${sceneId}`);
    } catch (error: any) {
      console.error("Error processing webhook:", error);
      return NextResponse.json(
        { error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
