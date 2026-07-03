import { NextRequest, NextResponse } from "next/server";
import { getArticlesList } from "@/content/ressources/articles";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function getBaseUrl(request: NextRequest): string {
  // Env d'abord : l'origin de la requête peut être un domaine de preview Vercel.
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (base) return base.startsWith("http") ? base : `https://${base}`;
  const origin = request.nextUrl.origin;
  if (origin && origin.startsWith("http")) return origin;
  return "https://cote-cour.studio";
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request).replace(/\/$/, "");
  const articles = getArticlesList();

  // Toutes les scènes publiques (RLS autorise la lecture anonyme sur is_private = false).
  // `scenes` n'a pas de colonne updated_at : created_at sert de lastmod.
  const supabase = await createSupabaseServerClient();
  const { data: publicScenes, error: scenesError } = await supabase
    .from("scenes")
    .select("id, created_at, works!inner(is_public_domain)")
    .eq("is_private", false)
    .eq("works.is_public_domain", true);
  if (scenesError) {
    console.error("sitemap: failed to fetch public scenes", scenesError);
  }

  const entries: { loc: string; lastmod: string; changefreq: string; priority: number }[] = [
    {
      loc: `${baseUrl}/landing`,
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: "monthly",
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/ressources`,
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/scenes`,
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: "weekly",
      priority: 0.9,
    },
    ...(publicScenes ?? []).map((scene) => ({
      loc: `${baseUrl}/scenes/${encodeURIComponent(scene.id)}`,
      lastmod: String(scene.created_at ?? "").slice(0, 10) || new Date().toISOString().slice(0, 10),
      changefreq: "monthly",
      priority: 0.8,
    })),
    ...articles.map((a) => ({
      loc: `${baseUrl}/ressources/${encodeURIComponent(a.slug)}`,
      lastmod: a.publishedAt instanceof Date ? a.publishedAt.toISOString().slice(0, 10) : String(a.publishedAt).slice(0, 10),
      changefreq: "monthly",
      priority: 0.7,
    })),
    {
      loc: `${baseUrl}/confidentialite`,
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: "yearly",
      priority: 0.3,
    },
  ];

  const urlLines = entries.map(
    (e) =>
      "<url>" +
      "<loc>" + escapeXml(e.loc) + "</loc>" +
      "<lastmod>" + escapeXml(e.lastmod) + "</lastmod>" +
      "<changefreq>" + escapeXml(e.changefreq) + "</changefreq>" +
      "<priority>" + String(e.priority) + "</priority>" +
      "</url>"
  );

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    urlLines.join("") +
    "</urlset>";

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
