"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lead } from "@/types";
import { formatDate, formatPhone, sourceLabel } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { ResponseTimer } from "./ResponseTimer";
import { Search, ChevronDown, ChevronUp, Download, Filter } from "lucide-react";
import { STATUS_ORDER, getStatus } from "@/lib/status";

interface LeadsTableProps {
  leads: Lead[];
  onLeadClick?: (id: string) => void;
}

export function LeadsTable({ leads, onLeadClick }: LeadsTableProps) {
  const [search, setSearch]         = useState("");
  const [sortField, setSortField]   = useState<keyof Lead>("created_at");
  const [sortDir, setSortDir]       = useState<"asc" | "desc">("desc");
  const [filterSeller, setFilterSeller] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const sellers  = [...new Set(leads.map((l) => l.seller_name).filter(Boolean))];

  const filtered = leads
    .filter((l) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        l.customer_name?.toLowerCase().includes(q) ||
        l.customer_phone?.includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.seller_name?.toLowerCase().includes(q) ||
        l.utm_campaign?.toLowerCase().includes(q);
      return matchSearch
        && (!filterSeller || l.seller_name === filterSeller)
        && (!filterStatus || l.status === filterStatus);
    })
    .sort((a, b) => {
      const va = String(a[sortField] ?? "");
      const vb = String(b[sortField] ?? "");
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  function toggleSort(field: keyof Lead) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  function SortIcon({ field }: { field: keyof Lead }) {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-slate-600" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-blue-400" />
      : <ChevronDown className="w-3 h-3 text-blue-400" />;
  }

  function exportCSV() {
    const headers = ["Data", "Cliente", "Telefone", "Cidade", "Estado", "Vendedor", "Status", "Origem", "Kit", "Campanha", "UTM Source", "Device"];
    const rows    = filtered.map((l) => [
      l.created_at, l.customer_name, l.customer_phone, l.city ?? "", l.state ?? "",
      l.seller_name ?? "", l.status, l.source, l.kit ?? "", l.utm_campaign ?? "", l.utm_source ?? "", l.device ?? "",
    ]);
    const csv  = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone, cidade, campanha..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#111118] border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 bg-[#111118] border border-white/[0.08] rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 min-w-[160px]">
            <option value="">Todos os status</option>
            {STATUS_ORDER.map(s => <option key={s} value={s}>{getStatus(s).label}</option>)}
          </select>
          <select value={filterSeller} onChange={e => setFilterSeller(e.target.value)}
            className="px-3 py-2.5 bg-[#111118] border border-white/[0.08] rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 min-w-[160px]">
            <option value="">Todos os vendedores</option>
            {sellers.map(s => <option key={s} value={s!}>{s}</option>)}
          </select>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-sm text-slate-300 transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111118] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {[
                  { label: "Data",     field: "created_at"     as keyof Lead },
                  { label: "Cliente",  field: "customer_name"  as keyof Lead },
                  { label: "Telefone", field: "customer_phone" as keyof Lead },
                  { label: "Status",   field: "status"         as keyof Lead },
                  { label: "Tempo",    field: "last_interaction_at" as keyof Lead },
                  { label: "Vendedor", field: "seller_name"    as keyof Lead },
                  { label: "Origem",   field: "source"         as keyof Lead },
                  { label: "Cidade",   field: "city"           as keyof Lead },
                ].map(({ label, field }) => (
                  <th key={field} onClick={() => toggleSort(field)}
                    className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors select-none">
                    <span className="flex items-center gap-1">{label}<SortIcon field={field} /></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  {search || filterSeller || filterStatus ? "Nenhum lead encontrado com esses filtros" : "Nenhum lead ainda"}
                </td></tr>
              ) : filtered.map((lead, i) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  onClick={() => onLeadClick?.(lead.id)}
                  className="hover:bg-white/[0.025] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(lead.created_at)}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{lead.customer_name}</td>
                  <td className="px-4 py-3 text-slate-400">{formatPhone(lead.customer_phone)}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-4 py-3"><ResponseTimer lastInteraction={lead.last_interaction_at} status={lead.status} /></td>
                  <td className="px-4 py-3 text-slate-300">{lead.seller_name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{sourceLabel(lead.source)}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{[lead.city, lead.state].filter(Boolean).join(" — ") || "—"}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-white/[0.06] text-xs text-slate-600">
          {filtered.length} de {leads.length} leads
        </div>
      </div>
    </div>
  );
}
