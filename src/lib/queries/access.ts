import { createSupabaseServerClient } from "@/lib/supabase-server";
import { UserWorkAccess, AccessType } from "@/types/scenes";
import { isAdmin } from "@/lib/utils/admin";

const FREE_SLOT_LIMIT = 20;

export async function getUserWorkAccess(
  userId: string,
  workId?: string,
  sceneId?: string
): Promise<UserWorkAccess | null> {
  const supabase = await createSupabaseServerClient();
  
  let query = supabase
    .from("user_work_access")
    .select("*")
    .eq("user_id", userId);

  if (workId) {
    query = query.eq("work_id", workId);
  }
  if (sceneId) {
    query = query.eq("scene_id", sceneId);
  }

  const { data, error } = await query.maybeSingle<UserWorkAccess>();

  if (error) {
    console.error(error);
    return null;
  }

  return data ?? null;
}

export async function countFreeSlotLines(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();

  // Compter les répliques des scènes auxquelles l'utilisateur a accédé en mode gratuit
  // Utiliser une requête SQL directe pour plus d'efficacité
  const { data, error } = await supabase.rpc("count_free_slot_lines", {
    p_user_id: userId,
  });

  if (error) {
    // Si la fonction RPC n'existe pas, utiliser une approche alternative
    console.warn("RPC function not available, using alternative method", error);
    
    // Récupérer tous les accès gratuits
    const { data: accesses, error: accessError } = await supabase
      .from("user_work_access")
      .select("scene_id, work_id")
      .eq("user_id", userId)
      .eq("access_type", "free_slot");

    if (accessError) {
      console.error(accessError);
      return 0;
    }

    if (!accesses || accesses.length === 0) return 0;

    // Compter les répliques pour chaque scène accessible
    const sceneIds = accesses.filter((a) => a.scene_id).map((a) => a.scene_id!);
    
    // Pour les œuvres, récupérer toutes les scènes
    const workIds = accesses.filter((a) => a.work_id).map((a) => a.work_id!);
    let allSceneIds = [...sceneIds];

    if (workIds.length > 0) {
      const { data: workScenes } = await supabase
        .from("scenes")
        .select("id")
        .in("work_id", workIds);
      
      if (workScenes) {
        allSceneIds = [...allSceneIds, ...workScenes.map((s) => s.id)];
      }
    }

    if (allSceneIds.length === 0) return 0;

    // Compter toutes les répliques en une seule requête
    const { count, error: countError } = await supabase
      .from("lines")
      .select("*", { count: "exact", head: true })
      .in("scene_id", allSceneIds);

    if (countError) {
      console.error(countError);
      return 0;
    }

    return count ?? 0;
  }

  return data ?? 0;
}

export async function countSceneLines(sceneId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();

  const { count, error } = await supabase
    .from("lines")
    .select("*", { count: "exact", head: true })
    .eq("scene_id", sceneId);

  if (error) {
    console.error(error);
    return 0;
  }

  return count ?? 0;
}

export async function canAccessFreeSlot(
  userId: string,
  sceneId: string
): Promise<{ canAccess: boolean; usedLines: number; sceneLines: number; remaining: number }> {
  const [usedLines, sceneLines] = await Promise.all([
    countFreeSlotLines(userId),
    countSceneLines(sceneId),
  ]);

  const total = usedLines + sceneLines;
  const canAccess = total <= FREE_SLOT_LIMIT;
  const remaining = Math.max(0, FREE_SLOT_LIMIT - usedLines);

  return {
    canAccess,
    usedLines,
    sceneLines,
    remaining,
  };
}

export async function createFreeSlotAccess(
  userId: string,
  sceneId: string
): Promise<UserWorkAccess | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("user_work_access")
    .insert({
      user_id: userId,
      scene_id: sceneId,
      access_type: "free_slot",
    })
    .select()
    .single<UserWorkAccess>();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function hasAccess(
  userId: string,
  workId?: string,
  sceneId?: string
): Promise<boolean> {
  if (!userId) return false;

  // Les admins ont un accès complet à tout
  const admin = await isAdmin(userId);
  if (admin) return true;

  // Vérifier si l'utilisateur a déjà un accès (gratuit, acheté, ou privé)
  const access = await getUserWorkAccess(userId, workId, sceneId);
  if (access) return true;

  // Pour les scènes, vérifier si c'est une scène privée appartenant à l'utilisateur
  if (sceneId) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("scenes")
      .select("is_private, owner_user_id")
      .eq("id", sceneId)
      .single();

    if (data?.is_private && data.owner_user_id === userId) {
      return true;
    }
  }

  return false;
}


