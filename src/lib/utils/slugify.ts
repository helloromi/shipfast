/**
 * Slug URL-safe : minuscules, sans accents, tirets. Utilisee a la fois par le
 * script de backfill (supabase/seed/backfill-scene-slugs.ts) et par le code
 * applicatif (resolution de route, sitemap) - meme fonction partout pour que
 * le segment auteur calcule a la volee reste toujours identique.
 */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
