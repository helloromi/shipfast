"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ActivityResponse = {
  daily: { date: string; count: number; label?: string }[];
  weekly: { period: string; count: number; label?: string }[];
};

export function AdminActivityCharts() {
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/dashboard/activity")
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
      <div className="flex h-64 items-center justify-center text-sm text-[#524b5a]">
        Chargement…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-red-600">
        {error ?? "Impossible de charger les données"}
      </div>
    );
  }

  const dailyChart = data.daily.map((d) => ({
    ...d,
    label: d.label ?? d.date.slice(5),
  }));
  const weeklyChart = data.weekly.map((w) => ({
    ...w,
    label: w.label ?? w.period.slice(5),
  }));

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#7a7184]">
          Par jour (30 derniers jours)
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyChart} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e1d9" />
              <XAxis
                dataKey="label"
                stroke="#7a7184"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
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
                formatter={(value: number | undefined) => [value ?? 0, "Actifs"]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.date ? `Date: ${payload[0].payload.date}` : ""
                }
              />
              <Bar dataKey="count" fill="#3b1f4a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#7a7184]">
          Par semaine (12 dernières semaines)
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChart} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e1d9" />
              <XAxis
                dataKey="label"
                stroke="#7a7184"
                fontSize={10}
                tickLine={false}
                axisLine={false}
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
                formatter={(value: number | undefined) => [value ?? 0, "Actifs"]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.period
                    ? `Semaine du ${payload[0].payload.period}`
                    : ""
                }
              />
              <Bar dataKey="count" fill="#7a7184" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
