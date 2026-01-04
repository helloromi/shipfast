"use client";

import { useState, useEffect } from "react";
import { t } from "@/locales/fr";

type Line = {
  id: string;
  order: number;
  text: string;
};

type LineRangeSelectorProps = {
  sceneId: string;
  sceneTitle: string;
  onClose: () => void;
  onValidate: (start: number, end: number) => void;
};

export function LineRangeSelector({
  sceneId,
  sceneTitle,
  onClose,
  onValidate,
}: LineRangeSelectorProps) {
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [startLine, setStartLine] = useState<number>(1);
  const [endLine, setEndLine] = useState<number>(1);

  useEffect(() => {
    const loadLines = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/scenes/${sceneId}/lines`);
        if (response.ok) {
          const data = await response.json();
          const sortedLines = [...data.lines].sort((a: Line, b: Line) => a.order - b.order);
          setLines(sortedLines);
          if (sortedLines.length > 0) {
            const minOrder = Math.min(...sortedLines.map((l) => l.order));
            const maxOrder = Math.max(...sortedLines.map((l) => l.order));
            setStartLine(minOrder);
            setEndLine(maxOrder);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadLines();
  }, [sceneId]);

  const handleValidate = () => {
    if (startLine <= endLine && startLine >= 1 && endLine <= lines.length) {
      onValidate(startLine, endLine);
    }
  };

  const selectedLines = lines.filter(
    (line) => line.order >= startLine && line.order <= endLine
  );

  const minOrder = lines.length > 0 ? Math.min(...lines.map((l) => l.order)) : 1;
  const maxOrder = lines.length > 0 ? Math.max(...lines.map((l) => l.order)) : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#e7e1d9] bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-[#1c1b1f]">
                {t.scenes.works.range.title}
              </h3>
              <p className="text-sm text-[#524b5a]">{sceneTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#7a7184] transition hover:bg-[#e7e1d9]"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>

          <p className="text-sm text-[#524b5a]">{t.scenes.works.range.description}</p>

          {loading ? (
            <div className="text-sm text-[#524b5a]">Chargement des répliques...</div>
          ) : lines.length === 0 ? (
            <div className="text-sm text-[#524b5a]">Aucune réplique dans cette scène.</div>
          ) : (
            <>
              <div className="flex flex-col gap-4 rounded-xl border border-[#e7e1d9] bg-[#f9f7f3] p-4">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                      {t.scenes.works.range.from}
                    </label>
                    <input
                      type="number"
                      min={minOrder}
                      max={maxOrder}
                      value={startLine}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setStartLine(Math.max(minOrder, Math.min(val, maxOrder)));
                        }
                      }}
                      className="w-20 rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] focus:border-[#3b1f4a]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                      {t.scenes.works.range.to}
                    </label>
                    <input
                      type="number"
                      min={minOrder}
                      max={maxOrder}
                      value={endLine}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setEndLine(Math.max(minOrder, Math.min(val, maxOrder)));
                        }
                      }}
                      className="w-20 rounded-xl border border-[#e7e1d9] bg-white px-3 py-2 text-sm text-[#1c1b1f] focus:border-[#3b1f4a]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                      {t.scenes.works.range.total}
                    </label>
                    <div className="flex h-10 items-center rounded-xl border border-[#e7e1d9] bg-white px-3 text-sm font-semibold text-[#1c1b1f]">
                      {lines.length}
                    </div>
                  </div>
                </div>

                <div className="text-xs font-semibold text-[#3b1f4a]">
                  {selectedLines.length} {t.scenes.works.range.selected}
                </div>
              </div>

              {selectedLines.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-semibold text-[#3b1f4a]">
                    {t.scenes.works.range.preview}
                  </h4>
                  <div className="max-h-60 overflow-y-auto rounded-xl border border-[#e7e1d9] bg-white/92 p-4">
                    <div className="flex flex-col gap-2">
                      {selectedLines.map((line, idx) => (
                        <div
                          key={line.id}
                          className="flex flex-col gap-1 rounded-lg border border-transparent px-2 py-1 hover:border-[#e7e1d9]"
                        >
                          <div className="text-xs font-semibold text-[#7a7184]">
                            Réplique {line.order}
                          </div>
                          <p className="text-sm text-[#1c1b1f]">{line.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] transition hover:border-[#3b1f4a33]"
                >
                  {t.scenes.works.range.annuler}
                </button>
                <button
                  onClick={handleValidate}
                  disabled={startLine > endLine || startLine < minOrder || endLine > maxOrder}
                  className="flex-1 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] transition hover:-translate-y-[1px] disabled:opacity-50"
                >
                  {t.scenes.works.range.valider}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}



