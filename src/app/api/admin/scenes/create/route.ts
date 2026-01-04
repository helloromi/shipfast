import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { isAdmin } from "@/lib/utils/admin";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      ownerUserId,
      ownerEmail,
      title,
      author,
      summary,
      chapter,
      characters,
      lines,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    // Si on a un email mais pas d'ID, chercher l'utilisateur
    let finalOwnerUserId = ownerUserId;
    if (!finalOwnerUserId && ownerEmail) {
      try {
        const adminClient = createSupabaseAdminClient();
        const { data: allUsers, error: listError } = await adminClient.auth.admin.listUsers();
        
        if (listError) {
          console.error("Error listing users:", listError);
          return NextResponse.json(
            { error: "Failed to search users" },
            { status: 500 }
          );
        }
        
        const foundUser = allUsers?.users.find((u) => u.email === ownerEmail);
        if (!foundUser) {
          return NextResponse.json(
            { error: "User not found with this email" },
            { status: 404 }
          );
        }
        finalOwnerUserId = foundUser.id;
      } catch (error: any) {
        console.error("Error in admin client:", error);
        return NextResponse.json(
          { error: "Admin access not configured. Please provide userId directly." },
          { status: 500 }
        );
      }
    }

    if (!finalOwnerUserId) {
      return NextResponse.json(
        { error: "ownerUserId or ownerEmail is required" },
        { status: 400 }
      );
    }

    // Créer la scène privée
    const { data: scene, error: sceneError } = await supabase
      .from("scenes")
      .insert({
        title,
        author: author || null,
        summary: summary || null,
        chapter: chapter || null,
        is_private: true,
        owner_user_id: finalOwnerUserId,
      })
      .select()
      .single();

    if (sceneError || !scene) {
      console.error("Error creating scene:", sceneError);
      return NextResponse.json(
        { error: "Failed to create scene" },
        { status: 500 }
      );
    }

    const sceneId = scene.id;

    // Créer les personnages
    if (characters && Array.isArray(characters) && characters.length > 0) {
      const charactersToInsert = characters.map((char: { name: string }) => ({
        scene_id: sceneId,
        name: char.name,
      }));

      const { error: charsError } = await supabase
        .from("characters")
        .insert(charactersToInsert);

      if (charsError) {
        console.error("Error creating characters:", charsError);
        // Continuer même si les personnages échouent
      }
    }

    // Récupérer les personnages pour mapper les répliques
    const { data: sceneCharacters } = await supabase
      .from("characters")
      .select("id, name")
      .eq("scene_id", sceneId);

    const characterMap = new Map(
      sceneCharacters?.map((c) => [c.name, c.id]) || []
    );

    // Créer les répliques
    if (lines && Array.isArray(lines) && lines.length > 0) {
      const linesToInsert = lines
        .map((line: { characterName: string; text: string; order: number }) => {
          const characterId = characterMap.get(line.characterName);
          if (!characterId) return null;

          return {
            scene_id: sceneId,
            character_id: characterId,
            text: line.text,
            order: line.order,
          };
        })
        .filter((l: any) => l !== null);

      if (linesToInsert.length > 0) {
        const { error: linesError } = await supabase
          .from("lines")
          .insert(linesToInsert);

        if (linesError) {
          console.error("Error creating lines:", linesError);
          // Continuer même si les répliques échouent
        }
      }
    }

    // Créer l'entrée dans user_work_access
    const { error: accessError } = await supabase
      .from("user_work_access")
      .insert({
        user_id: finalOwnerUserId,
        scene_id: sceneId,
        access_type: "private",
      });

    if (accessError) {
      console.error("Error creating access:", accessError);
      // Continuer même si l'accès échoue
    }

    return NextResponse.json({ sceneId, success: true });
  } catch (error: any) {
    console.error("Error in create scene:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


