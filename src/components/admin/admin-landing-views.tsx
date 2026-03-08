"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type GroupBy = "day" | "week" | "month";

type LandingViewsResponse = {
  total: number;
  ctaClicksTotal: number;
  series: { period: string; count: number; ctaClicks: number }[];
};

/** Formate une date YYYY-MM-DD en DD/MM/YY */
function formatDateDDMMYY(iso: string): string {
  if (iso.length < 10) return iso;
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(2, 4)}`;
}

/** Formate une période mois YYYY-MM-01 en MM/YY */
function formatMonthMMYY(iso: string): string {
  if (iso.length < 7) return iso;
  return `${iso.slice(5, 7)}/${iso.slice(2, 4)}`;
}

export function AdminLandingViews() {
  const [groupBy, setGroupBy] = useState<GroupBy>("day");
  const [data, setData] = useState<LandingViewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback((g: GroupBy) => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/dashboard/landing-views?groupBy=${g}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then((d) => setData(d))
      .catch((e) => setError(e.message ?? "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData(groupBy);
  }, [groupBy, fetchData]);

  const chartData = data?.series.map((s) => ({
    ...s,
    label:
      groupBy === "month"
        ? formatMonthMMYY(s.period)
        : formatDateDDMMYY(s.period),
  })) ?? [];

  const interval = groupBy === "day" ? 4 : groupBy === "week" ? 2 : 0;

  return (
    <div className="flex flex-col gap-4">
      {loading && !data ? (
        <div className="flex items-center justify-center py-6 text-sm text-[#524b5a]">
          Chargement…
        </div>
      ) : error && !data ? (
        <div className="flex items-center justify-center py-6 text-sm text-red-600">
          {error}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <p className="text-2xl font-semibold text-[#1c1b1f]">
              {data?.total.toLocaleString("fr-FR") ?? 0} vue
              {(data?.total ?? 0) !== 1 ? "s" : ""} de la page d’accueil
            </p>
            <p className="text-lg font-medium text-[#524b5a]">
              {(data?.ctaClicksTotal ?? 0).toLocaleString("fr-FR")} clic
              {(data?.ctaClicksTotal ?? 0) !== 1 ? "s" : ""} sur « Se connecter »
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["day", "week", "month"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroupBy(g)}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  groupBy === g
                    ? "border-[#3b1f4a] bg-[#3b1f4a] text-white"
                    : "border-[#e7e1d9] bg-white text-[#3b1f4a] hover:border-[#3b1f4a66]"
                }`}
              >
                {g === "day" && "Par jour"}
                {g === "week" && "Par semaine"}
                {g === "month" && "Par mois"}
              </button>
            ))}
          </div>

          <div className="h-64">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-[#524b5a]">
                Chargement du graphe…
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 28 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e1d9" />
                  <XAxis
                    dataKey="label"
                    stroke="#7a7184"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval={interval}
                  />
                  <YAxis
                    stroke="#7a7184"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e7e1d9",
                      borderRadius: "8px",
                      padding: "8px 12px",
                    }}
                    formatter={(value: number | undefined, name?: string) => [
                      value ?? 0,
                      name === "count" ? "Vues" : "Clics CTA",
                    ]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.period
                        ? groupBy === "month"
                          ? formatMonthMMYY(payload[0].payload.period)
                          : `Date: ${formatDateDDMMYY(payload[0].payload.period)}`
                        : ""
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="count"
                    stroke="#3b1f4a"
                    strokeWidth={2}
                    dot={{ fill: "#3b1f4a", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ctaClicks"
                    name="ctaClicks"
                    stroke="#7a7184"
                    strokeWidth={2}
                    dot={{ fill: "#7a7184", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
