"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type SupabaseProviderProps = {
  children: ReactNode;
  initialSession: Session | null;
};

type SupabaseContextValue = {
  supabase: SupabaseClient;
  session: Session | null;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(undefined);

export function SupabaseProvider({ children, initialSession }: SupabaseProviderProps) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [session, setSession] = useState<Session | null>(initialSession);
  const router = useRouter();
  const exchangingRef = useRef(false);

  useEffect(() => {
    // Hydrate user via getUser (authentifié par Supabase)
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setSession((prev) => (prev ? { ...prev, user: data.user } : (null as Session | null)));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Gère le code PKCE du magic link côté client (permet de créer la session même si les cookies ne sont pas mutables côté serveur)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    if (!code || exchangingRef.current) return;
    exchangingRef.current = true;

    supabase.auth
      .exchangeCodeForSession(code)
      .then(() => {
        const params = new URLSearchParams(window.location.search);
        params.delete("code");
        params.delete("next");
        const query = params.toString();
        const path = window.location.pathname + (query ? `?${query}` : "");
        router.replace(path);
      })
      .catch((error) => {
        console.error("exchangeCodeForSession error", error);
      })
      .finally(() => {
        exchangingRef.current = false;
      });
  }, [supabase, router]);

  const value: SupabaseContextValue = {
    supabase,
    session,
  };

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase doit être utilisé dans un SupabaseProvider");
  }
  return context;
}




