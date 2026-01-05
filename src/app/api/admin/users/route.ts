import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/utils/admin";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const admin = await isAdmin(user.id);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Pour le MVP, on utilise une approche simple : chercher l'utilisateur par email
    // En production, on pourrait utiliser Supabase Admin API avec service role key
    // Ici, on retourne l'email et on laisse l'API create/scenes gérer la recherche
    // Pour simplifier, on peut aussi créer une fonction RPC dans Supabase
    // Pour l'instant, on retourne juste l'email et on cherchera l'ID côté serveur
    return NextResponse.json({ email, userId: null, note: "Use email to find user" });
  } catch (error: any) {
    console.error("Error in get user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}



