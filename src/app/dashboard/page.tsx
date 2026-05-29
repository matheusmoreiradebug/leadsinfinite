"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { Users, MessageSquare, TrendingUp, Calendar, RefreshCw } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { LeadsChart } from "@/components/dashboard/LeadsChart";
import { SellerPieChart } from "@/components/dashboard/SellerPieChart";
import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { DashboardStats } from "@/types";

export default function DashboardPage() {
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  async function load() {
    setLoading(true);
    const res = await fetch("/api/stats");
    if (res.ok) setStats(await res.json());
    setLoading(false);
    setLastRefresh(new Date());
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Visão Geral</h1>
          <p className="text-sm text-slate-500 mt-1">
            Última atualização: {lastRefresh.toLocaleTimeString("pt-BR")}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-sm text-slate-300 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* KPI cards */}
      {loading && !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-[#1a1d27] rounded-xl border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Leads"
            value={stats.total_leads}
            icon={MessageSquare}
            accent="blue"
            subtitle="Desde o início"
          />
          <StatsCard
            title="Leads Hoje"
            value={stats.leads_today}
            icon={Calendar}
            accent="green"
            subtitle="Nas últimas 24h"
          />
          <StatsCard
            title="Leads Esta Semana"
            value={stats.leads_week}
            icon={TrendingUp}
            accent="purple"
            subtitle="Últimos 7 dias"
          />
          <StatsCard
            title="Vendedores Ativos"
            value={stats.active_sellers}
            icon={Users}
            accent="amber"
            subtitle="No rodízio agora"
          />
        </div>
      ) : null}

      {/* Charts row */}
      {stats && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <LeadsChart data={stats.leads_by_day} />
            </div>
            <div>
              <SellerPieChart data={stats.leads_by_seller} />
            </div>
          </div>

          {/* Campaign / Source */}
          <CampaignTable
            campaigns={stats.leads_by_campaign}
            sources={stats.leads_by_source}
          />

          {/* Seller ranking */}
          <div className="bg-[#1a1d27] rounded-xl border border-white/[0.06] p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Ranking de Vendedores</h3>
            <div className="space-y-3">
              {stats.leads_by_seller
                .sort((a, b) => b.count - a.count)
                .map((s, i) => {
                  const max = stats.leads_by_seller[0]?.count ?? 1;
                  return (
                    <div key={s.seller_id} className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-600 w-5 text-right">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-200">{s.seller_name}</span>
                          <span className="text-sm font-semibold text-white">{s.count} leads</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${Math.round((s.count / max) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 w-10 text-right">{s.percentage}%</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
