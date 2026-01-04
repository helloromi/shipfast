import { UserStatsSummary } from "@/types/stats";
import { t } from "@/locales/fr";

type StatsSummaryCardProps = {
  stats: UserStatsSummary;
};

export function StatsSummaryCard({ stats }: StatsSummaryCardProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} ${t.stats.summary.minutes}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} ${t.stats.summary.hours}`;
    }
    return `${hours}h ${mins}${t.stats.summary.minutesShort}`;
  };

  return (
    <div className="rounded-2xl border border-[#e7e1d9] bg-white/92 p-5 shadow-sm shadow-[#3b1f4a14]">
      <h3 className="mb-4 font-display text-lg font-semibold text-[#3b1f4a]">
        {t.stats.summary.title}
      </h3>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#3b1f4a]">{stats.totalSessions}</span>
          <span className="text-[#524b5a]">{t.stats.summary.sessions}</span>
        </div>
        <span className="text-[#7a7184]">•</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#3b1f4a]">{formatTime(stats.totalTimeMinutes)}</span>
          <span className="text-[#524b5a]">{t.stats.summary.timeSpent}</span>
        </div>
        <span className="text-[#7a7184]">•</span>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#3b1f4a]">
            {stats.averageScore.toFixed(2)}/3
          </span>
          <span className="text-[#524b5a]">{t.stats.summary.averageScore}</span>
        </div>
        {stats.currentStreak > 0 && (
          <>
            <span className="text-[#7a7184]">•</span>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#f4c95d33] px-2 py-1 text-xs font-semibold text-[#3b1f4a]">
                🔥 {stats.currentStreak} {t.stats.summary.streak}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



