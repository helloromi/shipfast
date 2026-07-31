// Pass 3 mois — paiement Stripe unique (mode "payment", pas d'abonnement).
// L'accès est matérialisé par une ligne billing_subscriptions dont la clé
// d'idempotence est l'id de session checkout (cs_...) : webhook et route
// success peuvent tous deux upserter sans doublon.

export const PASS_DURATION_MONTHS = 3;

export function computePassPeriodEnd(paidAt: Date): string {
  const end = new Date(paidAt);
  end.setMonth(end.getMonth() + PASS_DURATION_MONTHS);
  return end.toISOString();
}

export type PassBillingRow = {
  stripe_subscription_id: string;
  user_id: string;
  status: "active";
  current_period_end: string;
  cancel_at_period_end: true;
  updated_at: string;
};

// `paidAtUnixSeconds` = session.created côté Stripe : déterministe entre le
// webhook et le fallback de la route success (même date d'expiration écrite).
export function buildPassBillingRow(params: {
  checkoutSessionId: string;
  userId: string;
  paidAtUnixSeconds: number;
}): PassBillingRow {
  return {
    stripe_subscription_id: params.checkoutSessionId,
    user_id: params.userId,
    status: "active",
    current_period_end: computePassPeriodEnd(new Date(params.paidAtUnixSeconds * 1000)),
    cancel_at_period_end: true,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Une session de paiement est-elle réglée, au sens « on peut accorder le pass » ?
 *
 * Deux statuts valent règlement. `paid` est le cas courant. `no_payment_required`
 * est celui d'une session à 0 € — un code promo à -100 % : Stripe ne la marque
 * jamais `paid` puisqu'aucun paiement n'a lieu. Sans ce second cas, un code offert
 * n'accorderait rien et le client repartirait les mains vides.
 *
 * Partagé par le webhook et le fallback de la route success : les deux doivent
 * trancher pareil, sinon le filet laisse passer exactement ce qu'il rattrape.
 */
export function isCheckoutSettled(paymentStatus: string | null | undefined): boolean {
  return paymentStatus === "paid" || paymentStatus === "no_payment_required";
}
