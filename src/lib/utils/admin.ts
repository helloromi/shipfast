import { cache } from "react";

import { getSupabaseSessionUser } from "@/lib/queries/scenes";

/**
 * Vérifie si un utilisateur est admin en comparant son email avec ADMIN_EMAILS.
 * Mémoïsé par requête (React cache) et appuyé sur getSupabaseSessionUser (lui-même
 * mémoïsé) : les pages qui enchaînent paywall + checks d'accès ne refont plus
 * d'appel réseau auth.getUser() à chaque vérification.
 * @param userId - L'ID de l'utilisateur à vérifier
 * @returns true si l'utilisateur est admin, false sinon
 */
export const isAdmin = cache(async (userId: string): Promise<boolean> => {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];
  if (adminEmails.length === 0) return false;

  const user = await getSupabaseSessionUser();

  if (!user || user.id !== userId) return false;

  return user.email ? adminEmails.includes(user.email) : false;
});
