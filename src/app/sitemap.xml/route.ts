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

/**
 * Dates de dernière modification des pages dont le contenu vit dans le code, pas en
 * base : rien ne permet de les dériver à l'exécution.
 *
 * Elles portaient toutes `new Date()`, c'est-à-dire « modifiée aujourd'hui », à chaque
 * requête. Un domaine dont le sitemap annonce cinq pages modifiées tous les jours
 * apprend à Google à ignorer ses `lastmod` — y compris ceux des pages scènes, qui eux
 * sont exacts (colonne `updated_at` + triggers, migration 20260731130000). C'était
 * donc un signal faux qui abîmait un signal vrai.
 *
 * ⚠️ À mettre à jour à la main en même temps que le contenu de la page concernée.
 * Valeurs initiales = date du dernier commit ayant touché chaque page.
 */
const STATIC_PAGE_LASTMOD = {
  landing: "2026-07-30",
  professeurs: "2026-07-30",
  ressources: "2026-07-30",
  scenes: "2026-07-30",
  confidentialite: "2026-03-08",
} as const;

/** Date ISO courte (YYYY-MM-DD), ou undefined si la valeur n'est pas exploitable. */
function isoDate(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  const iso = value instanceof Date ? value.toISOString() : String(value);
  const date = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
}

/** Plus grande date d'une liste (format ISO court : l'ordre lexical suffit). */
function maxDate(dates: (string | undefined)[]): string | undefined {
  return dates.filter((d): d is string => !!d).sort().at(-1);
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

  // Date du contenu le plus récent du catalogue : c'est ce qui date la page liste
  // /scenes, dont le corps EST ce catalogue. Un lot seedé la fait bouger, rien d'autre.
  const latestSceneDate = maxDate(
    indexableScenes.map((scene) => String(scene.updated_at ?? scene.created_at ?? "").slice(0, 10))
  );
  // Idem pour /ressources : l'index des guides date du guide le plus récent.
  const latestArticleDate = maxDate(articles.map((a) => isoDate(a.publishedAt)));

  const entries: {
    loc: string;
    /** Optionnel : mieux vaut pas de `lastmod` du tout qu'un `lastmod` inventé. */
    lastmod?: string;
    changefreq: string;
    priority: number;
  }[] = [
    {
      loc: `${baseUrl}/landing`,
      lastmod: STATIC_PAGE_LASTMOD.landing,
      changefreq: "monthly",
      priority: 0.9,
    },
    {
      loc: `${baseUrl}/professeurs`,
      lastmod: STATIC_PAGE_LASTMOD.professeurs,
      changefreq: "monthly",
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/ressources`,
      lastmod: latestArticleDate ?? STATIC_PAGE_LASTMOD.ressources,
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      loc: `${baseUrl}/scenes`,
      lastmod: latestSceneDate ?? STATIC_PAGE_LASTMOD.scenes,
      changefreq: "weekly",
      priority: 0.9,
    },
    // Palier œuvre : priorité entre la page liste (0.9) et les pages scènes (0.8).
    ...(publicWorks ?? [])
      .filter((work) => workSlugsWithIndexableScene.has(work.slug))
      .map((work) => ({
        loc: `${baseUrl}/scenes/${encodeURIComponent(slugify(work.author ?? ""))}/${encodeURIComponent(work.slug)}`,
        lastmod: latestSceneDateByWorkSlug.get(work.slug),
        changefreq: "monthly",
        priority: 0.85,
      })),
    ...indexableScenes
      .filter((scene) => !!scene.works?.slug)
      .map((scene) => {
        const authorSlug = slugify(scene.author ?? "");
        return {
          loc: `${baseUrl}/scenes/${encodeURIComponent(authorSlug)}/${encodeURIComponent(scene.works.slug!)}/${encodeURIComponent(scene.slug)}`,
          lastmod: String(scene.updated_at ?? scene.created_at ?? "").slice(0, 10) || undefined,
          changefreq: "monthly",
          priority: 0.8,
        };
      }),
    ...articles.map((a) => ({
      loc: `${baseUrl}/ressources/${encodeURIComponent(a.slug)}`,
      lastmod: isoDate(a.publishedAt),
      changefreq: "monthly",
      priority: 0.7,
    })),
    {
      loc: `${baseUrl}/confidentialite`,
      lastmod: STATIC_PAGE_LASTMOD.confidentialite,
      changefreq: "yearly",
      priority: 0.3,
    },
  ];

  // `<lastmod>` est optionnel dans la spec sitemap : on l'omet plutôt que d'émettre
  // une date qu'on ne connaît pas.
  const urlLines = entries.map(
    (e) =>
      "<url>" +
      "<loc>" + escapeXml(e.loc) + "</loc>" +
      (e.lastmod ? "<lastmod>" + escapeXml(e.lastmod) + "</lastmod>" : "") +
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
