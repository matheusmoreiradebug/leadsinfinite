"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { SellerStat } from "@/types";

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e"];

interface SellerPieChartProps {
  data: SellerStat[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d27] border border-white/10 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-slate-400">{payload[0].name}</p>
      <p className="text-white font-semibold">{payload[0].value} leads ({payload[0].payload.percentage}%)</p>
    </div>
  );
}

export function SellerPieChart({ data }: SellerPieChartProps) {
  if (!data.length) {
    return (
      <div className="bg-[#1a1d27] rounded-xl border border-white/[0.06] p-5 flex items-center justify-center h-[280px]">
        <p className="text-slate-500 text-sm">Sem dados de rodízio ainda</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1d27] rounded-xl border border-white/[0.06] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Distribuição do Rodízio</h3>
        <p className="text-xs text-slate-500 mt-0.5">Últimos 30 dias</p>
      </div>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={72}
              paddingAngle={3}
              dataKey="count"
              nameKey="seller_name"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {data.map((s, i) => (
            <div key={s.seller_id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-slate-300 truncate">{s.seller_name}</span>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-xs font-semibold text-white">{s.count}</span>
                <span className="text-xs text-slate-500 ml-1">({s.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
