import { canAccessFreeSlot, createFreeSlotAccess, getUserWorkAccess, hasAccess } from "@/lib/queries/access";
import { User } from "@supabase/supabase-js";
import { isAdmin } from "./admin";

export type AccessCheckResult = {
  hasAccess: boolean;
  accessType: "subscription" | "admin" | "none";
};

export async function checkAccess(
  user: User | null,
  sceneId: string,
  workId?: string
): Promise<AccessCheckResult> {
  if (!user) {
    return {
      hasAccess: false,
      accessType: "none",
    };
  }

  // Les admins ont un accès complet à tout
  const admin = await isAdmin(user.id);
  if (admin) {
    return {
      hasAccess: true,
      accessType: "admin",
    };
  }

  // Vérifier si l'utilisateur a déjà un accès (désormais: abonnement actif)
  const existingAccess = await hasAccess(user.id, workId, sceneId);
  if (existingAccess) {
    // Déterminer le type d'accès
    return {
      hasAccess: true,
      accessType: "subscription",
    };
  }

  void sceneId;
  return {
    hasAccess: false,
    accessType: "none",
  };
}

export async function grantFreeSlotAccess(
  userId: string,
  sceneId: string
): Promise<boolean> {
  // Si l'utilisateur a déjà un accès (abonnement/admin), inutile d'écrire un "free_slot".
  const alreadyEntitled = await hasAccess(userId, undefined, sceneId);
  if (alreadyEntitled) return true;

  // Idempotence: si un accès scène existe déjà, on ne recrée pas.
  const existing = await getUserWorkAccess(userId, undefined, sceneId);
  if (existing) return true;

  // Appliquer la limite côté serveur.
  const { canAccess } = await canAccessFreeSlot(userId, sceneId);
  if (!canAccess) return false;

  const access = await createFreeSlotAccess(userId, sceneId);
  return access !== null;
}



