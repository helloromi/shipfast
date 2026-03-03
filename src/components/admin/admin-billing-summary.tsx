"use client";

import { useEffect, useState } from "react";

type BillingItem = {
  userId: string;
  email?: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

type BillingResponse = {
  activeCount: number;
  cancelAtPeriodEndCount: number;
  items: BillingItem[];
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function AdminBillingSummary() {
  const [data, setData] = useState<BillingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/dashboard/billing")
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? "Erreur");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-[#524b5a]">
        Chargement…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-red-600">
        {error ?? "Impossible de charger les données"}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <div className="rounded-xl border border-[#e7e1d9] bg-[#f9f7f3] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[#7a7184]">
            Abonnements actifs
          </p>
          <p className="text-2xl font-semibold text-[#3b1f4a]">{data.activeCount}</p>
        </div>
        <div className="rounded-xl border border-[#e7e1d9] bg-[#f9f7f3] px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[#7a7184]">
            Annulation en fin de période
          </p>
          <p className="text-2xl font-semibold text-[#3b1f4a]">
            {data.cancelAtPeriodEndCount}
          </p>
        </div>
      </div>
      {data.items.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-[#e7e1d9]">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e7e1d9] bg-[#f9f7f3]">
                <th className="px-3 py-2 font-semibold text-[#3b1f4a]">Email</th>
                <th className="px-3 py-2 font-semibold text-[#3b1f4a]">Statut</th>
                <th className="px-3 py-2 font-semibold text-[#3b1f4a]">Fin de période</th>
                <th className="px-3 py-2 font-semibold text-[#3b1f4a]">Annulation</th>
              </tr>
            </thead>
            <tbody>
              {data.items.slice(0, 20).map((item) => (
                <tr key={item.userId} className="border-b border-[#e7e1d9]">
                  <td className="px-3 py-2 text-[#1c1b1f]">
                    {item.email ?? item.userId.slice(0, 8) + "…"}
                  </td>
                  <td className="px-3 py-2 text-[#524b5a]">{item.status}</td>
                  <td className="px-3 py-2 text-[#524b5a]">
                    {formatDate(item.currentPeriodEnd)}
                  </td>
                  <td className="px-3 py-2 text-[#524b5a]">
                    {item.cancelAtPeriodEnd ? "Oui" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
