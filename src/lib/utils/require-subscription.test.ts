import type { User } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Le paywall : admin OU abonnement actif OU membre d'une classe.
// On mocke les trois sources et next/navigation pour tester la matrice de décision.

const { isAdmin, hasActiveSubscription, hasClassMembership, redirect } = vi.hoisted(() => ({
  isAdmin: vi.fn(),
  hasActiveSubscription: vi.fn(),
  hasClassMembership: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/utils/admin", () => ({ isAdmin }));
vi.mock("@/lib/queries/access", () => ({ hasActiveSubscription }));
vi.mock("@/lib/queries/teacher", () => ({ hasClassMembership }));
vi.mock("next/navigation", () => ({ redirect }));

import { requireSubscriptionOrRedirect } from "./require-subscription";

const USER = { id: "user-1" } as User;

function setup(opts: { admin?: boolean; subscribed?: boolean; inClass?: boolean }) {
  isAdmin.mockResolvedValue(opts.admin ?? false);
  hasActiveSubscription.mockResolvedValue(opts.subscribed ?? false);
  hasClassMembership.mockResolvedValue(opts.inClass ?? false);
}

describe("requireSubscriptionOrRedirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirige vers /login sans utilisateur", async () => {
    setup({});
    await expect(requireSubscriptionOrRedirect(null)).rejects.toThrow("REDIRECT:/login");
  });

  it("laisse passer un admin", async () => {
    setup({ admin: true });
    await expect(requireSubscriptionOrRedirect(USER)).resolves.toBeUndefined();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("laisse passer un abonné", async () => {
    setup({ subscribed: true });
    await expect(requireSubscriptionOrRedirect(USER)).resolves.toBeUndefined();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("laisse passer un membre de classe sans abonnement", async () => {
    setup({ inClass: true });
    await expect(requireSubscriptionOrRedirect(USER)).resolves.toBeUndefined();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirige vers /subscribe (paiement) sans aucun droit", async () => {
    setup({});
    await expect(requireSubscriptionOrRedirect(USER)).rejects.toThrow("REDIRECT:/subscribe");
  });

  it("respecte la cible de redirection personnalisée", async () => {
    setup({});
    await expect(requireSubscriptionOrRedirect(USER, "/onboarding")).rejects.toThrow(
      "REDIRECT:/onboarding"
    );
  });
});
