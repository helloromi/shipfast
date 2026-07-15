import { describe, expect, it } from "vitest";

import { absoluteUrl, BASE_URL, displayUrl } from "./base-url";

describe("BASE_URL", () => {
  it("ne se termine jamais par un slash", () => {
    expect(BASE_URL.endsWith("/")).toBe(false);
  });

  it("pointe sur le domaine canonique, pas sur cote-cour.fr", () => {
    expect(BASE_URL).not.toContain("cote-cour.fr");
    expect(BASE_URL).toMatch(/^https?:\/\//);
  });
});

describe("absoluteUrl", () => {
  it("préfixe le domaine canonique", () => {
    expect(absoluteUrl("/rejoindre")).toBe(`${BASE_URL}/rejoindre`);
  });

  it("tolère un chemin sans slash initial", () => {
    expect(absoluteUrl("rejoindre")).toBe(`${BASE_URL}/rejoindre`);
  });
});

describe("displayUrl", () => {
  it("retire le protocole pour l'affichage", () => {
    expect(displayUrl("/rejoindre")).not.toMatch(/^https?:\/\//);
    expect(displayUrl("/rejoindre")).toContain("/rejoindre");
  });
});
