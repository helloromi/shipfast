import { NextRequest, NextResponse } from "next/server";
import type { ParsedScene } from "@/lib/utils/text-parser";
import { requireAuth } from "@/lib/utils/api-auth";

export const runtime = "nodejs";

type CommitBody = {
  draft: ParsedScene; // Le draft modifié par l'utilisateur
  jobId?: string; // Optionnel : ID du job à mettre à jour
};

type DbCharacter = { id: string; name: string };
type DbLineInsert = { scene_id: string; character_id: string; text: string; order: number };

function uniqStrings(values: string[]) {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)));
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request, { key: (id) => `import_commit:${id}`, max: 20 });
    if (!auth.ok) return auth.response;
    const { user, supabase } = auth;

    const body = (await request.json()) as CommitBody;
    const draft = body?.draft;
    const jobId = body?.jobId;

    if (!draft || !Array.isArray(draft.lines) || draft.lines.length === 0) {
      return NextResponse.json({ error: "Draft invalide" }, { status: 400 });
    }

    // Utiliser toutes les lignes du draft (déjà filtrées et modifiées par l'utilisateur)
    const keptLines = draft.lines
      .map((l) => ({
        characterName: (l.characterName || "").trim(),
        text: (l.text || "").trim(),
      }))
      .filter((l) => l.characterName && l.text);

    if (keptLines.length === 0) {
      return NextResponse.json({ error: "Aucune réplique valide" }, { status: 400 });
    }

    const title = (draft.title || "").trim() || "Scène importée";
    const author = draft.author ? String(draft.author).trim() : null;

    // 1) Créer la scène privée
    const { data: scene, error: sceneError } = await supabase
      .from("scenes")
      .insert({
        title,
        author,
        summary: null,
        chapter: null,
        is_private: true,
        owner_user_id: user.id,
      })
      .select()
      .single();

    if (sceneError || !scene) {
      return NextResponse.json(
        { error: "Erreur lors de la création de la scène", details: sceneError?.message },
        { status: 500 }
      );
    }

    const sceneId = scene.id as string;

    // 2) Créer les personnages (uniques) à partir des lignes conservées
    const characterNames = uniqStrings(keptLines.map((l) => l.characterName));
    if (characterNames.length > 0) {
      const { error: charsError } = await supabase.from("characters").insert(
        characterNames.map((name) => ({
          scene_id: sceneId,
          name,
        }))
      );
      if (charsError) {
        return NextResponse.json(
          { error: "Erreur lors de la création des personnages", details: charsError.message },
          { status: 500 }
        );
      }
    }

    const { data: sceneCharacters, error: sceneCharsError } = await supabase
      .from("characters")
      .select("id, name")
      .eq("scene_id", sceneId)
      .returns<DbCharacter[]>();
    if (sceneCharsError) {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des personnages", details: sceneCharsError.message },
        { status: 500 }
      );
    }

    const characterMap = new Map<string, string>((sceneCharacters || []).map((c) => [c.name, c.id]));

    // 3) Créer les répliques (ré-ordonnées)
    const linesToInsert = keptLines
      .map((l, idx) => {
        const characterId = characterMap.get(l.characterName);
        if (!characterId) return null;
        const row: DbLineInsert = {
          scene_id: sceneId,
          character_id: characterId,
          text: l.text,
          order: idx + 1,
        };
        return row;
      })
      .filter((x): x is DbLineInsert => Boolean(x));

    if (linesToInsert.length > 0) {
      const { error: linesError } = await supabase.from("lines").insert(linesToInsert);
      if (linesError) {
        return NextResponse.json(
          { error: "Erreur lors de la création des répliques", details: linesError.message },
          { status: 500 }
        );
      }
    }

    // 4) Accès privé
    const { error: accessError } = await supabase.from("user_work_access").insert({
      user_id: user.id,
      scene_id: sceneId,
      access_type: "private",
    });
    if (accessError) {
      // non bloquant
      console.warn("[ImportCommit] user_work_access insert failed:", accessError);
    }

    // 5) Mettre à jour le job si jobId est fourni
    if (jobId) {
      await supabase
        .from("import_jobs")
        .update({
          status: "completed",
          scene_id: sceneId,
        })
        .eq("id", jobId)
        .eq("user_id", user.id);
    }

    return NextResponse.json({ success: true, sceneId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: "Erreur interne du serveur", details: message },
      { status: 500 }
    );
  }
}




