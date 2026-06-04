"use client";
import { useState, useRef, useEffect } from "react";
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface DateRangeValue {
  from: Date;
  to: Date;
  label: string;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
}

const PRESETS = [
  { label: "Hoje",           get: () => { const d = new Date(); return { from: startOfDay(d), to: endOfDay(d) }; } },
  { label: "Ontem",          get: () => { const d = subDays(new Date(), 1); return { from: startOfDay(d), to: endOfDay(d) }; } },
  { label: "Últimos 7 dias", get: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }) },
  { label: "Esta semana",    get: () => { const n = new Date(); return { from: startOfWeek(n, { locale: ptBR }), to: endOfWeek(n, { locale: ptBR }) }; } },
  { label: "Últimos 30 dias",get: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }) },
  { label: "Este mês",       get: () => { const n = new Date(); return { from: startOfMonth(n), to: endOfMonth(n) }; } },
  { label: "Mês passado",    get: () => { const d = subDays(startOfMonth(new Date()), 1); return { from: startOfMonth(d), to: endOfMonth(d) }; } },
];

function formatDisplayLabel(value: DateRangeValue): string {
  if (value.label !== "Personalizado") return value.label;
  const from = format(value.from, "dd/MM/yyyy");
  const to   = format(value.to,   "dd/MM/yyyy");
  return from === to ? from : `${from} — ${to}`;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen]           = useState(false);
  const [customFrom, setCustomFrom] = useState(format(value.from, "yyyy-MM-dd"));
  const [customTo, setCustomTo]     = useState(format(value.to,   "yyyy-MM-dd"));
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function applyPreset(preset: typeof PRESETS[0]) {
    const r = preset.get();
    onChange({ ...r, label: preset.label });
    setCustomFrom(format(r.from, "yyyy-MM-dd"));
    setCustomTo(format(r.to, "yyyy-MM-dd"));
    setOpen(false);
  }

  function applyCustom() {
    if (!customFrom || !customTo) return;
    const from = startOfDay(new Date(customFrom + "T00:00:00"));
    const to   = endOfDay(new Date(customTo   + "T00:00:00"));
    if (from > to) return;
    onChange({ from, to, label: "Personalizado" });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
          "bg-[#111118] border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:border-white/[0.15]",
          open && "border-blue-500/50 bg-blue-500/10 text-blue-300"
        )}
      >
        <CalendarIcon className="w-4 h-4" />
        {formatDisplayLabel(value)}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform text-slate-500", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 min-w-[260px] rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden"
            style={{ background: "#111118" }}
          >
            {/* Presets */}
            <div className="p-2 border-b border-white/[0.06]">
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-2 py-1.5">Período rápido</p>
              <div className="space-y-0.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                      value.label === preset.label
                        ? "bg-blue-600/20 text-blue-300 font-medium"
                        : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                    )}
                  >
                    {value.label === preset.label && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 mb-0.5" />
                    )}
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom range */}
            <div className="p-3">
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Intervalo personalizado</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500 w-10 flex-shrink-0">De</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={e => setCustomFrom(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500 w-10 flex-shrink-0">Até</label>
                  <input
                    type="date"
                    value={customTo}
                    min={customFrom}
                    onChange={e => setCustomTo(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
                  />
                </div>
                <button
                  onClick={applyCustom}
                  disabled={!customFrom || !customTo || customFrom > customTo}
                  className="w-full py-2 mt-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-all"
                >
                  Aplicar período
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
