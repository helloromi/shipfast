import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getArticleBySlug, getArticlesList } from "@/content/ressources/articles";
import { buildOpenGraph, buildTwitter } from "@/lib/seo/open-graph";
import { firstThatFits, TITLE_MAX } from "@/lib/seo/text";

const BASE_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.cote-cour.studio").replace(/\/$/, "");

type Props = { params: Promise<{ slug: string }> };

// Le layout racine ne lit plus les cookies : generateStaticParams a de nouveau un
// effet réel (il n'en avait aucun tant que tout l'arbre était rendu dynamiquement).
// Les 5 articles vivent dans le code, sans I/O : ils sont prérendus au build.
export function generateStaticParams() {
  return getArticlesList().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  const url = `${BASE_URL}/ressources/${slug}`;
  // Le suffixe de marque n'est ajouté que s'il tient dans la limite affichée par
  // Google : « Comment apprendre son texte de théâtre : la méthode flashcard | Côté-Cour »
  // faisait 73 caractères, le suffixe était donc coupé de toute façon.
  const title =
    article.metaTitle ?? firstThatFits([`${article.title} | Côté-Cour`, article.title], TITLE_MAX);

  return {
    title,
    description: article.description,
    alternates: { canonical: url },
    // buildOpenGraph re-déclare type, locale ET images : Next ne fusionne pas
    // openGraph en profondeur avec le layout parent (cf. src/lib/seo/open-graph.ts).
    openGraph: buildOpenGraph({
      title,
      description: article.description,
      url,
      type: article.ogType ?? "article",
    }),
    twitter: buildTwitter({ title, description: article.description }),
  };
}

export default async function RessourceArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const Body = article.Body;
  const pageUrl = `${BASE_URL}/ressources/${slug}`;

  const articleNode = {
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt.toISOString(),
    author: { "@type": "Organization", name: "Côté-Cour" },
    publisher: {
      "@type": "Organization",
      name: "Côté-Cour",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/apple-touch-icon.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
  };

  // Page liste : on ajoute un ItemList (chaque monologue → sa page scène) à côté de
  // l'Article. Article seul pour une page éditoriale classique.
  const jsonLd =
    article.listItems && article.listItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@graph": [
            articleNode,
            {
              "@type": "ItemList",
              name: article.title,
              itemListOrder: "https://schema.org/ItemListOrderAscending",
              numberOfItems: article.listItems.length,
              itemListElement: article.listItems.map((item, i) =>
                item.author
                  ? {
                      "@type": "ListItem",
                      position: i + 1,
                      item: {
                        "@type": "CreativeWork",
                        name: item.name,
                        url: `${BASE_URL}${item.href}`,
                        author: { "@type": "Person", name: item.author },
                        ...(item.work
                          ? { isPartOf: { "@type": "CreativeWork", name: item.work } }
                          : {}),
                      },
                    }
                  : {
                      "@type": "ListItem",
                      position: i + 1,
                      name: item.name,
                      url: `${BASE_URL}${item.href}`,
                    },
              ),
            },
          ],
        }
      : { "@context": "https://schema.org", ...articleNode };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/ressources"
        className="text-sm font-semibold text-[#3b1f4a] underline-offset-4 hover:underline"
      >
        ← Ressources
      </Link>

      <article className="flex flex-col gap-4 rounded-2xl border border-[#e7e1d9] bg-white/92 p-6 shadow-sm shadow-[#3b1f4a14] sm:p-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
            Article
          </p>
          <h1 className="font-display text-2xl font-semibold text-[#1c1b1f] sm:text-3xl">
            {article.title}
          </h1>
          <p className="text-sm text-[#7a7184]">
            {article.publishedAt.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </header>

        <div className="flex flex-col gap-3">
          <Body />
        </div>
      </article>
    </div>
  );
}
