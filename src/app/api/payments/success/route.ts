import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe/client";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserWorkAccess } from "@/lib/queries/access";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    redirect("/scenes");
  }

  try {
    console.log("[SUCCESS] Route success appelée avec session_id:", sessionId);
    const stripe = getStripe();
    // Vérifier que la session est bien complétée
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log("[SUCCESS] Session récupérée - Payment status:", session.payment_status);
    console.log("[SUCCESS] Metadata:", JSON.stringify(session.metadata, null, 2));

    if (session.payment_status === "paid") {
      const userId = session.metadata?.user_id;
      
      // Fonction helper pour nettoyer les valeurs (gère undefined, null, chaînes vides)
      const cleanValue = (value: string | undefined | null): string | undefined => {
        if (value === undefined || value === null) return undefined;
        const trimmed = typeof value === 'string' ? value.trim() : String(value).trim();
        return trimmed !== "" ? trimmed : undefined;
      };
      
      const workId = cleanValue(session.metadata?.work_id);
      const sceneId = cleanValue(session.metadata?.scene_id);

      console.log("[SUCCESS] Paiement confirmé - userId:", userId, "workId:", workId, "sceneId:", sceneId);

      // Vérifier et accorder l'accès si nécessaire (fallback si le webhook n'a pas encore été traité)
      if (userId) {
        const supabase = await createSupabaseServerClient();
        
        // Vérifier si l'accès existe déjà
        const existingAccess = await getUserWorkAccess(userId, workId, sceneId);
        
        if (existingAccess) {
          console.log("[SUCCESS] ✅ Accès déjà existant (probablement accordé par le webhook)");
          console.log("[SUCCESS] Access ID:", existingAccess.id, "Type:", existingAccess.access_type);
        } else {
          console.log("[SUCCESS] ⚠️ Accès non trouvé - accord via route success (fallback)");
          // Accorder l'accès directement (idempotent - le webhook peut aussi le faire)
          // La contrainte de la table exige : (work_id IS NOT NULL AND scene_id IS NULL) OR (work_id IS NULL AND scene_id IS NOT NULL)
          const accessData: any = {
            user_id: userId,
            access_type: "purchased",
            purchase_id: sessionId,
          };

          if (workId) {
            accessData.work_id = workId;
            accessData.scene_id = null;
          } else if (sceneId) {
            accessData.scene_id = sceneId;
            accessData.work_id = null;
          }

          const { data: insertedAccess, error: insertError } = await supabase
            .from("user_work_access")
            .insert(accessData)
            .select()
            .single();

          if (insertError) {
            // Si l'insertion échoue (peut-être que le webhook l'a déjà fait entre temps),
            // on continue quand même - l'accès devrait exister
            console.warn("[SUCCESS] ⚠️ Erreur insertion (peut-être déjà créé par webhook):", insertError);
          } else {
            console.log("[SUCCESS] ✅ Accès accordé via route success");
            console.log("[SUCCESS] Access ID:", insertedAccess?.id);
          }
        }
      } else {
        console.warn("[SUCCESS] ⚠️ Pas de userId dans les metadata");
      }

      // Rediriger vers l'œuvre ou la scène
      const redirectUrl = workId ? `/works/${workId}` : sceneId ? `/scenes/${sceneId}` : "/scenes";
      console.log("[SUCCESS] Redirection vers:", redirectUrl);
      redirect(redirectUrl);
    } else {
      console.warn("[SUCCESS] ⚠️ Payment status n'est pas 'paid':", session.payment_status);
    }

    redirect("/scenes");
  } catch (error) {
    console.error("[SUCCESS] ❌ Erreur lors de la récupération de la session:", error);
    redirect("/scenes");
  }
}




