import { describe, expect, it } from "vitest";

import { safeInternalPath } from "./safe-path";

describe("safeInternalPath", () => {
  it("accepte un chemin interne", () => {
    expect(safeInternalPath("/mes-cours", "/onboarding")).toBe("/mes-cours");
  });

  it("conserve la query string (code d'invitation)", () => {
    expect(safeInternalPath("/rejoindre?code=4F7A2B9C", "/onboarding")).toBe(
      "/rejoindre?code=4F7A2B9C"
    );
  });

  it("refuse les URLs absolues (open redirect)", () => {
    expect(safeInternalPath("https://evil.example/phish", "/onboarding")).toBe("/onboarding");
  });

  it("refuse les chemins protocole-relatifs //", () => {
    expect(safeInternalPath("//evil.example", "/onboarding")).toBe("/onboarding");
  });

  it("refuse les backslashes (contournement navigateur)", () => {
    expect(safeInternalPath("/\\evil.example", "/onboarding")).toBe("/onboarding");
  });

  it("retombe sur le fallback si vide ou absent", () => {
    expect(safeInternalPath(null, "/onboarding")).toBe("/onboarding");
    expect(safeInternalPath("", "/onboarding")).toBe("/onboarding");
    expect(safeInternalPath(undefined, "/home")).toBe("/home");
  });
});
