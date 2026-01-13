"use client";

import { useState, useRef, useEffect } from "react";
import { useSupabase } from "@/components/supabase-provider";
import { t } from "@/locales/fr";

type LineNoteEditorProps = {
  lineId: string;
  userId: string;
  initialNote: string;
};

export function LineNoteEditor({ lineId, userId, initialNote }: LineNoteEditorProps) {
  const { supabase } = useSupabase();
  const [note, setNote] = useState(initialNote);
  const [isOpen, setIsOpen] = useState(false);
  const noteSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchroniser avec les changements externes
  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  // Nettoyer le timer lors du démontage
  useEffect(() => {
    return () => {
      if (noteSaveTimer.current) {
        clearTimeout(noteSaveTimer.current);
      }
    };
  }, []);

  const schedulePersistNote = (noteRaw: string) => {
    if (noteSaveTimer.current) {
      clearTimeout(noteSaveTimer.current);
    }

    noteSaveTimer.current = setTimeout(async () => {
      const noteTrimmed = (noteRaw ?? "").trim();
      try {
        if (noteTrimmed.length === 0) {
          const { error } = await supabase
            .from("user_line_notes")
            .delete()
            .eq("user_id", userId)
            .eq("line_id", lineId);
          if (error) {
            console.error("Error deleting note:", error);
          }
        } else {
          const { error } = await supabase
            .from("user_line_notes")
            .upsert({ user_id: userId, line_id: lineId, note: noteTrimmed }, { onConflict: "user_id,line_id" });
          if (error) {
            console.error("Error saving note:", error);
          }
        }
      } catch (err) {
        console.error("Error persisting note:", err);
      }
    }, 450);
  };

  const handleNoteChange = (value: string) => {
    setNote(value);
    schedulePersistNote(value);
  };

  const hasNote = note.trim().length > 0;

  return (
    <div className="mt-2 rounded-xl border border-[#e7e1d9] bg-[#f9f7f3] p-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-[#3b1f4a] transition hover:bg-white/60"
        aria-expanded={isOpen}
      >
        <span>{t.scenes.detail.notes.notePerso}</span>
        <span className="text-xs font-semibold text-[#7a7184]">
          {hasNote ? t.scenes.detail.notes.ajoutee : t.scenes.detail.notes.aucune}
          <span className="ml-2">{isOpen ? "▲" : "▼"}</span>
        </span>
      </button>
      {isOpen && (
        <div className="mt-2">
          <textarea
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
            placeholder={t.scenes.detail.notes.placeholder}
          />
        </div>
      )}
    </div>
  );
}
