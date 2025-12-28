"use server";

import { createServerClient, type CookieOptions } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase env vars manquants. Ajoute NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return { url, anonKey };
}

export async function createSupabaseServerClient() {
  const { url, anonKey } = getSupabaseEnv();

  // cookies() peut être indisponible selon le contexte (statique/edge) ou retourner une promesse.
  // On protège pour éviter les erreurs runtime ; en cas de fallback, les cookies ne seront pas lus/écrits
  // et Supabase utilisera la session anonyme (ce qui est suffisant pour la lecture publique).
  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null;
  try {
    cookieStore = await cookies();
  } catch {
    cookieStore = null;
  }

  const cookieAdapter = {
    get(name: string) {
      return cookieStore?.get?.(name)?.value;
    },
    set(name: string, value: string, options?: CookieOptions) {
      try {
        cookieStore?.set?.({ name, value, ...(options ?? {}) });
      } catch {
        // si non disponible (statique), on ignore
      }
    },
    remove(name: string, options?: CookieOptions) {
      try {
        cookieStore?.set?.({ name, value: "", ...(options ?? {}), maxAge: 0 });
      } catch {
        // si non disponible (statique), on ignore
      }
    },
  };

  return createServerClient(url, anonKey, {
    cookies: cookieAdapter,
  });
}


