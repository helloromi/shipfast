import { hasAccess, createFreeSlotAccess } from "@/lib/queries/access";
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
  const access = await createFreeSlotAccess(userId, sceneId);
  return access !== null;
}



