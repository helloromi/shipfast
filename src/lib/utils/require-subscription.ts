import { redirect } from "next/navigation";
import { User } from "@supabase/supabase-js";

import { canOwnClass, isEntitledToPaidFeatures } from "@/lib/utils/entitlement";

/**
 * Enforce the paywall: admins, abonnés et membres d'une classe (élèves couverts
 * par le compte de leur professeur) accèdent aux pages protégées.
 * - If user is null: redirect to /login
 * - If not entitled: redirect to /subscribe (default)
 *
 * NB : les seuls appelants restants gardent des actions payantes (edit, scène
 * privée, espace prof). Un utilisateur qui les atteint sans droit tente
 * explicitement du contenu payant → on l'envoie sur la page de paiement, pas sur
 * l'onboarding.
 *
 * L'import ne passe plus par ici : son premier usage est offert, donc la garde
 * est un quota et non un tout-ou-rien (voir `@/lib/utils/import-quota`). La
 * matrice de droits, elle, reste commune (`isEntitledToPaidFeatures`).
 */
export async function requireSubscriptionOrRedirect(
  user: User | null,
  redirectTo: string = "/subscribe"
): Promise<void> {
  if (!user) redirect("/login");

  if (await isEntitledToPaidFeatures(user.id)) return;

  redirect(redirectTo);
}

/**
 * Garde de l'espace professeur. Plus stricte que le paywall général : un élève
 * membre d'une classe est habilité aux fonctions payantes, mais n'a rien à faire
 * dans l'espace qui administre les classes — il y voyait jusqu'ici un tableau de
 * bord vide et un formulaire de création qui échoue désormais en 402.
 */
export async function requireClassOwnerOrRedirect(
  user: User | null,
  redirectTo: string = "/subscribe"
): Promise<void> {
  if (!user) redirect("/login");

  if (await canOwnClass(user.id)) return;

  redirect(redirectTo);
}

