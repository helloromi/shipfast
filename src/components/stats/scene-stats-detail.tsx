import Link from "next/link";
import { LineMasteryPoint, SceneStats } from "@/types/stats";
import { ScoreEvolutionChart } from "./score-evolution-chart";
import { LineMasteryChart } from "./line-mastery-chart";
import { t } from "@/locales/fr";

type SceneStatsDetailProps = {
  stats: SceneStats;
  lineMastery: LineMasteryPoint[];
  sceneId: string;
  lastCharacterId: string | null;
  lastCharacterName: string | null;
  hasCharacters: boolean;
};

export function SceneStatsDetail({
  stats,
  lineMastery,
  sceneId,
  lastCharacterId,
  lastCharacterName,
  hasCharacters,
}: SceneStatsDetailProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} ${t.stats.detail.minutes}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} ${t.stats.detail.hours}`;
    }
    return `${hours}h ${mins}${t.stats.detail.minutesShort}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-semibold text-[#3b1f4a]">
          {t.stats.detail.title}
        </h2>
        <p className="text-sm text-[#524b5a]">{t.stats.detail.description}</p>
      </div>

      {stats.totalSessions === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e7e1d9] bg-white/85 p-6 text-center">
          <p className="text-sm text-[#524b5a]">{t.stats.detail.noSessions}</p>
          {hasCharacters && (
            <Link
              href={lastCharacterId ? `/learn/${sceneId}?character=${lastCharacterId}` : `/scenes/${sceneId}`}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#ff6b6b33] transition hover:-translate-y-[1px]"
            >
              {lastCharacterId
                ? `${t.stats.detail.startWith} ${lastCharacterName ?? t.stats.detail.character}`
                : t.stats.detail.startLearning}
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Métriques clés */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-[#e7e1d9] bg-white/92 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                {t.stats.detail.sessions}
              </div>
              <div className="mt-1 text-2xl font-semibold text-[#3b1f4a]">
                {stats.totalSessions}
              </div>
            </div>
            <div className="rounded-xl border border-[#e7e1d9] bg-white/92 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                {t.stats.detail.timeSpent}
              </div>
              <div className="mt-1 text-2xl font-semibold text-[#3b1f4a]">
                {formatTime(stats.totalTimeMinutes)}
              </div>
            </div>
            <div className="rounded-xl border border-[#e7e1d9] bg-white/92 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                {t.stats.detail.linesLearned}
              </div>
              <div className="mt-1 text-2xl font-semibold text-[#3b1f4a]">
                {stats.totalLinesLearned}
              </div>
            </div>
            <div className="rounded-xl border border-[#e7e1d9] bg-white/92 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#7a7184]">
                {t.stats.detail.averageScore}
              </div>
              <div className="mt-1 text-2xl font-semibold text-[#3b1f4a]">
                {stats.averageScore.toFixed(2)}/3
              </div>
            </div>
          </div>

          {/* Graphique d'évolution */}
          {stats.scoreEvolution.length > 0 && (
            <div className="rounded-2xl border border-[#e7e1d9] bg-white/92 p-5">
              <h3 className="mb-4 font-display text-lg font-semibold text-[#3b1f4a]">
                {t.stats.detail.scoreEvolution}
              </h3>
              <ScoreEvolutionChart data={stats.scoreEvolution} />
            </div>
          )}

          {/* Maîtrise par réplique */}
          {lineMastery.length > 0 && (
            <div className="rounded-2xl border border-[#e7e1d9] bg-white/92 p-5">
              <h3 className="mb-4 font-display text-lg font-semibold text-[#3b1f4a]">
                {t.stats.detail.lineMastery}
              </h3>
              <LineMasteryChart data={lineMastery} />
            </div>
          )}

          {/* Sessions récentes */}
          {stats.recentSessions.length > 0 && (
            <div className="rounded-2xl border border-[#e7e1d9] bg-white/92 p-5">
              <h3 className="mb-4 font-display text-lg font-semibold text-[#3b1f4a]">
                {t.stats.detail.recentSessions}
              </h3>
              <div className="flex flex-col gap-2">
                {stats.recentSessions.map((session, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl border border-[#e7e1d9] bg-white px-4 py-3"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-semibold text-[#1c1b1f]">{session.date}</div>
                      <div className="text-xs text-[#7a7184]">
                        {session.characterName} • {session.durationMinutes} {t.stats.detail.minutes}
                      </div>
                    </div>
                    <div className="rounded-full bg-[#d9f2e4] px-3 py-1 text-xs font-semibold text-[#1c6b4f]">
                      {session.score.toFixed(2)}/3
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA principal */}
          {hasCharacters && (
            <div className="flex justify-center">
              <Link
                href={
                  lastCharacterId
                    ? `/learn/${sceneId}?character=${lastCharacterId}`
                    : `/scenes/${sceneId}`
                }
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#c74884] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#ff6b6b33] transition hover:-translate-y-[1px] hover:shadow-xl"
              >
                {lastCharacterId
                  ? `${t.stats.detail.continueWith} ${lastCharacterName ?? t.stats.detail.character}`
                  : t.stats.detail.startLearning}
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}





