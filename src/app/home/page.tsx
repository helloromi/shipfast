import Link from "next/link";
import { redirect } from "next/navigation";

import { fetchUserProgressScenes, getSupabaseSessionUser } from "@/lib/queries/scenes";
import { fetchUserStatsSummary } from "@/lib/queries/stats";
import { StatsSummaryCard } from "@/components/stats/stats-summary-card";
import { t } from "@/locales/fr";

export default async function HomePage() {
  const user = await getSupabaseSessionUser();
  if (!user) {
    redirect("/login");
  }

  const [progresses, statsSummary] = await Promise.all([
    fetchUserProgressScenes(user.id),
    fetchUserStatsSummary(user.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b1f4a]">{t.home.sectionLabel}</p>
        <h1 className="font-display text-3xl font-semibold text-[#1c1b1f]">
          {t.home.title}
        </h1>
        <p className="text-sm text-[#524b5a] leading-relaxed">
          {t.home.description}
        </p>
      </div>

      <StatsSummaryCard stats={statsSummary} />

      {progresses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#e7e1d9] bg-white/85 p-4 text-sm text-[#524b5a]">
          {t.home.empty.message}{" "}
          <Link href="/scenes" className="font-semibold text-[#3b1f4a] underline underline-offset-4">
            {t.home.empty.bibliotheque}
          </Link>{" "}
          {t.home.empty.pourDemarrer}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {progresses.map((item) => (
          <div
            key={item.sceneId}
            className="flex h-full flex-col gap-3 rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-md shadow-[#3b1f4a14]"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
                {item.title}
              </h2>
              <span className="rounded-full bg-[#d9f2e4] px-3 py-1 text-xs font-semibold text-[#1c6b4f]">
                {t.home.labels.maitrise} {item.average.toFixed(2)} {t.home.labels.sur}
              </span>
            </div>
            <p className="text-sm text-[#524b5a]">
              {item.author ? `${t.common.labels.par} ${item.author}` : t.common.labels.auteurInconnu}
            </p>
            {item.summary && (
              <p className="text-sm text-[#1c1b1f] leading-relaxed line-clamp-3">
                {item.summary}
              </p>
            )}
            <div className="flex items-center justify-between gap-2 text-sm text-[#524b5a]">
              <span>{t.home.labels.personnage} {item.lastCharacterName ?? "—"}</span>
              {item.chapter && <span className="text-[11px] font-semibold uppercase tracking-wide text-[#7a7184]">{t.common.labels.chapitre} : {item.chapter}</span>}
            </div>
            <div className="mt-2 flex gap-2">
              <Link
                href={
                  item.lastCharacterId
                    ? `/learn/${item.sceneId}?character=${item.lastCharacterId}`
                    : `/scenes/${item.sceneId}`
                }
                className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-3 py-2 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] hover:-translate-y-[1px]"
              >
                {t.home.buttons.continuer}
              </Link>
              <Link
                href={`/scenes/${item.sceneId}`}
                className="inline-flex items-center justify-center rounded-full border border-[#e7e1d9] bg-white px-3 py-2 text-sm font-semibold text-[#3b1f4a] shadow-sm hover:border-[#3b1f4a66]"
              >
                {t.home.buttons.details}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


