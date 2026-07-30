import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase-env";

/**
 * Client Supabase anonyme SANS cookies, pour les lectures du catalogue public.
 *
 * `createSupabaseServerClient()` appelle `cookies()`. Or lire les cookies bascule
 * la route entière en rendu dynamique : c'est ce qui rendait `ƒ` toutes les routes
 * publiques du site, jusqu'aux pages qui ne regardent aucune session. Conséquence
 * mesurée : `Cache-Control: private, no-store` partout, un rendu serveur plus un
 * aller-retour Supabase à chaque passage de Googlebot, et le `generateStaticParams`
 * de /ressources/[slug] rendu inerte.
 *
 * Le contenu du domaine public est lisible par le rôle anon sous RLS — c'est la
 * règle produit n°1, tout le domaine public est accessible sans compte. Une session
 * n'apporte donc rien à ces requêtes-là, et s'en passer rend la route cachable.
 *
 * À n'utiliser que pour des données publiques par construction. Toute lecture dont
 * le résultat dépend de l'utilisateur (copies privées, imports, progression,
 * classes) doit continuer de passer par `createSupabaseServerClient()`, sinon la RLS
 * ne verra plus la session et renverra des résultats vides — ou pire, la page
 * servirait un cache commun à tous les utilisateurs.
 */
export function createSupabasePublicClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
