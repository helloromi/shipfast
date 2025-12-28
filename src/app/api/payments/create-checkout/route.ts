import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe/client";
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

    const body = await request.json();
    const { workId, sceneId } = body;

    if (!workId && !sceneId) {
      return NextResponse.json(
        { error: "workId or sceneId is required" },
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
        work_id: workId || "",
        scene_id: sceneId || "",
        scenes_count: scenesCount.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


