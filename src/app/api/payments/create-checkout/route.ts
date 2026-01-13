import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getStripe } from "@/lib/stripe/client";
import { getSiteUrl } from "@/lib/url";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const workId = isRecord(body) && typeof body.workId === "string" ? body.workId : null;
    const sceneId = isRecord(body) && typeof body.sceneId === "string" ? body.sceneId : null;

    if (!workId && !sceneId) {
      return NextResponse.json(
        { error: "workId or sceneId is required" },
        { status: 400 }
      );
    }

    // On ne peut pas avoir les deux en même temps
    if (workId && sceneId) {
      return NextResponse.json(
        { error: "Cannot specify both workId and sceneId" },
        { status: 400 }
      );
    }

    // Prix fixe par scène : 2€
    const PRICE_PER_SCENE_EUROS = 2;
    const priceInCents = PRICE_PER_SCENE_EUROS * 100;

    let title = "";
    let description = "";
    let scenesCount = 0;

    if (sceneId) {
      const { data: scene } = await supabase
        .from("scenes")
        .select("title, author")
        .eq("id", sceneId)
        .single();

      if (scene) {
        title = scene.title;
        description = `Scène: ${scene.title}${scene.author ? ` par ${scene.author}` : ""}`;
        scenesCount = 1;
      }
    } else if (workId) {
      const { data: work } = await supabase
        .from("works")
        .select("title, author")
        .eq("id", workId)
        .single();

      if (work) {
        title = work.title;
        description = `Œuvre: ${work.title}${work.author ? ` par ${work.author}` : ""}`;

        // Compter toutes les scènes de l'œuvre
        const { count } = await supabase
          .from("scenes")
          .select("*", { count: "exact", head: true })
          .eq("work_id", workId);

        scenesCount = count ?? 0;
      }
    }

    // Calculer le prix total : 2€ par scène
    const totalPriceInCents = scenesCount * priceInCents;

    if (scenesCount === 0) {
      return NextResponse.json(
        { error: "No scenes found" },
        { status: 400 }
      );
    }

    const siteUrl = getSiteUrl();
    const successUrl = `${siteUrl}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/scenes`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: title || "Accès à la scène",
              description: description || (sceneId ? "Débloquer l'accès à cette scène" : `Débloquer l'accès à cette œuvre (${scenesCount} scène${scenesCount > 1 ? "s" : ""})`),
            },
            unit_amount: totalPriceInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: user.id,
        // Ne pas envoyer de chaîne vide, seulement la valeur si elle existe
        ...(workId && { work_id: workId }),
        ...(sceneId && { scene_id: sceneId }),
        scenes_count: scenesCount.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


