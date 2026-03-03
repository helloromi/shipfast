import type { Metadata } from "next";
import Link from "next/link";

import { getArticlesList } from "@/content/ressources/articles";

export const metadata: Metadata = {
  title: "Ressources | Côté-Cour",
  description:
    "Conseils et articles pour apprendre tes textes de théâtre, mémoriser tes répliques et progresser en cours de théâtre.",
};

export default function RessourcesPage() {
  const articles = getArticlesList();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">
          Blog
        </p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          Ressources
        </h1>
        <p className="text-sm text-[#524b5a]">
          Conseils et astuces pour mémoriser tes textes et progresser en théâtre.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/ressources/${article.slug}`}
            className="block rounded-2xl border border-[#e7e1d9] bg-white/92 p-6 shadow-sm shadow-[#3b1f4a14] transition hover:-translate-y-[1px] hover:shadow-md"
          >
            <h2 className="font-display text-lg font-semibold text-[#3b1f4a]">
              {article.title}
            </h2>
            <p className="mt-2 text-sm text-[#524b5a] line-clamp-2">
              {article.description}
            </p>
            <p className="mt-3 text-xs text-[#7a7184]">
              {article.publishedAt.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
