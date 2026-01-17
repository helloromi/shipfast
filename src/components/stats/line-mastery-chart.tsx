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

  const preview = (raw: string, maxChars = 70) => {
    const text = String(raw ?? "").replace(/\s+/g, " ").trim();
    if (!text) return "";
    if (text.length <= maxChars) return text;
    return `${text.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
  };

  const chartData = data.map((d) => ({
    label: `#${d.userIndex}`,
    short: preview(d.text),
    mastery: d.mastery,
    attempts: d.attempts,
    text: d.text,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const p = payload[0]?.payload as any;
    if (!p) return null;
    const label = String(p.label ?? "");
    const linePreview = preview(String(p.text ?? ""), 80);
    const mastery = typeof p.mastery === "number" ? p.mastery : Number(p.mastery ?? 0);
    const attempts = Number(p.attempts ?? 0);

    return (
      <div
        className="rounded-lg border border-[#e7e1d9] bg-white px-3 py-2 shadow-sm"
        style={{ maxWidth: 280 }}
      >
        <div
          className="mb-1 block text-sm font-semibold text-[#3b1f4a]"
          style={{
            maxWidth: 260,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={linePreview ? `${label} — ${linePreview}` : label}
        >
          {linePreview ? `${label} — ${linePreview}` : label}
        </div>
        <div className="text-xs text-[#524b5a]">
          <span className="font-semibold text-[#1c1b1f]">{t.stats.charts.mastery} :</span>{" "}
          {Number.isFinite(mastery) ? mastery.toFixed(2) : "0.00"}/10 · {attempts} {t.stats.charts.attempts}
        </div>
      </div>
    );
  };

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
            tickFormatter={(_, idx) => (chartData[idx] ? `${chartData[idx].label} ${chartData[idx].short}` : "")}
          />
          <YAxis
            domain={[0, 10]}
            stroke="#7a7184"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            ticks={[0, 3, 7, 10]}
            tickFormatter={(v) => {
              const num = Number(v);
              if (num === 0) return t.learn.scores.rate.label;
              if (num === 3) return t.learn.scores.hesitant.label;
              if (num === 7) return t.learn.scores.bon.label;
              if (num === 10) return t.learn.scores.parfait.label;
              return "";
            }}
          />
          <Tooltip
            content={<CustomTooltip />}
          />
          <Bar dataKey="mastery" fill="#3b1f4a" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


