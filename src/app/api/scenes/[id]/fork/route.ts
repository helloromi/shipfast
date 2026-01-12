import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { fetchSceneWithRelations } from "@/lib/queries/scenes";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sourceSceneId } = await params;
  if (!sourceSceneId) {
    return NextResponse.json({ error: "Scene ID is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const source = await fetchSceneWithRelations(sourceSceneId);
  if (!source) {
    return NextResponse.json({ error: "Scene not found" }, { status: 404 });
  }

  // On ne fork pas une scène privée d'un autre utilisateur.
  if (source.is_private) {
    if (source.owner_user_id === user.id) {
      return NextResponse.json({ sceneId: source.id, alreadyOwned: true });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let newSceneId: string | null = null;
  try {
    const { data: createdScene, error: sceneError } = await supabase
      .from("scenes")
      .insert({
        work_id: source.work_id ?? null,
        title: source.title,
        author: source.author ?? null,
        summary: source.summary ?? null,
        chapter: source.chapter ?? null,
        is_private: true,
        owner_user_id: user.id,
      })
      .select("id")
      .single<{ id: string }>();

    if (sceneError || !createdScene) {
      console.error("Error creating forked scene:", sceneError);
      return NextResponse.json({ error: "Failed to fork scene" }, { status: 500 });
    }

    newSceneId = createdScene.id;

    // Créer l'accès privé (best-effort).
    await supabase.from("user_work_access").insert({
      user_id: user.id,
      scene_id: newSceneId,
      access_type: "private",
    });

    const characterIdMap = new Map<string, string>();
    for (const character of source.characters ?? []) {
      const { data: createdCharacter, error: charError } = await supabase
        .from("characters")
        .insert({
          scene_id: newSceneId,
          name: character.name,
        })
        .select("id")
        .single<{ id: string }>();

      if (charError || !createdCharacter) {
        console.error("Error creating forked character:", charError);
        throw new Error("Failed to fork characters");
      }
      characterIdMap.set(character.id, createdCharacter.id);
    }

    const sortedLines = [...(source.lines ?? [])].sort((a, b) => a.order - b.order);
    const linesToInsert = sortedLines.map((line) => {
      const newCharacterId = characterIdMap.get(line.character_id);
      if (!newCharacterId) {
        throw new Error(`Missing character mapping for line.character_id=${line.character_id}`);
      }
      return {
        scene_id: newSceneId,
        character_id: newCharacterId,
        order: line.order,
        text: line.text,
      };
    });

    if (linesToInsert.length > 0) {
      const { error: linesError } = await supabase.from("lines").insert(linesToInsert);
      if (linesError) {
        console.error("Error creating forked lines:", linesError);
        throw new Error("Failed to fork lines");
      }
    }

    return NextResponse.json({ sceneId: newSceneId, success: true });
  } catch (error: any) {
    console.error("Error forking scene:", error);

    // Cleanup best-effort: supprimer la scène forkée (cascade lines/characters).
    if (newSceneId) {
      try {
        await supabase.from("scenes").delete().eq("id", newSceneId);
      } catch {
        // ignore
      }
    }

    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

