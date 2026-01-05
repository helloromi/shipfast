import Link from "next/link";
import { redirect } from "next/navigation";

import { fetchUserProgressScenes, getSupabaseSessionUser } from "@/lib/queries/scenes";
import { fetchUserStatsSummary } from "@/lib/queries/stats";
import { StatsSummaryCard } from "@/components/stats/stats-summary-card";
import { SceneCard } from "@/components/home/scene-card";
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
          <SceneCard key={item.sceneId} scene={item} />
        ))}
      </div>
    </div>
  );
}




