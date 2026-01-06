"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type FilterSortProps = {
  authors: string[];
  hasQuery: boolean;
};

export function FiltersSort({ authors, hasQuery }: FilterSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentAuthor = searchParams.get("author") || "";
  const currentSort = searchParams.get("sort") || "title";

  const handleFilterChange = (author: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (author && author !== "all") {
        params.set("author", author);
      } else {
        params.delete("author");
      }
      router.push(`/bibliotheque?${params.toString()}`);
    });
  };

  const handleSortChange = (sort: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (sort && sort !== "title") {
        params.set("sort", sort);
      } else {
        params.delete("sort");
      }
      router.push(`/bibliotheque?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {authors.length > 0 && (
        <div className="flex items-center gap-2">
          <label htmlFor="author-filter" className="text-sm font-semibold text-[#3b1f4a]">
            Auteur:
          </label>
          <select
            id="author-filter"
            value={currentAuthor || "all"}
            onChange={(e) => handleFilterChange(e.target.value)}
            disabled={isPending}
            className="rounded-lg border border-[#e7e1d9] bg-white px-3 py-1.5 text-sm text-[#1c1b1f] focus:border-[#3b1f4a] focus:outline-none disabled:opacity-50"
          >
            <option value="all">Tous les auteurs</option>
            {authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-sm font-semibold text-[#3b1f4a]">
          Trier par:
        </label>
        <select
          id="sort"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          disabled={isPending}
          className="rounded-lg border border-[#e7e1d9] bg-white px-3 py-1.5 text-sm text-[#1c1b1f] focus:border-[#3b1f4a] focus:outline-none disabled:opacity-50"
        >
          <option value="title">Alphabétique</option>
          <option value="scenes">Nombre de scènes</option>
          <option value="mastery">Maîtrise</option>
        </select>
      </div>
    </div>
  );
}

