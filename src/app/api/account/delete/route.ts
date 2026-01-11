import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { hasActiveSubscriptions } from "@/lib/queries/subscriptions";

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier qu'il n'y a pas d'abonnements actifs
    const hasActive = await hasActiveSubscriptions(user.id);
    if (hasActive) {
      return NextResponse.json(
        {
          error: "Impossible de supprimer le compte. Veuillez d'abord annuler tous vos abonnements actifs.",
        },
        { status: 400 }
      );
    }

    // Utiliser le client admin pour supprimer toutes les données
    const adminSupabase = createSupabaseAdminClient();

    // Les données suivantes seront supprimées automatiquement grâce aux contraintes CASCADE :
    // - user_line_feedback (on delete cascade)
    // - user_learning_sessions (on delete cascade)
    // - user_work_access (on delete cascade)
    // - user_subscriptions (on delete cascade)
    // - user_stripe_customers (on delete cascade)

    // Supprimer le compte utilisateur via l'API admin de Supabase
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return NextResponse.json(
        { error: "Erreur lors de la suppression du compte" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Compte supprimé avec succès" });
  } catch (error: any) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
