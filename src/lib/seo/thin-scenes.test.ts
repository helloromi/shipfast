import { describe, expect, it } from "vitest";

import { isThinScene } from "./thin-scenes";

const lines = (count: number, length: number) =>
  Array.from({ length: count }, () => ({ text: "x".repeat(length) }));

describe("isThinScene", () => {
  it("écarte une scène courte sur les deux axes", () => {
    // britannicus/acte-ii-scene-vii : 2 répliques, 143 caractères.
    expect(isThinScene({ lines: lines(2, 71) })).toBe(true);
  });

  it("garde une scène de peu de répliques mais de vraies tirades", () => {
    // Le critère est conjonctif : « la tirade du nez » tient en quelques répliques.
    expect(isThinScene({ lines: lines(3, 400) })).toBe(false);
  });

  it("garde une scène de répliques brèves mais nombreuses", () => {
    expect(isThinScene({ lines: lines(8, 10) })).toBe(false);
  });

  it("garde une scène pile au seuil de caractères", () => {
    expect(isThinScene({ lines: lines(2, 250) })).toBe(false);
  });

  it("traite un texte null comme vide au lieu de planter", () => {
    expect(isThinScene({ lines: [{ text: null }, { text: null }] })).toBe(true);
  });

  it("écarte une scène sans aucune réplique", () => {
    expect(isThinScene({ lines: [] })).toBe(true);
  });

  it("garde une scène courte dès qu'elle porte une fiche rédigée", () => {
    // Le Cid I,4 : 6 répliques, 463 caractères, mais « Ô rage ! ô désespoir ! ».
    expect(isThinScene({ lines: lines(6, 77), summary: "Don Diègue vient d'être giflé. ".repeat(10) })).toBe(
      false
    );
  });

  it("ne compte pas une phrase de résumé comme une fiche", () => {
    // Cas réel : romeo-juliette portait un résumé d'une ligne (110 caractères),
    // ce qui suffisait à forcer l'indexation d'une scène de 4 répliques.
    const oneLiner =
      "Roméo rejoint Juliette en secret ; les deux amants échangent leurs vœux malgré la rivalité des familles.";
    expect(isThinScene({ lines: lines(4, 47), summary: oneLiner })).toBe(true);
  });

  it("ne compte pas un summary vide ou blanc comme une fiche", () => {
    expect(isThinScene({ lines: lines(2, 71), summary: "   " })).toBe(true);
    expect(isThinScene({ lines: lines(2, 71), summary: null })).toBe(true);
  });
});
