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
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-xs text-[#7a7184] transition hover:text-[#3b1f4a]"
        aria-expanded={isOpen}
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <span className="text-[10px] font-medium">
          {hasNote ? t.scenes.detail.notes.ajoutee : t.scenes.detail.notes.notePerso}
        </span>
        {isOpen && <span className="text-[10px]">▼</span>}
      </button>
      {isOpen && (
        <div className="mt-2">
          <textarea
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] shadow-inner focus:border-[#3b1f4a]"
            placeholder={t.scenes.detail.notes.placeholder}
          />
        </div>
      )}
    </div>
  );
}
