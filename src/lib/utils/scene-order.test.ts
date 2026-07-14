import { describe, expect, it } from "vitest";

import {
  compareScenesDramaturgical,
  parseActNumber,
  parseSceneNumber,
  sortScenesDramaturgical,
} from "./scene-order";

describe("parseActNumber", () => {
  it("lit l'acte en chiffres romains depuis chapter", () => {
    expect(parseActNumber({ chapter: "Acte I", title: "Acte I, Scène II" })).toBe(1);
    expect(parseActNumber({ chapter: "Acte V", title: "Acte V, Scène VI" })).toBe(5);
  });

  it("se rabat sur le titre si chapter est absent", () => {
    expect(parseActNumber({ chapter: null, title: "Acte IV, scène 5" })).toBe(4);
  });
});

describe("parseSceneNumber", () => {
  it("gère les chiffres romains", () => {
    expect(parseSceneNumber({ title: "Acte II, Scène VI" })).toBe(6);
    expect(parseSceneNumber({ title: "Acte V, Scène VII" })).toBe(7);
  });

  it("gère les chiffres arabes", () => {
    expect(parseSceneNumber({ title: "Acte IV, scène 5" })).toBe(5);
    expect(parseSceneNumber({ title: "Acte I, scène 4 (les imprécations de Don Diègue)" })).toBe(4);
  });

  it("gère 'première' (majuscule/minuscule, accentuée ou non)", () => {
    expect(parseSceneNumber({ title: "Acte V, Scène première" })).toBe(1);
    expect(parseSceneNumber({ title: "Acte I, Scène PREMIÈRE" })).toBe(1);
  });

  it("place 'dernière' en fin d'acte", () => {
    expect(parseSceneNumber({ title: "Scène DERNIERE" })).toBeGreaterThan(
      parseSceneNumber({ title: "Scène VIII" })
    );
  });
});

describe("sortScenesDramaturgical", () => {
  it("trie Le Cid dans l'ordre dramaturgique (acte puis scène)", () => {
    // Ordre d'insertion en base (created_at), volontairement mélangé.
    const scenes = [
      { chapter: "Acte I", title: "Acte I, scène 4 (les imprécations de Don Diègue)" },
      { chapter: "Acte V", title: "Acte V, Scène première" },
      { chapter: "Acte I", title: "Acte I, Scène II" },
      { chapter: "Acte IV", title: "Acte IV, Scène III" },
      { chapter: "Acte IV", title: "Acte IV, Scène V" },
      { chapter: "Acte III", title: "Acte III, Scène IV" },
      { chapter: "Acte II", title: "Acte II, Scène VI" },
      { chapter: "Acte II", title: "Acte II, Scène VII" },
      { chapter: "Acte II", title: "Acte II, Scène VIII" },
      { chapter: "Acte III", title: "Acte III, Scène VI" },
      { chapter: "Acte V", title: "Acte V, Scène VI" },
      { chapter: "Acte V", title: "Acte V, Scène VII" },
    ];

    expect(sortScenesDramaturgical(scenes).map((s) => s.title)).toEqual([
      "Acte I, Scène II",
      "Acte I, scène 4 (les imprécations de Don Diègue)",
      "Acte II, Scène VI",
      "Acte II, Scène VII",
      "Acte II, Scène VIII",
      "Acte III, Scène IV",
      "Acte III, Scène VI",
      "Acte IV, Scène III",
      "Acte IV, Scène V",
      "Acte V, Scène première",
      "Acte V, Scène VI",
      "Acte V, Scène VII",
    ]);
  });

  it("trie Andromaque en mélangeant romain et arabe (scène 5)", () => {
    const scenes = [
      { chapter: "Acte IV", title: "Acte IV, scène 5" },
      { chapter: "Acte I", title: "Acte I, Scène PREMIÈRE" },
      { chapter: "Acte II", title: "Acte II, Scène II" },
      { chapter: "Acte IV", title: "Acte IV, Scène III" },
      { chapter: "Acte I", title: "Acte I, Scène IV" },
      { chapter: "Acte IV", title: "Acte IV, Scène V" },
      { chapter: "Acte III", title: "Acte III, Scène VI" },
      { chapter: "Acte III", title: "Acte III, Scène VIII" },
      { chapter: "Acte IV", title: "Acte IV, Scène VI" },
    ];

    expect(sortScenesDramaturgical(scenes).map((s) => s.title)).toEqual([
      "Acte I, Scène PREMIÈRE",
      "Acte I, Scène IV",
      "Acte II, Scène II",
      "Acte III, Scène VI",
      "Acte III, Scène VIII",
      "Acte IV, Scène III",
      "Acte IV, scène 5",
      "Acte IV, Scène V",
      "Acte IV, Scène VI",
    ]);
  });

  it("départage deux scènes de même acte/scène par le titre (stable)", () => {
    const scenes = [
      { chapter: "Acte V", title: "Acte V, scène 3 (monologue de Figaro, extrait)" },
      { chapter: "Acte V", title: "Acte V, scène 3" },
    ];
    expect(sortScenesDramaturgical(scenes).map((s) => s.title)).toEqual([
      "Acte V, scène 3",
      "Acte V, scène 3 (monologue de Figaro, extrait)",
    ]);
  });

  it("ne mute pas le tableau d'entrée", () => {
    const scenes = [
      { chapter: "Acte II", title: "Acte II, Scène II" },
      { chapter: "Acte I", title: "Acte I, Scène II" },
    ];
    const before = scenes.map((s) => s.title);
    sortScenesDramaturgical(scenes);
    expect(scenes.map((s) => s.title)).toEqual(before);
  });
});

describe("compareScenesDramaturgical (Acte IV, scène 5 vs Scène V)", () => {
  it("classe scène 5 arabe et Scène V romaine au même rang, départagées par titre", () => {
    // Cas réel Andromaque : "scène 5" (arabe) et "Scène V" (romain) valent tous
    // deux 5 ; le départage titre est déterministe, pas d'ordre aléatoire.
    const a = { chapter: "Acte IV", title: "Acte IV, scène 5" };
    const b = { chapter: "Acte IV", title: "Acte IV, Scène V" };
    expect(Math.sign(compareScenesDramaturgical(a, b))).not.toBe(0);
    expect(compareScenesDramaturgical(a, b)).toBe(-compareScenesDramaturgical(b, a));
  });
});
