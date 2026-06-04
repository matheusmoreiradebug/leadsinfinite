"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { Users, MessageSquare, TrendingUp, Calendar, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LeadsChart } from "@/components/dashboard/LeadsChart";
import { SellerPieChart } from "@/components/dashboard/SellerPieChart";
import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { DateRangePicker, DateRangeValue } from "@/components/dashboard/DateRangePicker";
import { DashboardStats } from "@/types";
import { getStatus, STATUS_ORDER } from "@/lib/status";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const DEFAULT_RANGE: DateRangeValue = {
  from:  startOfDay(subDays(new Date(), 29)),
  to:    endOfDay(new Date()),
  label: "Últimos 30 dias",
};

export default function DashboardPage() {
  const [stats,   setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [ts,      setTs]      = useState(new Date());
  const [range,   setRange]   = useState<DateRangeValue>(DEFAULT_RANGE);

  async function load(r: DateRangeValue = range) {
    setLoading(true);
    const from = format(r.from, "yyyy-MM-dd");
    const to   = format(r.to,   "yyyy-MM-dd");
    const res  = await fetch(`/api/stats?from=${from}&to=${to}`);
    if (res.ok) setStats(await res.json());
    setLoading(false);
    setTs(new Date());
  }

  useEffect(() => { load(); }, []);

  function handleRangeChange(r: DateRangeValue) {
    setRange(r);
    load(r);
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white tracking-tight">Visão Geral</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Atualizado às {ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex items-center gap-3"
        >
          <DateRangePicker value={range} onChange={handleRangeChange} />
          <button
            onClick={() => load()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-sm text-slate-400 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </motion.div>
      </div>

      {/* Alert banner */}
      {stats && <AlertBanner count={stats.no_response_leads} />}

      {/* KPI Cards */}
      {loading && !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-[#111118] rounded-xl border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : stats && (
        <motion.div variants={container} initial="hidden" animate="show"
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatsCard title="Total no Período"  value={stats.total_leads}       icon={MessageSquare} accent="blue"   delay={0}    subtitle={range.label} />
          <StatsCard title="Leads Hoje"         value={stats.leads_today}       icon={Calendar}      accent="green"  delay={0.06} />
          <StatsCard title="Em Aberto"          value={stats.open_leads}        icon={TrendingUp}    accent="purple" delay={0.12} />
          <StatsCard title="Sem Resposta"       value={stats.no_response_leads} icon={AlertTriangle} accent="red"    delay={0.18} />
          <StatsCard title="Fechados"           value={stats.closed_leads}      icon={CheckCircle}   accent="cyan"   delay={0.24} />
          <StatsCard title="Vendedores Ativos"  value={stats.active_sellers}    icon={Users}         accent="amber"  delay={0.30} />
        </motion.div>
      )}

      {/* Charts */}
      {stats && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          >
            <div className="lg:col-span-2">
              <LeadsChart data={stats.leads_by_day} label={range.label} />
            </div>
            <SellerPieChart data={stats.leads_by_seller} />
          </motion.div>

          {/* Status distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-[#111118] rounded-xl border border-white/[0.06] p-5"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Distribuição por Status</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {STATUS_ORDER.map(s => {
                const stat   = stats.leads_by_status.find(x => x.status === s);
                const count  = stat?.count ?? 0;
                const cfg    = getStatus(s);
                return (
                  <div key={s} className="text-center p-3 rounded-xl border" style={{ background: cfg.bg, borderColor: cfg.border }}>
                    <div className="text-xl font-bold" style={{ color: cfg.color }}>{count}</div>
                    <div className="text-xs text-slate-400 mt-1 leading-tight">{cfg.label}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <CampaignTable campaigns={stats.leads_by_campaign} sources={stats.leads_by_source} />
          </motion.div>

          {/* Seller ranking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="bg-[#111118] rounded-xl border border-white/[0.06] p-5"
          >
            <h3 className="text-sm font-semibold text-white mb-1">Ranking de Vendedores</h3>
            <p className="text-xs text-slate-600 mb-4">{range.label}</p>
            <div className="space-y-3">
              {stats.leads_by_seller.sort((a, b) => b.count - a.count).map((s, i) => {
                const max = stats.leads_by_seller[0]?.count ?? 1;
                return (
                  <div key={s.seller_id} className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-700 w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-200">{s.seller_name}</span>
                        <span className="text-sm font-semibold text-white">{s.count} leads</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${Math.round((s.count / max) * 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.6 + i * 0.05 }}
                          className="h-full rounded-full"
                          style={{ background: "linear-gradient(90deg, #2563eb, #3b82f6)" }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-slate-600 w-10 text-right">{s.percentage}%</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
