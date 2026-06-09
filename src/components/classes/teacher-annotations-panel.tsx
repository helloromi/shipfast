import { t } from "@/locales/fr";
import type { ClassAnnotation } from "@/types/teacher";

type LineView = {
  id: string;
  text: string;
  characterName: string | null;
};

type Props = {
  annotations: ClassAnnotation[];
  lines: LineView[];
};

/**
 * Notes du professeur visibles par l'élève sur la page d'une scène.
 * Rendu serveur, lecture seule.
 */
export function TeacherAnnotationsPanel({ annotations, lines }: Props) {
  if (annotations.length === 0) return null;

  const sceneNotes = annotations.filter((a) => a.line_id === null);
  const lineNotes = annotations.filter((a) => a.line_id !== null);
  const lineById = new Map(lines.map((l) => [l.id, l]));

  return (
    <section className="rounded-2xl border-l-4 border-[#f4c95d] bg-[#fdf8ec] p-5">
      <h2 className="font-display text-lg font-semibold text-[#3b1f4a]">
        🎬 {t.teacher.student.teacherNotes}
      </h2>
      {sceneNotes.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {sceneNotes.map((a) => (
            <li key={a.id} className="whitespace-pre-wrap text-sm leading-relaxed text-[#211a26]">
              {a.content}
            </li>
          ))}
        </ul>
      )}
      {lineNotes.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {lineNotes.map((a) => {
            const line = a.line_id ? lineById.get(a.line_id) : null;
            if (!line) return null;
            return (
              <li key={a.id} className="rounded-xl bg-white/80 px-3 py-2">
                <p className="text-xs text-[#8a8093]">
                  <span className="font-bold uppercase tracking-wide">{line.characterName ?? "—"}</span>{" "}
                  · « {line.text.length > 90 ? `${line.text.slice(0, 90)}…` : line.text} »
                </p>
                <p className="mt-1 text-sm font-medium text-[#211a26]">→ {a.content}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
