import { describe, expect, it } from "vitest";

import { assertSameOrigin } from "./csrf";

const SITE = "https://cote-cour.fr";

function makeRequest(headers: Record<string, string>): Request {
  return new Request(`${SITE}/api/test`, { method: "POST", headers });
}

describe("assertSameOrigin", () => {
  it("accepte une requête avec un Origin identique", () => {
    expect(assertSameOrigin(makeRequest({ origin: SITE }))).toEqual({ ok: true });
  });

  it("refuse un Origin différent", () => {
    const result = assertSameOrigin(makeRequest({ origin: "https://evil.example" }));
    expect(result.ok).toBe(false);
  });

  it("refuse un Origin avec un autre port", () => {
    const result = assertSameOrigin(makeRequest({ origin: "https://cote-cour.fr:8443" }));
    expect(result.ok).toBe(false);
  });

  it("accepte via Referer quand Origin est absent", () => {
    expect(assertSameOrigin(makeRequest({ referer: `${SITE}/scenes/123` }))).toEqual({ ok: true });
  });

  it("refuse un Referer d'une autre origine", () => {
    const result = assertSameOrigin(makeRequest({ referer: "https://evil.example/page" }));
    expect(result.ok).toBe(false);
  });

  it("refuse un Referer invalide", () => {
    const result = assertSameOrigin(makeRequest({ referer: "not-a-url" }));
    expect(result.ok).toBe(false);
  });

  it("refuse par défaut sans Origin ni Referer", () => {
    const result = assertSameOrigin(makeRequest({}));
    expect(result.ok).toBe(false);
  });

  it("priorise Origin sur Referer (Origin malveillant + Referer légitime)", () => {
    const result = assertSameOrigin(
      makeRequest({ origin: "https://evil.example", referer: `${SITE}/page` })
    );
    expect(result.ok).toBe(false);
  });
});
