import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe/client";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    redirect("/scenes");
  }

  try {
    const stripe = getStripe();
    // Vérifier que la session est bien complétée
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const workId = session.metadata?.work_id;
      const sceneId = session.metadata?.scene_id;

      // Rediriger vers l'œuvre ou la scène
      if (workId) {
        redirect(`/works/${workId}`);
      } else if (sceneId) {
        redirect(`/scenes/${sceneId}`);
      }
    }

    redirect("/scenes");
  } catch (error) {
    console.error("Error retrieving session:", error);
    redirect("/scenes");
  }
}




