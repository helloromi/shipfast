import { createSupabaseServerClient } from "@/lib/supabase-server";

export type NotesByLineId = Record<string, string>;

export async function fetchUserLineNotes(userId: string, lineIds: string[]): Promise<NotesByLineId> {
  if (!userId) return {};
  if (!Array.isArray(lineIds) || lineIds.length === 0) return {};

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_line_notes")
    .select("line_id, note")
    .eq("user_id", userId)
    .in("line_id", lineIds)
    .returns<{ line_id: string; note: string }[]>();

  if (error) {
    console.error("Error fetching user_line_notes:", error);
    return {};
  }

  const out: NotesByLineId = {};
  for (const row of data ?? []) {
    if (row?.line_id) out[row.line_id] = row.note ?? "";
  }
  return out;
}

export type UserLineHighlight = {
  lineId: string;
  startOffset: number;
  endOffset: number;
  selectedText: string;
  noteFree: string | null;
  noteSubtext: string | null;
  noteIntonation: string | null;
  notePlay: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HighlightsByLineId = Record<string, UserLineHighlight[]>;

export async function fetchUserLineHighlights(userId: string, lineIds: string[]): Promise<HighlightsByLineId> {
  if (!userId) return {};
  if (!Array.isArray(lineIds) || lineIds.length === 0) return {};

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_line_highlights")
    .select(
      "line_id, start_offset, end_offset, selected_text, note_free, note_subtext, note_intonation, note_play, created_at, updated_at"
    )
    .eq("user_id", userId)
    .in("line_id", lineIds)
    .returns<
      {
        line_id: string;
        start_offset: number;
        end_offset: number;
        selected_text: string;
        note_free: string | null;
        note_subtext: string | null;
        note_intonation: string | null;
        note_play: string | null;
        created_at: string;
        updated_at: string;
      }[]
    >();

  if (error) {
    console.error("Error fetching user_line_highlights:", error);
    return {};
  }

  const out: HighlightsByLineId = {};
  for (const row of data ?? []) {
    if (!row?.line_id) continue;
    const list = (out[row.line_id] ??= []);
    list.push({
      lineId: row.line_id,
      startOffset: row.start_offset,
      endOffset: row.end_offset,
      selectedText: row.selected_text ?? "",
      noteFree: row.note_free ?? null,
      noteSubtext: row.note_subtext ?? null,
      noteIntonation: row.note_intonation ?? null,
      notePlay: row.note_play ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  for (const lineId of Object.keys(out)) {
    out[lineId] = out[lineId]!.sort((a, b) => a.startOffset - b.startOffset || a.endOffset - b.endOffset);
  }

  return out;
}

