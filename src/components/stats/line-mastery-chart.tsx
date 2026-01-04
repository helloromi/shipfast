"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { LineMasteryPoint } from "@/types/stats";
import { t } from "@/locales/fr";

type LineMasteryChartProps = {
  data: LineMasteryPoint[];
};

export function LineMasteryChart({ data }: LineMasteryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-[#e7e1d9] bg-white/92 text-sm text-[#524b5a]">
        {t.stats.charts.noData}
      </div>
    );
  }

  const chartData = data.map((d) => ({
    label: `#${d.order}`,
    mastery: d.mastery,
    attempts: d.attempts,
    text: d.text,
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e1d9" />
          <XAxis
            dataKey="label"
            stroke="#7a7184"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 3]}
            stroke="#7a7184"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => Number(v).toFixed(1)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e7e1d9",
              borderRadius: "8px",
              padding: "8px 12px",
              maxWidth: "360px",
            }}
            labelStyle={{ color: "#3b1f4a", fontWeight: "600", marginBottom: "4px" }}
            formatter={(value, name, props) => {
              if (name === "mastery" && typeof value === "number") {
                const attempts = (props as any)?.payload?.attempts ?? 0;
                return [`${value.toFixed(2)}/3 · ${attempts} ${t.stats.charts.attempts}`, t.stats.charts.mastery];
              }
              return [String(value ?? ""), String(name ?? "")];
            }}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as any;
              if (!p) return "";
              const text = String(p.text ?? "").trim();
              return text ? `${p.label} — ${text}` : String(p.label ?? "");
            }}
          />
          <Bar dataKey="mastery" fill="#3b1f4a" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


