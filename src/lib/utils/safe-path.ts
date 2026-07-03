/**
 * Sanitize une cible de redirection interne (open-redirect safe).
 * N'accepte que les chemins relatifs au site ("/...", pas "//..." ni URL absolue).
 */
export function safeInternalPath(path: string | null | undefined, fallback: string): string {
  if (!path) return fallback;
  if (path.startsWith("/") && !path.startsWith("//") && !path.includes("\\")) return path;
  return fallback;
}
