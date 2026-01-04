import { canAccessFreeSlot, hasAccess, createFreeSlotAccess } from "@/lib/queries/access";
import { User } from "@supabase/supabase-js";
import { isAdmin } from "./admin";

export type AccessCheckResult = {
  hasAccess: boolean;
  accessType: "free_slot" | "purchased" | "private" | "admin" | "none";
  canUseFreeSlot: boolean;
  freeSlotInfo?: {
    usedLines: number;
    sceneLines: number;
    remaining: number;
    limit: number;
  };
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
      canUseFreeSlot: false,
    };
  }

  // Les admins ont un accès complet à tout
  const admin = await isAdmin(user.id);
  if (admin) {
    return {
      hasAccess: true,
      accessType: "admin",
      canUseFreeSlot: false,
    };
  }

  // Vérifier si l'utilisateur a déjà un accès
  const existingAccess = await hasAccess(user.id, workId, sceneId);
  if (existingAccess) {
    // Déterminer le type d'accès
    // Pour simplifier, on considère que si hasAccess retourne true, c'est soit free_slot, soit purchased, soit private
    // On pourrait améliorer en récupérant le type exact depuis la DB
    return {
      hasAccess: true,
      accessType: "purchased", // Par défaut, on considère que c'est acheté si déjà présent
      canUseFreeSlot: false,
    };
  }

  // Vérifier si on peut utiliser le slot gratuit
  const freeSlotCheck = await canAccessFreeSlot(user.id, sceneId);
  
  return {
    hasAccess: false,
    accessType: "none",
    canUseFreeSlot: freeSlotCheck.canAccess,
    freeSlotInfo: {
      usedLines: freeSlotCheck.usedLines,
      sceneLines: freeSlotCheck.sceneLines,
      remaining: freeSlotCheck.remaining,
      limit: 20,
    },
  };
}

export async function grantFreeSlotAccess(
  userId: string,
  sceneId: string
): Promise<boolean> {
  const access = await createFreeSlotAccess(userId, sceneId);
  return access !== null;
}


