"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TimeSeriesDataPoint } from "@/types/stats";
import { t } from "@/locales/fr";

type ScoreEvolutionChartProps = {
  data: TimeSeriesDataPoint[];
};

export function ScoreEvolutionChart({ data }: ScoreEvolutionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-[#e7e1d9] bg-white/92 text-sm text-[#524b5a]">
        {t.stats.charts.noData}
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e1d9" />
          <XAxis
            dataKey="label"
            stroke="#7a7184"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 3]}
            stroke="#7a7184"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.toFixed(1)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e7e1d9",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            labelStyle={{ color: "#3b1f4a", fontWeight: "600", marginBottom: "4px" }}
            formatter={(value) => {
              if (typeof value === "number") {
                return [value.toFixed(2), t.stats.charts.score];
              }
              return [String(value ?? ""), t.stats.charts.score];
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b1f4a"
            strokeWidth={2}
            dot={{ fill: "#3b1f4a", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
