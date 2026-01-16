import { createSupabaseServerClient } from "@/lib/supabase-server";
import { UserWorkAccess } from "@/types/scenes";
import { isAdmin } from "@/lib/utils/admin";

const FREE_SLOT_LIMIT = 20;

type BillingSubscriptionRow = {
  status: string;
  current_period_end: string | null;
};

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  if (!userId) return false;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("billing_subscriptions")
    .select("status,current_period_end")
    .eq("user_id", userId);

  if (error) {
    console.error(error);
    return false;
  }

  const rows = (data ?? []) as BillingSubscriptionRow[];
  const nowMs = Date.now();

  return rows.some((s) => {
    const isActiveStatus = s.status === "active" || s.status === "trialing";
    if (!isActiveStatus) return false;

    // If Stripe doesn't provide a period end (rare), treat active/trialing as active.
    if (!s.current_period_end) return true;

    const endMs = new Date(s.current_period_end).getTime();
    return Number.isFinite(endMs) ? endMs > nowMs : true;
  });
}

export async function getUserWorkAccess(
  userId: string,
  workId?: string,
  sceneId?: string
): Promise<UserWorkAccess | null> {
  const supabase = await createSupabaseServerClient();

  // Important:
  // - Un accès peut être au niveau "œuvre" (work_id défini, scene_id NULL)
  // - Ou au niveau "scène" (scene_id défini, work_id NULL)
  // Quand on vérifie l'accès d'une scène *dans une œuvre*, on a souvent workId ET sceneId :
  // il faut alors accepter l'un OU l'autre, pas les deux simultanément.

  const fetchByWork = async (wid: string) => {
    const { data, error } = await supabase
      .from("user_work_access")
      .select("*")
      .eq("user_id", userId)
      .eq("work_id", wid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<UserWorkAccess>();

    if (error) {
      console.error(error);
      return null;
    }
    return data ?? null;
  };

  const fetchByScene = async (sid: string) => {
    const { data, error } = await supabase
      .from("user_work_access")
      .select("*")
      .eq("user_id", userId)
      .eq("scene_id", sid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<UserWorkAccess>();

    if (error) {
      console.error(error);
      return null;
    }
    return data ?? null;
  };

  // Si les deux sont fournis, on teste d'abord l'accès "œuvre" (qui débloque toutes les scènes),
  // puis, si absent, l'accès "scène".
  if (workId && sceneId) {
    return (await fetchByWork(workId)) ?? (await fetchByScene(sceneId));
  }

  if (workId) return await fetchByWork(workId);
  if (sceneId) return await fetchByScene(sceneId);
  return null;
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

  // Nouveau modèle: accès global via abonnement
  void workId;
  void sceneId;
  return await hasActiveSubscription(userId);
}




