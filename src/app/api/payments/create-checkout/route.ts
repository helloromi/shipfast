import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { stripe } from "@/lib/stripe/client";
import { countSceneLines } from "@/lib/queries/access";
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

    // Calculer le prix basé sur le nombre de répliques
    let linesCount = 0;
    let title = "";
    let description = "";

    if (sceneId) {
      linesCount = await countSceneLines(sceneId);
      const { data: scene } = await supabase
        .from("scenes")
        .select("title, author")
        .eq("id", sceneId)
        .single();

      if (scene) {
        title = scene.title;
        description = `Scène: ${scene.title}${scene.author ? ` par ${scene.author}` : ""}`;
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

        // Compter toutes les répliques de toutes les scènes de l'œuvre
        const { data: scenes } = await supabase
          .from("scenes")
          .select("id")
          .eq("work_id", workId);

        if (scenes) {
          for (const scene of scenes) {
            const count = await countSceneLines(scene.id);
            linesCount += count;
          }
        }
      }
    }

    // Prix : 1€ par 10 répliques, minimum 2€
    const pricePer10Lines = 1; // en euros
    const minPrice = 2; // minimum 2€
    const priceInCents = Math.max(
      minPrice * 100,
      Math.ceil((linesCount / 10) * pricePer10Lines * 100)
    );

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
              name: title || "Accès à l'œuvre",
              description: description || `Débloquer l'accès (${linesCount} répliques)`,
            },
            unit_amount: priceInCents,
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
        lines_count: linesCount.toString(),
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
