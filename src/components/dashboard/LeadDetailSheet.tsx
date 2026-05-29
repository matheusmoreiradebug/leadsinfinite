"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MapPin, Smartphone, Send, ExternalLink } from "lucide-react";
import { Lead, LeadDetail } from "@/types";
import { formatDate, formatPhone, sourceLabel } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { ResponseTimer } from "./ResponseTimer";
import { LeadTimeline } from "./LeadTimeline";
import { STATUS_ORDER, getStatus } from "@/lib/status";

interface LeadDetailSheetProps {
  leadId: string | null;
  onClose: () => void;
  onStatusChange?: (leadId: string, newStatus: string) => void;
}

export function LeadDetailSheet({ leadId, onClose, onStatusChange }: LeadDetailSheetProps) {
  const [data, setData]         = useState<LeadDetail | null>(null);
  const [loading, setLoading]   = useState(false);
  const [note, setNote]         = useState("");
  const [savingNote, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!leadId) return;
    setLoading(true);
    const res = await fetch(`/api/leads/${leadId}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [leadId]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(status: string) {
    if (!leadId || !data) return;
    await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setData(prev => prev ? { ...prev, lead: { ...prev.lead, status: status as never } } : null);
    onStatusChange?.(leadId, status);
    load();
  }

  async function addNote() {
    if (!note.trim() || !leadId) return;
    setSaving(true);
    await fetch(`/api/leads/${leadId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: note }),
    });
    setNote("");
    setSaving(false);
    load();
  }

  function openWhatsApp() {
    if (!data?.lead) return;
    const phone = data.lead.seller_phone ?? "";
    const msg   = encodeURIComponent(`Olá ${data.lead.customer_name}! Aqui é da Infinite Móveis, tudo bem?`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  }

  return (
    <AnimatePresence>
      {leadId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#0f1117] border-l border-white/[0.08] z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                {data?.lead && <StatusBadge status={data.lead.status} animate />}
                {data?.lead && <ResponseTimer lastInteraction={data.lead.last_interaction_at} status={data.lead.status} />}
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            {loading || !data ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {/* Info do cliente */}
                <div className="px-6 py-5 border-b border-white/[0.06]">
                  <h2 className="text-lg font-bold text-white mb-1">{data.lead.customer_name}</h2>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {formatPhone(data.lead.customer_phone)}
                    </span>
                    {(data.lead.city || data.lead.state) && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {[data.lead.city, data.lead.state].filter(Boolean).join(" — ")}
                      </span>
                    )}
                    {data.lead.device && (
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" />
                        {data.lead.device}
                      </span>
                    )}
                  </div>
                  {data.lead.message && (
                    <p className="mt-2 text-sm text-slate-300 bg-white/[0.04] rounded-lg px-3 py-2 border border-white/[0.06]">
                      "{data.lead.message}"
                    </p>
                  )}
                </div>

                {/* Meta info */}
                <div className="px-6 py-4 border-b border-white/[0.06]">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      { label: "Vendedor",  value: data.lead.seller_name ?? "—" },
                      { label: "Origem",    value: sourceLabel(data.lead.source) },
                      { label: "Kit",       value: data.lead.kit ?? "—" },
                      { label: "Entrada",   value: formatDate(data.lead.created_at) },
                      { label: "Campanha",  value: data.lead.utm_campaign ?? "—" },
                      { label: "UTM Source",value: data.lead.utm_source ?? "—" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-slate-600">{label}</p>
                        <p className="text-slate-300 font-medium truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alterar status */}
                <div className="px-6 py-4 border-b border-white/[0.06]">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Alterar Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_ORDER.map((s) => {
                      const cfg     = getStatus(s);
                      const current = data.lead.status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => !current && changeStatus(s)}
                          className="text-xs px-2.5 py-1 rounded-full font-medium transition-all border"
                          style={{
                            color:      current ? "#fff" : cfg.color,
                            background: current ? cfg.color : cfg.bg,
                            borderColor: current ? cfg.color : cfg.border,
                            opacity: current ? 1 : 0.75,
                          }}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Adicionar nota */}
                <div className="px-6 py-4 border-b border-white/[0.06]">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Adicionar Observação</p>
                  <div className="flex gap-2">
                    <textarea
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="Ex: Cliente pediu retorno amanhã, interessado em gôndolas..."
                      rows={2}
                      className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                    <button
                      onClick={addNote}
                      disabled={!note.trim() || savingNote}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg text-white transition-all self-end"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Timeline */}
                <div className="px-6 py-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Timeline</p>
                  <LeadTimeline events={data.events} />
                </div>
              </div>
            )}

            {/* Footer */}
            {data?.lead && (
              <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
                <button
                  onClick={openWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25d366] hover:bg-[#20ba5a] rounded-lg text-sm font-semibold text-white transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir no WhatsApp
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
