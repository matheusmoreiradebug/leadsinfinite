"use client";
import { useEffect, useState } from "react";
import { Lead } from "@/types";
import { LeadsTable } from "@/components/dashboard/LeadsTable";
import { supabase } from "@/lib/supabase-client";
import { RefreshCw, Download } from "lucide-react";

export default function LeadsPage() {
  const [leads, setLeads]     = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function exportCSV() {
    if (!leads.length) return;
    const headers = [
      "Data", "Cliente", "Telefone", "Cidade", "Estado",
      "Vendedor", "Origem", "Kit", "UTM Source", "UTM Campaign", "UTM Medium", "Device",
    ];
    const rows = leads.map((l) => [
      l.created_at, l.customer_name, l.customer_phone, l.city ?? "", l.state ?? "",
      l.seller_name ?? "", l.source, l.kit ?? "", l.utm_source ?? "",
      l.utm_campaign ?? "", l.utm_medium ?? "", l.device ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Todos os contatos recebidos</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-sm text-slate-300 transition-all"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-sm text-slate-300 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-[#1a1d27] rounded-xl border border-white/[0.06] animate-pulse" />
      ) : (
        <LeadsTable leads={leads} />
      )}
    </div>
  );
}
