"use client";
import { useState } from "react";
import { Lead } from "@/types";
import { formatDate, formatPhone, sourceLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

interface LeadsTableProps {
  leads: Lead[];
}

function sourceBadge(source: string) {
  const map: Record<string, "blue" | "green" | "yellow"> = {
    form:    "blue",
    cta_btn: "yellow",
    float:   "green",
  };
  return map[source] ?? "gray" as never;
}

function deviceIcon(device: string | null) {
  if (device === "mobile")  return "📱";
  if (device === "tablet")  return "📋";
  return "🖥️";
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const [search, setSearch]         = useState("");
  const [sortField, setSortField]   = useState<keyof Lead>("created_at");
  const [sortDir, setSortDir]       = useState<"asc" | "desc">("desc");
  const [filterSeller, setFilterSeller] = useState("");

  const sellers = [...new Set(leads.map((l) => l.seller_name).filter(Boolean))];

  const filtered = leads
    .filter((l) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        l.customer_name?.toLowerCase().includes(q) ||
        l.customer_phone?.includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.seller_name?.toLowerCase().includes(q) ||
        l.utm_campaign?.toLowerCase().includes(q);
      const matchSeller = !filterSeller || l.seller_name === filterSeller;
      return matchSearch && matchSeller;
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, cidade, campanha..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#1a1d27] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        <select
          value={filterSeller}
          onChange={e => setFilterSeller(e.target.value)}
          className="px-3 py-2.5 bg-[#1a1d27] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 min-w-[160px]"
        >
          <option value="">Todos os vendedores</option>
          {sellers.map(s => <option key={s} value={s!}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1a1d27] rounded-xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {[
                  { label: "Data",      field: "created_at"    as keyof Lead },
                  { label: "Cliente",   field: "customer_name" as keyof Lead },
                  { label: "Telefone",  field: "customer_phone" as keyof Lead },
                  { label: "Cidade",    field: "city"          as keyof Lead },
                  { label: "Vendedor",  field: "seller_name"   as keyof Lead },
                  { label: "Origem",    field: "source"        as keyof Lead },
                  { label: "Campanha",  field: "utm_campaign"  as keyof Lead },
                  { label: "Device",    field: "device"        as keyof Lead },
                ].map(({ label, field }) => (
                  <th
                    key={field}
                    onClick={() => toggleSort(field)}
                    className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-300 transition-colors select-none"
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      <SortIcon field={field} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    {search || filterSeller ? "Nenhum lead encontrado com esses filtros" : "Nenhum lead ainda"}
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">{formatDate(lead.created_at)}</td>
                    <td className="px-4 py-3 text-slate-200 font-medium">{lead.customer_name}</td>
                    <td className="px-4 py-3 text-slate-400">{formatPhone(lead.customer_phone)}</td>
                    <td className="px-4 py-3 text-slate-400">{[lead.city, lead.state].filter(Boolean).join(" - ") || "—"}</td>
                    <td className="px-4 py-3 text-slate-200">{lead.seller_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge label={sourceLabel(lead.source)} variant={sourceBadge(lead.source)} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{lead.utm_campaign ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-400 text-center">{deviceIcon(lead.device)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-white/[0.06] text-xs text-slate-500">
          {filtered.length} de {leads.length} leads
        </div>
      </div>
    </div>
  );
}
