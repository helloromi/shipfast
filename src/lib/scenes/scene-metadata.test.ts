import { describe, expect, it } from "vitest";

import { buildSceneMetadata } from "@/lib/scenes/scene-metadata";
import { DESCRIPTION_MAX } from "@/lib/seo/text";
import type { SceneWithRelations } from "@/types/scenes";

function makeScene(overrides: Partial<SceneWithRelations> = {}): SceneWithRelations {
  return {
    id: "scene-1",
    work_id: "work-1",
    title: "Acte I, scène 4",
    author: "Edmond Rostand",
    summary: null,
    chapter: "Acte I",
    is_private: false,
    slug: "acte-i-scene-4",
    created_at: "2026-07-01T00:00:00.000Z",
    characters: [
      { id: "c1", scene_id: "scene-1", name: "Cyrano" },
      { id: "c2", scene_id: "scene-1", name: "Valvert" },
    ],
    // 8 répliques : au-dessus du seuil de contenu mince, la scène est indexable.
    lines: Array.from({ length: 8 }, (_, i) => ({
      id: `l${i}`,
      scene_id: "scene-1",
      character_id: "c1",
      order: i,
      text: "Une réplique de longueur ordinaire pour dépasser le seuil.",
      characters: null,
    })),
    work: {
      id: "work-1",
      title: "Cyrano de Bergerac",
      is_public_domain: true,
      slug: "cyrano-de-bergerac",
      author: "Edmond Rostand",
    },
    ...overrides,
  };
}

const PATH = "/scenes/edmond-rostand/cyrano-de-bergerac/acte-i-scene-4";

describe("buildSceneMetadata — description", () => {
  it("part de la fiche et y accole la promesse", () => {
    const meta = buildSceneMetadata(
      makeScene({
        summary:
          "Le vicomte de Valvert croit railler Cyrano en lui lançant que son nez est bien grand.\n\n" +
          "Le morceau tient sur un principe simple.",
      }),
      PATH
    );

    expect(meta.description).toBe(
      "Le vicomte de Valvert croit railler Cyrano en lui lançant que son nez est bien grand. " +
        "Texte intégral et flashcards, sans compte."
    );
    expect(meta.description!.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });

  it("garde la fiche seule quand la promesse ne tient plus", () => {
    const summary =
      "Roxane descend du carrosse au milieu du camp affamé, salue tout le monde et se " +
      "fait avancer un tambour pour s'asseoir parmi les cadets.";
    const meta = buildSceneMetadata(makeScene({ summary }), PATH);

    expect(meta.description).toBe(summary);
    expect(meta.description).not.toContain("Texte intégral et flashcards");
  });

  it("tronque la fiche plutôt que de retomber sur le gabarit générique", () => {
    // Première phrase > DESCRIPTION_MAX : aucune phrase entière ne tient. Une fiche
    // tronquée reste unique, le gabarit ne le serait pas.
    const meta = buildSceneMetadata(
      makeScene({
        summary:
          "Roxane descend du carrosse au milieu du camp affamé, salue tout le monde, se fait " +
          "avancer un tambour pour s'asseoir et raconte en riant qu'une patrouille a tiré sur " +
          "sa voiture pendant la traversée des lignes espagnoles.",
      }),
      PATH
    );

    expect(meta.description!.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(meta.description).toMatch(/^Roxane descend du carrosse/);
    expect(meta.description).toMatch(/…$/);
  });

  it("retombe sur le gabarit générique en l'absence de fiche", () => {
    const meta = buildSceneMetadata(makeScene({ summary: null }), PATH);

    expect(meta.description).toContain("texte intégral");
    expect(meta.description!.length).toBeLessThanOrEqual(DESCRIPTION_MAX);
  });

  it("ne produit aucune métadonnée indexable pour une scène privée", () => {
    const meta = buildSceneMetadata(makeScene({ is_private: true, summary: "Une fiche." }), PATH);

    expect(meta.robots).toEqual({ index: false, follow: false });
    expect(meta.description).toBeUndefined();
  });

  it("garde le canonical et le title existants", () => {
    const meta = buildSceneMetadata(makeScene({ summary: "Une fiche courte." }), PATH);

    expect(meta.alternates?.canonical).toBe(PATH);
    expect(meta.title).toBe("Acte I, scène 4 — Cyrano de Bergerac : texte intégral");
  });
});

describe("buildSceneMetadata — nom d'usage", () => {
  it("met le nom d'usage en tête et garde la coordonnée", () => {
    const meta = buildSceneMetadata(
      makeScene({
        title: "Acte IV, Scène III",
        nickname: "Le récit de Rodrigue",
        work: { id: "w", title: "Le Cid", is_public_domain: true, slug: "le-cid", author: "Pierre Corneille" },
      }),
      PATH
    );

    expect(meta.title).toBe("Le récit de Rodrigue — Le Cid, Acte IV, Scène III");
    expect((meta.title as string).length).toBeLessThanOrEqual(60);
  });

  it("ne répète pas le nom d'usage déjà présent entre parenthèses dans le titre", () => {
    // « Acte I, scène 4 (la tirade du nez) » + nickname « La tirade du nez » donnerait
    // un titre qui dit deux fois la même chose.
    const meta = buildSceneMetadata(
      makeScene({ title: "Acte I, scène 4 (la tirade du nez)", nickname: "La tirade du nez" }),
      PATH
    );

    expect(meta.title).toBe("La tirade du nez — Cyrano de Bergerac, Acte I, scène 4");
    expect(meta.title).not.toMatch(/tirade du nez.*tirade du nez/i);
  });

  it("sacrifie la coordonnée avant le nom d'usage quand c'est trop long", () => {
    const meta = buildSceneMetadata(
      makeScene({
        title: "Acte II, Scène XI",
        nickname: "« Que diable allait-il faire dans cette galère ? »",
        work: {
          id: "w",
          title: "Les Fourberies de Scapin",
          is_public_domain: true,
          slug: "les-fourberies-de-scapin",
          author: "Molière",
        },
      }),
      PATH
    );

    expect(meta.title).toContain("Que diable allait-il faire dans cette galère");
    expect((meta.title as string).length).toBeLessThanOrEqual(68);
  });

  it("laisse le titre inchangé sans nom d'usage", () => {
    const meta = buildSceneMetadata(makeScene({ nickname: null }), PATH);

    expect(meta.title).toBe("Acte I, scène 4 — Cyrano de Bergerac : texte intégral");
  });
});
