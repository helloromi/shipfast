"use client";

import { useEffect, useState } from "react";

type Summary = {
  totalSessions: number;
  totalTimeMinutes: number;
  totalScenesWorked: number;
  averageScore: number;
  currentStreak: number;
  lastActivityDate: string | null;
};

type RecentSession = {
  id: string;
  date: string;
  durationMinutes: number;
  score: number;
  characterName: string;
};

type ActivityResponse = {
  summary: Summary;
  recentSessions: RecentSession[];
  subscription: {
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

type Props = {
  userId: string;
  userEmail?: string;
  open: boolean;
  onClose: () => void;
};

export function AdminUserActivityDrawer({ userId, userEmail, open, onClose }: Props) {
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    setError(null);
    setData(null);
    fetch(`/api/admin/dashboard/users/${encodeURIComponent(userId)}/activity`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then((d) => setData(d))
      .catch((e) => setError(e.message ?? "Erreur"))
      .finally(() => setLoading(false));
  }, [open, userId]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-[#e7e1d9] bg-white shadow-xl"
        role="dialog"
        aria-label="Détail activité utilisateur"
      >
        <div className="flex items-center justify-between border-b border-[#e7e1d9] px-4 py-3">
          <h3 className="font-display text-lg font-semibold text-[#1c1b1f]">
            Activité · {userEmail ?? userId.slice(0, 8) + "…"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#524b5a] hover:bg-[#f4c95d33]"
            aria-label="Fermer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && (
            <div className="flex justify-center py-8 text-sm text-[#524b5a]">
              Chargement…
            </div>
          )}
          {error && (
            <div className="py-4 text-sm text-red-600">{error}</div>
          )}
          {data && !loading && (
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border border-[#e7e1d9] bg-[#f9f7f3] p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#7a7184]">
                  Résumé
                </p>
                <ul className="space-y-1 text-sm text-[#1c1b1f]">
                  <li>Sessions : {data.summary.totalSessions}</li>
                  <li>Temps total : {data.summary.totalTimeMinutes} min</li>
                  <li>Scènes travaillées : {data.summary.totalScenesWorked}</li>
                  <li>Score moyen : {data.summary.averageScore.toFixed(2)}</li>
                  <li>Série actuelle : {data.summary.currentStreak} jour(s)</li>
                  <li>
                    Dernière activité :{" "}
                    {data.summary.lastActivityDate
                      ? formatDate(data.summary.lastActivityDate)
                      : "—"}
                  </li>
                </ul>
              </div>
              {data.subscription && (
                <div className="rounded-xl border border-[#e7e1d9] bg-[#f9f7f3] p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#7a7184]">
                    Abonnement
                  </p>
                  <ul className="space-y-1 text-sm text-[#1c1b1f]">
                    <li>Statut : {data.subscription.status}</li>
                    <li>
                      Fin de période :{" "}
                      {data.subscription.currentPeriodEnd
                        ? formatDate(data.subscription.currentPeriodEnd)
                        : "—"}
                    </li>
                    {data.subscription.cancelAtPeriodEnd && (
                      <li className="text-amber-700">Annulation en fin de période</li>
                    )}
                  </ul>
                </div>
              )}
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#7a7184]">
                  Dernières sessions
                </p>
                {data.recentSessions.length === 0 ? (
                  <p className="text-sm text-[#524b5a]">Aucune session</p>
                ) : (
                  <ul className="space-y-2">
                    {data.recentSessions.map((s) => (
                      <li
                        key={s.id}
                        className="rounded-lg border border-[#e7e1d9] px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-[#1c1b1f]">
                          {formatDate(s.date)}
                        </span>
                        <span className="ml-2 text-[#524b5a]">
                          {s.durationMinutes} min · {s.characterName} · score {s.score.toFixed(1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
