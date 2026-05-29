"use client";
import { useEffect, useState } from "react";
import { Seller } from "@/types";
import { formatDate, formatPhone } from "@/lib/utils";
import { Plus, Pencil, Trash2, Check, X, RefreshCw, Phone, Users } from "lucide-react";

interface FormState { name: string; phone: string }

export default function SellersPage() {
  const [sellers, setSellers]   = useState<Seller[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [form, setForm]         = useState<FormState>({ name: "", phone: "" });
  const [showNew, setShowNew]   = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res  = await fetch("/api/sellers");
    const data = await res.json();
    setSellers(data.sellers ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    if (!form.name || !form.phone) return;
    setSaving(true);
    await fetch("/api/sellers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ name: "", phone: "" });
    setShowNew(false);
    setSaving(false);
    load();
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    await fetch(`/api/sellers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditId(null);
    setSaving(false);
    load();
  }

  async function handleToggleActive(seller: Seller) {
    await fetch(`/api/sellers/${seller.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !seller.active }),
    });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/sellers/${id}`, { method: "DELETE" });
    setDeleteId(null);
    load();
  }

  const total_leads = sellers.reduce((s, v) => s + v.leads_count, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vendedores</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie o rodízio de atendimento</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg text-sm text-slate-300 transition-all disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={() => { setShowNew(true); setForm({ name: "", phone: "" }); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold text-white transition-all">
            <Plus className="w-4 h-4" />
            Novo Vendedor
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: sellers.length, icon: Users },
          { label: "Ativos", value: sellers.filter(s => s.active).length, icon: Check },
          { label: "Leads Totais", value: total_leads, icon: Phone },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-[#1a1d27] border border-white/[0.06] rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <Icon className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* New seller form */}
      {showNew && (
        <div className="bg-[#1a1d27] border border-blue-500/30 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Novo Vendedor</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Nome</label>
              <input
                type="text" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: João Silva"
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">WhatsApp (com DDI)</label>
              <input
                type="text" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="5511999999999"
                className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={saving || !form.name || !form.phone}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-semibold text-white transition-all">
              <Check className="w-4 h-4" />
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button onClick={() => setShowNew(false)}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] rounded-lg text-sm text-slate-300 transition-all">
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Sellers list */}
      <div className="bg-[#1a1d27] border border-white/[0.06] rounded-xl overflow-hidden">
        {loading ? (
          <div className="h-48 animate-pulse" />
        ) : sellers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            Nenhum vendedor cadastrado
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Nome", "Telefone", "Leads", "Status", "Desde", "Ações"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sellers.map(seller => (
                <tr key={seller.id} className="hover:bg-white/[0.02] transition-colors">
                  {editId === seller.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input type="text" value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-white/[0.08] border border-white/[0.15] rounded text-sm text-white focus:outline-none focus:border-blue-500/60" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="text" value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full px-2 py-1.5 bg-white/[0.08] border border-white/[0.15] rounded text-sm text-white focus:outline-none focus:border-blue-500/60" />
                      </td>
                      <td className="px-4 py-3 text-slate-400">{seller.leads_count}</td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(seller.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleUpdate(seller.id)} disabled={saving}
                            className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditId(null)}
                            className="p-1.5 rounded-lg bg-white/[0.06] text-slate-400 hover:bg-white/[0.1] transition-all">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-slate-200 font-medium">{seller.name}</td>
                      <td className="px-4 py-3 text-slate-400">{formatPhone(seller.phone)}</td>
                      <td className="px-4 py-3">
                        <span className="text-white font-semibold">{seller.leads_count}</span>
                        <span className="text-slate-600 text-xs ml-1">leads</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggleActive(seller)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                            seller.active
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25"
                              : "bg-slate-500/15 text-slate-500 border-slate-500/20 hover:bg-slate-500/25"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${seller.active ? "bg-emerald-400" : "bg-slate-500"}`} />
                          {seller.active ? "Ativo" : "Inativo"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(seller.created_at)}</td>
                      <td className="px-4 py-3">
                        {deleteId === seller.id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-red-400">Confirmar?</span>
                            <button onClick={() => handleDelete(seller.id)}
                              className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteId(null)}
                              className="p-1.5 rounded-lg bg-white/[0.06] text-slate-400 hover:bg-white/[0.1] transition-all">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setEditId(seller.id); setForm({ name: seller.name, phone: seller.phone }); }}
                              className="p-1.5 rounded-lg bg-white/[0.06] text-slate-400 hover:bg-white/[0.1] hover:text-slate-200 transition-all">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteId(seller.id)}
                              className="p-1.5 rounded-lg bg-white/[0.06] text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Rotation info */}
      <div className="bg-blue-500/[0.08] border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
        <strong className="text-blue-200">Como funciona o rodízio:</strong> Cada lead é automaticamente atribuído ao próximo vendedor ativo na fila. O índice é salvo no Supabase — funciona mesmo com múltiplos acessos simultâneos e entre diferentes dispositivos.
      </div>
    </div>
  );
}
