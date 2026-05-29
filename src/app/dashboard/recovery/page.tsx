"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RecoveryData, Lead } from "@/types";
import { timeAgo, formatPhone } from "@/lib/utils";
import { LeadDetailSheet } from "@/components/dashboard/LeadDetailSheet";
import { ResponseTimer } from "@/components/dashboard/ResponseTimer";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { RefreshCw, ExternalLink, AlertTriangle, Clock, Snowflake, RotateCcw } from "lucide-react";

const SECTIONS = [
  { key: "no_response",  label: "Sem Resposta",          icon: AlertTriangle, color: "#ef4444", bg: "rgba(239,68,68,0.08)",    border: "rgba(239,68,68,0.2)",    desc: "Status 'Novo' há mais de 2h" },
  { key: "forgotten",    label: "Esquecidos",             icon: Clock,         color: "#f97316", bg: "rgba(249,115,22,0.08)",   border: "rgba(249,115,22,0.2)",   desc: "Sem interação há mais de 24h" },
  { key: "cold",         label: "Frios",                  icon: Snowflake,     color: "#06b6d4", bg: "rgba(6,182,212,0.08)",    border: "rgba(6,182,212,0.2)",    desc: "Aguardando/Follow-up há mais de 48h" },
  { key: "lost_recent",  label: "Perdidos Recuperáveis",  icon: RotateCcw,     color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",   border: "rgba(139,92,246,0.2)",   desc: "Perdidos nos últimos 7 dias" },
] as const;

function RecoveryCard({ lead, onOpen }: { lead: Lead; onOpen: (id: string) => void }) {
  const waUrl = `https://wa.me/${lead.seller_phone ?? ""}?text=${encodeURIComponent(`Olá ${lead.customer_name}! Aqui é da Infinite Móveis, tudo bem?`)}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#111118] border border-white/[0.06] rounded-xl p-4 flex items-start justify-between gap-3 hover:border-white/[0.1] transition-all cursor-pointer group"
      onClick={() => onOpen(lead.id)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-semibold text-slate-200">{lead.customer_name}</span>
          <StatusBadge status={lead.status} />
        </div>
        <p className="text-xs text-slate-500">{formatPhone(lead.customer_phone)}</p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <ResponseTimer lastInteraction={lead.last_interaction_at} status={lead.status} />
          <span className="text-xs text-slate-600">{lead.seller_name ?? "—"}</span>
          {lead.city && <span className="text-xs text-slate-600">{lead.city}</span>}
        </div>
      </div>
      <a href={waUrl} target="_blank" rel="noreferrer"
        onClick={e => e.stopPropagation()}
        className="p-2 rounded-lg flex-shrink-0 transition-all opacity-0 group-hover:opacity-100"
        style={{ background: "rgba(37,211,102,0.15)", color: "#25d366" }}>
        <ExternalLink className="w-4 h-4" />
      </a>
    </motion.div>
  );
}

export default function RecoveryPage() {
  const [data, setData]       = useState<RecoveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/recovery");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const total = data
    ? data.no_response.length + data.forgotten.length + data.cold.length + data.lost_recent.length
    : 0;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white tracking-tight">Recuperação</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {total > 0 ? `${total} oportunidade${total > 1 ? "s" : ""} precisando de atenção` : "Tudo em dia! ✓"}
          </p>
        </motion.div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-sm text-slate-400 transition-all disabled:opacity-40">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-[#111118] rounded-xl border border-white/[0.06] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {SECTIONS.map(({ key, label, icon: Icon, color, bg, border, desc }) => {
            const leads = (data?.[key] ?? []) as Lead[];
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: border }}
              >
                {/* Section header */}
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ background: bg, borderColor: border }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}25` }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{label}</h3>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold" style={{ color }}>{leads.length}</span>
                </div>

                {/* Leads */}
                <div className="bg-[#0f1117] p-3 space-y-2 max-h-80 overflow-y-auto">
                  {leads.length === 0 ? (
                    <p className="text-sm text-slate-600 text-center py-6">Nenhum lead nesta categoria ✓</p>
                  ) : leads.map(lead => (
                    <RecoveryCard key={lead.id} lead={lead} onOpen={setSelectedId} />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <LeadDetailSheet
        leadId={selectedId}
        onClose={() => { setSelectedId(null); load(); }}
      />
    </div>
  );
}
