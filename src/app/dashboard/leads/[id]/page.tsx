"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LeadDetail } from "@/types";
import { formatDate, formatPhone, sourceLabel } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ResponseTimer } from "@/components/dashboard/ResponseTimer";
import { LeadTimeline } from "@/components/dashboard/LeadTimeline";
import { STATUS_ORDER, getStatus } from "@/lib/status";
import { ArrowLeft, Phone, MapPin, Send, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function LeadDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const [data, setData]         = useState<LeadDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [note, setNote]         = useState("");
  const [savingNote, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/leads/${id}`);
    if (!res.ok) { router.push("/dashboard/leads"); return; }
    setData(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function changeStatus(status: string) {
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function addNote() {
    if (!note.trim()) return;
    setSaving(true);
    await fetch(`/api/leads/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: note }),
    });
    setNote(""); setSaving(false); load();
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
    </div>
  );

  if (!data) return null;
  const { lead, events, notes } = data;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl space-y-6">
      {/* Back */}
      <Link href="/dashboard/leads" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para Leads
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">{lead.customer_name}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <StatusBadge status={lead.status} size="md" animate />
            <ResponseTimer lastInteraction={lead.last_interaction_at} status={lead.status} />
            <span className="text-sm text-slate-500">{formatDate(lead.created_at)}</span>
          </div>
        </div>
        <a
          href={`https://wa.me/${lead.seller_phone}?text=${encodeURIComponent(`Olá ${lead.customer_name}! Aqui é da Infinite Móveis.`)}`}
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "#25d366" }}
        >
          <ExternalLink className="w-4 h-4" />
          Abrir WhatsApp
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#111118] rounded-xl border border-white/[0.06] p-5">
            <h2 className="text-sm font-semibold text-white mb-5">Timeline</h2>
            <LeadTimeline events={events} />
          </div>

          {/* Add note */}
          <div className="bg-[#111118] rounded-xl border border-white/[0.06] p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Adicionar Observação</h2>
            <div className="flex gap-3">
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                placeholder="Ex: Cliente pediu retorno amanhã, interessado em gôndolas..."
                className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <button onClick={addNote} disabled={!note.trim() || savingNote}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-xl text-white transition-all self-end">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Info sidebar */}
        <div className="space-y-5">
          {/* Info */}
          <div className="bg-[#111118] rounded-xl border border-white/[0.06] p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Informações</h2>
            {[
              { label: "Telefone",  value: formatPhone(lead.customer_phone), icon: Phone },
              { label: "Cidade",    value: [lead.city, lead.state].filter(Boolean).join(" — ") || "—", icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-600">{label}</p>
                  <p className="text-sm text-slate-300">{value}</p>
                </div>
              </div>
            ))}
            {[
              { label: "Vendedor",   value: lead.seller_name ?? "—" },
              { label: "Origem",     value: sourceLabel(lead.source) },
              { label: "Kit",        value: lead.kit ?? "—" },
              { label: "Campanha",   value: lead.utm_campaign ?? "—" },
              { label: "UTM Source", value: lead.utm_source ?? "—" },
              { label: "Device",     value: lead.device ?? "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-600">{label}</p>
                <p className="text-sm text-slate-300">{value}</p>
              </div>
            ))}
          </div>

          {/* Alterar status */}
          <div className="bg-[#111118] rounded-xl border border-white/[0.06] p-5">
            <h2 className="text-sm font-semibold text-white mb-3">Alterar Status</h2>
            <div className="space-y-1.5">
              {STATUS_ORDER.map(s => {
                const cfg     = getStatus(s);
                const current = lead.status === s;
                return (
                  <button key={s} onClick={() => !current && changeStatus(s)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg font-medium transition-all flex items-center gap-2 border"
                    style={{
                      color: current ? "#fff" : cfg.color,
                      background: current ? cfg.color : cfg.bg,
                      borderColor: current ? cfg.color : cfg.border,
                    }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mensagem original */}
          {lead.message && (
            <div className="bg-[#111118] rounded-xl border border-white/[0.06] p-5">
              <h2 className="text-sm font-semibold text-white mb-2">Mensagem Original</h2>
              <p className="text-sm text-slate-400 leading-relaxed">"{lead.message}"</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
