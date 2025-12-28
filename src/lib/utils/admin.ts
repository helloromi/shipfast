import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Vérifie si un utilisateur est admin en comparant son email avec ADMIN_EMAILS
 * @param userId - L'ID de l'utilisateur à vérifier
 * @returns true si l'utilisateur est admin, false sinon
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];
  if (adminEmails.length === 0) return false;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== userId) return false;

  return user.email ? adminEmails.includes(user.email) : false;
}

/**
 * Vérifie si un utilisateur est admin à partir de son email
 * Utile quand on a déjà l'email et qu'on ne veut pas faire de requête supplémentaire
 * @param email - L'email de l'utilisateur à vérifier
 * @returns true si l'utilisateur est admin, false sinon
 */
export function isAdminByEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim()) || [];
  if (adminEmails.length === 0) return false;

  return adminEmails.includes(email);
}
