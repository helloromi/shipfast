import { cache } from "react";

import { hasActiveSubscription } from "@/lib/queries/access";
import { hasClassMembership } from "@/lib/queries/teacher";
import { isAdmin } from "@/lib/utils/admin";

/**
 * Le droit d'accès aux fonctions payantes, en un seul endroit.
 *
 * Trois portes, historiquement écrites dans `require-subscription` :
 *   - admin ;
 *   - pass actif (`billing_subscriptions`) ;
 *   - membre d'une classe, c'est-à-dire élève couvert par le compte de son professeur.
 *
 * Toute garde payante doit passer par ici — `requireSubscriptionOrRedirect` pour les
 * pages, `getImportQuota` pour l'API d'import. Ne pas réécrire la matrice ailleurs :
 * c'est elle qui définit ce que « payant » veut dire dans le produit.
 *
 * Mémoïsé par requête : plusieurs gardes peuvent tomber sur la même requête.
 */
export const isEntitledToPaidFeatures = cache(async (userId: string): Promise<boolean> => {
  if (!userId) return false;

  // Les trois vérifications sont indépendantes : on les lance en parallèle
  // (latence = la plus lente, pas la somme des trois).
  const [admin, subscribed, inClass] = await Promise.all([
    isAdmin(userId),
    hasActiveSubscription(userId),
    hasClassMembership(userId),
  ]);

  return admin || subscribed || inClass;
});
