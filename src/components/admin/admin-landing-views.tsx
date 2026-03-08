"use client";

import { useEffect, useState } from "react";

type LandingViewsResponse = {
  total: number;
};

export function AdminLandingViews() {
  const [data, setData] = useState<LandingViewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/dashboard/landing-views")
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
      <div className="flex items-center justify-center py-6 text-sm text-[#524b5a]">
        Chargement…
      </div>
    );
  }
  if (error || data === null) {
    return (
      <div className="flex items-center justify-center py-6 text-sm text-red-600">
        {error ?? "Impossible de charger les données"}
      </div>
    );
  }

  return (
    <p className="text-2xl font-semibold text-[#1c1b1f]">
      {data.total.toLocaleString("fr-FR")} vue{data.total !== 1 ? "s" : ""} de la page d’accueil
    </p>
  );
}
