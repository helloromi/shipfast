import { NextRequest, NextResponse } from "next/server";
import { getArticlesList } from "@/content/ressources/articles";

function getBaseUrl(request: NextRequest): string {
  const origin = request.nextUrl.origin;
  if (origin && origin.startsWith("http")) return origin;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://cote-cour.studio";
  return base.startsWith("http") ? base : `https://${base}`;
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
