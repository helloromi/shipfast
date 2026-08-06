import { beforeEach, describe, expect, it, vi } from "vitest";

// Le quota d'import : droit payant illimité, sinon un seul texte importé possédé.
// On mocke l'entitlement et le client Supabase pour tester la matrice de décision.

const { isEntitledToPaidFeatures, countBuilder, from } = vi.hoisted(() => {
  const countBuilder = {
    result: { count: 0, error: null as { message: string } | null },
  };
  const from = vi.fn(() => ({
    select: () => ({
      eq: () => ({
        eq: () => ({
          is: () => Promise.resolve(countBuilder.result),
        }),
      }),
    }),
  }));
  return { isEntitledToPaidFeatures: vi.fn(), countBuilder, from };
});

vi.mock("@/lib/utils/entitlement", () => ({ isEntitledToPaidFeatures }));
vi.mock("@/lib/supabase-server", () => ({
  createSupabaseServerClient: async () => ({ from }),
}));

import { FREE_IMPORT_LIMIT, countImportedScenes, getImportQuota } from "./import-quota";

function setup(opts: { entitled?: boolean; imported?: number; error?: boolean }) {
  isEntitledToPaidFeatures.mockResolvedValue(opts.entitled ?? false);
  countBuilder.result = opts.error
    ? { count: null as unknown as number, error: { message: "boom" } }
    : { count: opts.imported ?? 0, error: null };
}

describe("getImportQuota", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("laisse un droit payant importer sans limite", async () => {
    setup({ entitled: true, imported: 12 });
    const quota = await getImportQuota("user-1");

    expect(quota).toEqual({
      entitled: true,
      used: 0,
      limit: null,
      remaining: null,
      allowed: true,
    });
    // Un compte payant ne déclenche même pas le comptage.
    expect(from).not.toHaveBeenCalled();
  });

  it("offre le premier import à un compte sans pass", async () => {
    setup({ imported: 0 });
    const quota = await getImportQuota("user-1");

    expect(quota.allowed).toBe(true);
    expect(quota.remaining).toBe(FREE_IMPORT_LIMIT);
    expect(quota.entitled).toBe(false);
  });

  it("ferme l'import une fois l'offert consommé", async () => {
    setup({ imported: 1 });
    const quota = await getImportQuota("user-1");

    expect(quota.allowed).toBe(false);
    expect(quota.remaining).toBe(0);
    expect(quota.used).toBe(1);
  });

  it("reste fermé au-delà de la limite", async () => {
    setup({ imported: 4 });
    const quota = await getImportQuota("user-1");

    expect(quota.allowed).toBe(false);
    expect(quota.remaining).toBe(0);
  });

  it("ferme l'import si le comptage échoue, plutôt que de l'ouvrir en grand", async () => {
    setup({ error: true });
    const quota = await getImportQuota("user-1");

    expect(quota.allowed).toBe(false);
  });

  it("ne compte rien sans identifiant", async () => {
    setup({ imported: 3 });
    await expect(countImportedScenes("")).resolves.toBe(0);
    expect(from).not.toHaveBeenCalled();
  });
});
