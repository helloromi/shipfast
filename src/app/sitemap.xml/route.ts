import { NextRequest, NextResponse } from "next/server";
import { getArticlesList } from "@/content/ressources/articles";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { isThinScene } from "@/lib/seo/thin-scenes";
import { slugify } from "@/lib/utils/slugify";

function getBaseUrl(request: NextRequest): string {
  // Env d'abord : l'origin de la requête peut être un domaine de preview Vercel.
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (base) return base.startsWith("http") ? base : `https://${base}`;
  const origin = request.nextUrl.origin;
  if (origin && origin.startsWith("http")) return origin;
  return "https://www.cote-cour.studio";
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

  // Toutes les scènes publiques du domaine public, avec slug (RLS autorise la
  // lecture anonyme sur is_private = false). URLs slug uniquement : les UUID
  // redirigent en 308 depuis /scenes/[identifiant] et n'ont rien à faire dans le sitemap.
  // `lastmod` = updated_at, tenu à jour par trigger — y compris quand seules les
  // répliques changent (re-sourcing de texte), cf. migration 20260731130000.
  // created_at sert de repli pour une ligne antérieure à la colonne.
  // `lines(text)` est chargé pour appliquer le seuil de contenu mince : une scène
  // écartée par isThinScene se sert en noindex, elle n'a donc rien à faire ici.
  // Sans ce join, sitemap et metadata trancheraient sur des critères différents.
  const supabase = await createSupabaseServerClient();

  type SceneRow = {
    slug: string;
    author: string | null;
    summary: string | null;
    created_at: string | null;
    updated_at?: string | null;
    works: { slug: string | null };
    lines: { text: string | null }[];
  };

  const sceneColumns = (withUpdatedAt: boolean) =>
    `slug, author, summary, created_at${withUpdatedAt ? ", updated_at" : ""}, works!inner(slug, is_public_domain), lines(text)`;

  const fetchScenes = (withUpdatedAt: boolean) =>
    supabase
      .from("scenes")
      .select(sceneColumns(withUpdatedAt))
      .eq("is_private", false)
      .eq("works.is_public_domain", true)
      .not("slug", "is", null)
      .returns<SceneRow[]>();

  let { data: publicScenes, error: scenesError } = await fetchScenes(true);
  if (scenesError) {
    // La colonne updated_at arrive par migration : si le code est déployé avant
    // qu'elle soit appliquée, PostgREST rejette la requête entière et le sitemap
    // se viderait. On retombe sur created_at le temps que la migration passe,
    // plutôt que de créer une dépendance d'ordre entre deploy et migration.
    console.warn("sitemap: retry sans updated_at (migration pas encore appliquée ?)", scenesError);
    ({ data: publicScenes, error: scenesError } = await fetchScenes(false));
  }
  if (scenesError) {
    console.error("sitemap: failed to fetch public scenes", scenesError);
  }
  const indexableScenes = (publicScenes ?? []).filter(
    (scene) => !isThinScene({ lines: scene.lines ?? [], summary: scene.summary })
  );

  // Pages œuvre (/scenes/[auteur]/[piece]) : même portée que les scènes ci-dessus.
  // `!inner` sur scenes garantit qu'on n'émet pas l'URL d'une œuvre sans scène
  // publiable — la route répondrait 404.
  const { data: publicWorks, error: worksError } = await supabase
    .from("works")
    .select("slug, author, scenes!inner(id, is_private, slug)")
    .eq("is_public_domain", true)
    .not("slug", "is", null)
    .eq("scenes.is_private", false)
    .not("scenes.slug", "is", null)
    .returns<{ slug: string; author: string | null; scenes: { id: string }[] }[]>();
  if (worksError) {
    console.error("sitemap: failed to fetch public works", worksError);
  }

  // Une œuvre dont toutes les scènes sont écartées comme trop minces n'a rien à
  // faire au sitemap non plus : sa page ne listerait que des URLs en noindex.
  // Cas réel : Roméo & Juliette, une seule scène de 4 répliques.
  const workSlugsWithIndexableScene = new Set(
    indexableScenes.map((scene) => scene.works?.slug).filter((slug): slug is string => !!slug)
  );

  // `works` n'a pas de created_at exploitable ici : le lastmod d'une page œuvre est
  // la date de la scène la plus récemment ajoutée à cette œuvre.
  const latestSceneDateByWorkSlug = new Map<string, string>();
  for (const scene of publicScenes ?? []) {
    const workSlug = scene.works?.slug;
    if (!workSlug) continue;
    const date = String(scene.updated_at ?? scene.created_at ?? "").slice(0, 10);
    if (!date) continue;
    const current = latestSceneDateByWorkSlug.get(workSlug);
    if (!current || date > current) latestSceneDateByWorkSlug.set(workSlug, date);
  }

  const entries: { loc: string; lastmod: string; changefreq: string; priority: number }[] = [
    {
      loc: `${baseUrl}/landing`,
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: "monthly",
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/professeurs`,
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: "monthly",
      priority: 0.8,
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
    // Palier œuvre : priorité entre la page liste (0.9) et les pages scènes (0.8).
    ...(publicWorks ?? [])
      .filter((work) => workSlugsWithIndexableScene.has(work.slug))
      .map((work) => ({
        loc: `${baseUrl}/scenes/${encodeURIComponent(slugify(work.author ?? ""))}/${encodeURIComponent(work.slug)}`,
        lastmod:
          latestSceneDateByWorkSlug.get(work.slug) ?? new Date().toISOString().slice(0, 10),
        changefreq: "monthly",
        priority: 0.85,
      })),
    ...indexableScenes
      .filter((scene) => !!scene.works?.slug)
      .map((scene) => {
        const authorSlug = slugify(scene.author ?? "");
        return {
          loc: `${baseUrl}/scenes/${encodeURIComponent(authorSlug)}/${encodeURIComponent(scene.works.slug!)}/${encodeURIComponent(scene.slug)}`,
          lastmod:
            String(scene.updated_at ?? scene.created_at ?? "").slice(0, 10) ||
            new Date().toISOString().slice(0, 10),
          changefreq: "monthly",
          priority: 0.8,
        };
      }),
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
