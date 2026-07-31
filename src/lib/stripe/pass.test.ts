import { describe, expect, it } from "vitest";

import {
  buildPassBillingRow,
  computePassPeriodEnd,
  isCheckoutSettled,
  PASS_DURATION_MONTHS,
} from "./pass";

describe("computePassPeriodEnd", () => {
  it("ajoute 3 mois à la date de paiement", () => {
    expect(PASS_DURATION_MONTHS).toBe(3);
    expect(computePassPeriodEnd(new Date("2026-07-03T10:00:00.000Z"))).toBe(
      "2026-10-03T10:00:00.000Z"
    );
  });

  it("passe l'année si nécessaire", () => {
    expect(computePassPeriodEnd(new Date("2026-11-15T00:00:00.000Z"))).toBe(
      "2027-02-15T00:00:00.000Z"
    );
  });

  it("déborde sur le mois suivant quand le jour n'existe pas (30 nov + 3 mois)", () => {
    // Comportement de Date.setMonth : 30 février → 2 mars. Le client gagne
    // deux jours, jamais l'inverse.
    expect(computePassPeriodEnd(new Date("2026-11-30T00:00:00.000Z"))).toBe(
      "2027-03-02T00:00:00.000Z"
    );
  });
});

describe("buildPassBillingRow", () => {
  it("construit une ligne active, non renouvelable, clé = session checkout", () => {
    const row = buildPassBillingRow({
      checkoutSessionId: "cs_test_123",
      userId: "user-1",
      paidAtUnixSeconds: Date.parse("2026-07-03T10:00:00.000Z") / 1000,
    });
    expect(row.stripe_subscription_id).toBe("cs_test_123");
    expect(row.user_id).toBe("user-1");
    expect(row.status).toBe("active");
    expect(row.cancel_at_period_end).toBe(true);
    expect(row.current_period_end).toBe("2026-10-03T10:00:00.000Z");
  });

  it("est déterministe : webhook et route success écrivent la même expiration", () => {
    const paidAt = Date.parse("2026-07-03T10:00:00.000Z") / 1000;
    const a = buildPassBillingRow({ checkoutSessionId: "cs_x", userId: "u", paidAtUnixSeconds: paidAt });
    const b = buildPassBillingRow({ checkoutSessionId: "cs_x", userId: "u", paidAtUnixSeconds: paidAt });
    expect(a.current_period_end).toBe(b.current_period_end);
  });
});

describe("isCheckoutSettled", () => {
  it("accepte un paiement normal", () => {
    expect(isCheckoutSettled("paid")).toBe(true);
  });

  it("accepte une session à 0 € (code promo à -100 %)", () => {
    // Stripe ne marque JAMAIS `paid` une session sans paiement : sans ce cas, un
    // code offert n'accorderait aucun pass.
    expect(isCheckoutSettled("no_payment_required")).toBe(true);
  });

  it("refuse une session impayée", () => {
    expect(isCheckoutSettled("unpaid")).toBe(false);
  });

  it("refuse un statut absent plutôt que de l'interpréter", () => {
    expect(isCheckoutSettled(null)).toBe(false);
    expect(isCheckoutSettled(undefined)).toBe(false);
  });
});
