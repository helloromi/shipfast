import { describe, expect, it } from "vitest";

import { DESCRIPTION_MAX, leadSentences, truncate } from "@/lib/seo/text";

describe("leadSentences", () => {
  it("garde plusieurs phrases entières tant qu'elles tiennent", () => {
    const text = "Curiace paraît chez son beau-père. Le mariage est fixé au lendemain.";
    expect(leadSentences(text, 80)).toBe(text);
  });

  it("s'arrête à la dernière phrase entière, sans jamais couper au milieu", () => {
    const text = "Curiace paraît chez son beau-père. Le mariage est fixé au lendemain.";
    expect(leadSentences(text, 50)).toBe("Curiace paraît chez son beau-père.");
  });

  it("renvoie une chaîne vide quand même la première phrase dépasse", () => {
    expect(leadSentences("Une phrase beaucoup trop longue pour la limite.", 10)).toBe("");
  });

  it("ne produit pas de phrase orpheline sur une ponctuation fermée par un guillemet", () => {
    // « … c'est un cap ! » suivi d'une autre phrase : le guillemet fermant appartient à
    // la première, sinon la seconde phrase commencerait par « ». ».
    const text = "Cyrano lance : « c'est un cap ! » Valvert ne trouve rien à répondre.";
    expect(leadSentences(text, 40)).toBe("Cyrano lance : « c'est un cap ! »");
  });

  it("traite ? et ! comme des fins de phrase", () => {
    const text = "Que diable allait-il faire dans cette galère ? Argante ne cède pas.";
    expect(leadSentences(text, 50)).toBe("Que diable allait-il faire dans cette galère ?");
  });

  it("laisse la place à la promesse dans le budget d'une description", () => {
    const tail = " Texte intégral et flashcards, sans compte.";
    const summary =
      "À l'hôtel de Bourgogne, le vicomte de Valvert croit railler Cyrano en lui lançant " +
      "que son nez est bien grand. Cyrano relève l'insulte comme un manque d'imagination.";
    const lead = leadSentences(summary, DESCRIPTION_MAX - tail.length);
    expect(lead).toBe(
      "À l'hôtel de Bourgogne, le vicomte de Valvert croit railler Cyrano en lui lançant que son nez est bien grand."
    );
    expect(`${lead}${tail}`.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });
});

describe("truncate", () => {
  it("coupe sur une limite de mot", () => {
    expect(truncate("texte intégral et flashcards", 20)).toBe("texte intégral et…");
  });

  it("laisse le texte intact sous la limite", () => {
    expect(truncate("court", 20)).toBe("court");
  });
});
