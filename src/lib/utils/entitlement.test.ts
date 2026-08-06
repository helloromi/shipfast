import { beforeEach, describe, expect, it, vi } from "vitest";

// La matrice de droits (admin / pass / classe) et l'accès à une scène privée.
// Le point sensible : le propriétaire d'un texte importé y accède SANS pass,
// sinon l'import offert produit une scène qu'on ne peut pas ouvrir.

const { isAdmin, hasActiveSubscription, hasClassMembership } = vi.hoisted(() => ({
  isAdmin: vi.fn(),
  hasActiveSubscription: vi.fn(),
  hasClassMembership: vi.fn(),
}));

vi.mock("@/lib/utils/admin", () => ({ isAdmin }));
vi.mock("@/lib/queries/access", () => ({ hasActiveSubscription }));
vi.mock("@/lib/queries/teacher", () => ({ hasClassMembership }));

import { canAccessPrivateScene, isEntitledToPaidFeatures } from "./entitlement";

function setup(opts: { admin?: boolean; subscribed?: boolean; inClass?: boolean }) {
  isAdmin.mockResolvedValue(opts.admin ?? false);
  hasActiveSubscription.mockResolvedValue(opts.subscribed ?? false);
  hasClassMembership.mockResolvedValue(opts.inClass ?? false);
}

describe("isEntitledToPaidFeatures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refuse sans identifiant", async () => {
    setup({ admin: true });
    await expect(isEntitledToPaidFeatures("")).resolves.toBe(false);
  });

  it.each([
    ["admin", { admin: true }],
    ["pass actif", { subscribed: true }],
    ["membre de classe", { inClass: true }],
  ])("accorde le droit à un %s", async (_label, opts) => {
    setup(opts);
    await expect(isEntitledToPaidFeatures("user-1")).resolves.toBe(true);
  });

  it("refuse un compte sans aucun droit", async () => {
    setup({});
    await expect(isEntitledToPaidFeatures("user-1")).resolves.toBe(false);
  });
});

describe("canAccessPrivateScene", () => {
  beforeEach(() => vi.clearAllMocks());

  it("laisse le propriétaire ouvrir son texte importé sans pass", async () => {
    setup({});
    await expect(
      canAccessPrivateScene("user-1", { owner_user_id: "user-1" })
    ).resolves.toBe(true);
    // Le cas nominal de l'import offert ne doit même pas interroger le paywall.
    expect(hasActiveSubscription).not.toHaveBeenCalled();
  });

  it("refuse le texte importé d'un autre à un compte sans droit", async () => {
    setup({});
    await expect(
      canAccessPrivateScene("user-1", { owner_user_id: "user-2" })
    ).resolves.toBe(false);
  });

  it("laisse un abonné ouvrir une scène privée partagée", async () => {
    setup({ subscribed: true });
    await expect(
      canAccessPrivateScene("user-1", { owner_user_id: "user-2" })
    ).resolves.toBe(true);
  });

  it("retombe sur le paywall quand la scène n'a pas de propriétaire", async () => {
    setup({});
    await expect(canAccessPrivateScene("user-1", { owner_user_id: null })).resolves.toBe(false);

    setup({ subscribed: true });
    await expect(canAccessPrivateScene("user-1", { owner_user_id: null })).resolves.toBe(true);
  });

  it("refuse sans identifiant, même sur une scène sans propriétaire", async () => {
    setup({ admin: true });
    await expect(canAccessPrivateScene("", { owner_user_id: null })).resolves.toBe(false);
  });
});
