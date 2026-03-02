import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/utils/api-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sceneId } = await params;
  if (!sceneId) {
    return NextResponse.json({ error: "Scene ID is required" }, { status: 400 });
  }

  const auth = await requireAuth(request, {
    key: (id) => `scene_share:${id}:${sceneId}`,
    max: 20,
  });
  if (!auth.ok) return auth.response;
  const { user, supabase } = auth;

  let email: string | undefined;
  try {
    const body = await request.json();
    email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Vérifier que l'appelant est bien le propriétaire de la scène privée
  const { data: scene, error: sceneError } = await supabase
    .from("scenes")
    .select("id, is_private, owner_user_id")
    .eq("id", sceneId)
    .maybeSingle<{ id: string; is_private: boolean | null; owner_user_id: string | null }>();

  if (sceneError || !scene) {
    return NextResponse.json({ error: "Scene not found" }, { status: 404 });
  }

  if (!scene.is_private || scene.owner_user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Chercher l'utilisateur par e-mail via le client admin (auth.users n'est pas accessible autrement)
  const admin = createSupabaseAdminClient();
  const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersError) {
    console.error("Error listing users:", usersError);
    // On répond success quand même pour ne pas révéler l'erreur interne
    return NextResponse.json({ success: true });
  }

  const targetUser = usersData?.users?.find(
    (u) => u.email?.toLowerCase() === email
  );

  if (targetUser && targetUser.id !== user.id) {
    // Insérer l'accès partagé — idempotent grâce à l'index unique (user_id, scene_id)
    const { error: insertError } = await admin
      .from("user_work_access")
      .upsert(
        { user_id: targetUser.id, scene_id: sceneId, access_type: "private" },
        { onConflict: "user_id, scene_id", ignoreDuplicates: true }
      );

    if (insertError) {
      console.error("Error inserting share:", insertError);
    } else {
      revalidatePath("/bibliotheque");
    }
  }

  // Dans tous les cas, on confirme à l'expéditeur que l'invitation est lancée
  return NextResponse.json({ success: true });
}
