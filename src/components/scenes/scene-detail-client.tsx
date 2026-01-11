"use client";

import { useState } from "react";
import Link from "next/link";
import { StartLineSelector } from "./start-line-selector";
import { t } from "@/locales/fr";

type Character = {
  id: string;
  name: string;
};

type SceneDetailClientProps = {
  sceneId: string;
  sceneTitle: string;
  characters: Character[];
  lastCharacterId?: string | null;
  lastCharacterName?: string | null;
};

export function SceneDetailClient({
  sceneId,
  sceneTitle,
  characters,
  lastCharacterId,
  lastCharacterName,
}: SceneDetailClientProps) {
  const [startLine, setStartLine] = useState<number | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);

  const handleStartLineSelect = (selectedStartLine: number) => {
    setStartLine(selectedStartLine);
    setSelectorOpen(false);
  };

  const handleRemoveStartLine = () => {
    setStartLine(null);
  };

  const buildLearnUrl = (characterId: string) => {
    const baseUrl = `/learn/${sceneId}?character=${characterId}`;
    if (startLine !== null) {
      return `${baseUrl}&startLine=${startLine}`;
    }
    return baseUrl;
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
            {t.scenes.detail.personnages.title}
          </h2>
          <button
            onClick={() => setSelectorOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[#e7e1d9] bg-white px-3 py-1.5 text-xs font-semibold text-[#3b1f4a] shadow-sm transition hover:-translate-y-[1px] hover:border-[#3b1f4a66]"
          >
            {startLine !== null
              ? t.scenes.detail.startLine.modifier
              : t.scenes.detail.startLine.choisir}
          </button>
        </div>

        {startLine !== null && (
          <div className="flex items-center justify-between rounded-xl border border-[#e7e1d9] bg-[#f9f7f3] px-4 py-2">
            <span className="text-sm font-semibold text-[#3b1f4a]">
              {t.scenes.detail.startLine.selectionnee.replace("{order}", startLine.toString())}
            </span>
            <button
              onClick={handleRemoveStartLine}
              className="text-xs font-semibold text-[#7a7184] underline transition hover:text-[#3b1f4a]"
            >
              {t.scenes.detail.startLine.supprimer}
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {lastCharacterId ? (
            <>
              <Link
                href={buildLearnUrl(lastCharacterId)}
                className="inline-flex items-center gap-2 rounded-full bg-[#ff6b6b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:bg-[#e75a5a]"
              >
                {t.scenes.detail.personnages.continuerEn} {lastCharacterName ?? t.scenes.detail.personnages.monRole}
              </Link>
              <div className="w-full text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                {t.scenes.detail.personnages.ouChoisirAutre}
              </div>
            </>
          ) : null}
          {characters.map((character) => (
            <Link
              key={character.id}
              href={buildLearnUrl(character.id)}
              className="inline-flex items-center gap-2 rounded-full border border-[#e7e1d9] bg-white px-4 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm transition hover:-translate-y-[1px] hover:border-[#3b1f4a66]"
            >
              {character.name}
              <span className="text-xs font-medium text-[#7a7184]">
                {lastCharacterId === character.id
                  ? t.scenes.detail.personnages.dejaChoisi
                  : t.scenes.detail.personnages.choisirCeRole}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {selectorOpen && (
        <StartLineSelector
          sceneId={sceneId}
          sceneTitle={sceneTitle}
          onClose={() => setSelectorOpen(false)}
          onValidate={handleStartLineSelect}
          currentStartLine={startLine}
        />
      )}
    </>
  );
}

