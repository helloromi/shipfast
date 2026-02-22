import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { getSupabaseEnv } from "@/lib/supabase-env";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}




