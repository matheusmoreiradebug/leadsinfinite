"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { DayStat } from "@/types";
import { formatDayLabel } from "@/lib/utils";

interface LeadsChartProps {
  data: DayStat[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d27] border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-slate-400">{formatDayLabel(label)}</p>
      <p className="text-white font-semibold">{payload[0].value} leads</p>
    </div>
  );
}

export function LeadsChart({ data }: LeadsChartProps) {
  return (
    <div className="bg-[#1a1d27] rounded-xl border border-white/[0.06] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Leads por Dia</h3>
        <p className="text-xs text-slate-500 mt-0.5">Últimos 30 dias</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDayLabel}
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={4}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#leadGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
