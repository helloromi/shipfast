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

