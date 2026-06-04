"use client";
import { useState, useRef, useEffect } from "react";
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
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
  { label: "Hoje",            get: () => { const d = new Date(); return { from: startOfDay(d), to: endOfDay(d) }; } },
  { label: "Ontem",           get: () => { const d = subDays(new Date(), 1); return { from: startOfDay(d), to: endOfDay(d) }; } },
  { label: "Últimos 7 dias",  get: () => ({ from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()) }) },
  { label: "Esta semana",     get: () => { const n = new Date(); return { from: startOfWeek(n, { locale: ptBR }), to: endOfWeek(n, { locale: ptBR }) }; } },
  { label: "Últimos 30 dias", get: () => ({ from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()) }) },
  { label: "Este mês",        get: () => { const n = new Date(); return { from: startOfMonth(n), to: endOfMonth(n) }; } },
  { label: "Mês passado",     get: () => { const d = subDays(startOfMonth(new Date()), 1); return { from: startOfMonth(d), to: endOfMonth(d) }; } },
];

function formatDisplayLabel(value: DateRangeValue): string {
  if (value.label !== "Personalizado") return value.label;
  const from = format(value.from, "dd/MM/yyyy");
  const to   = format(value.to,   "dd/MM/yyyy");
  return from === to ? from : `${from} — ${to}`;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen]               = useState(false);
  const [showCal, setShowCal]         = useState(false);
  const [calRange, setCalRange]       = useState<DateRange | undefined>({ from: value.from, to: value.to });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCal(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function applyPreset(preset: typeof PRESETS[0]) {
    const r = preset.get();
    onChange({ ...r, label: preset.label });
    setCalRange({ from: r.from, to: r.to });
    setShowCal(false);
    setOpen(false);
  }

  function applyCalendar() {
    if (!calRange?.from) return;
    const to = calRange.to ?? calRange.from;
    onChange({ from: startOfDay(calRange.from), to: endOfDay(to), label: "Personalizado" });
    setShowCal(false);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
          "bg-[#111118] border-white/[0.08] text-slate-300 hover:bg-white/[0.08]",
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
            className="absolute right-0 top-full mt-2 z-50 rounded-xl border border-white/[0.08] shadow-2xl overflow-hidden flex"
            style={{ background: "#111118" }}
          >
            {/* Presets */}
            <div className={cn("border-r border-white/[0.06] p-2 space-y-0.5", showCal ? "w-44" : "w-52")}>
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-2 py-1.5">Período rápido</p>
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2",
                    value.label === preset.label
                      ? "bg-blue-600/20 text-blue-300 font-medium"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                  )}
                >
                  {value.label === preset.label && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  )}
                  {preset.label}
                </button>
              ))}
              <div className="pt-1 mt-1 border-t border-white/[0.06]">
                <button
                  onClick={() => setShowCal(s => !s)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2",
                    showCal || value.label === "Personalizado"
                      ? "bg-blue-600/20 text-blue-300 font-medium"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                  )}
                >
                  <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  Personalizado
                </button>
              </div>
            </div>

            {/* Calendar panel */}
            <AnimatePresence>
              {showCal && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 flex flex-col gap-3">
                    <Calendar
                      mode="range"
                      selected={calRange}
                      onSelect={setCalRange}
                      locale={ptBR}
                      numberOfMonths={2}
                      defaultMonth={subDays(new Date(), 30)}
                      className="rounded-lg"
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                      <span className="text-xs text-slate-500">
                        {calRange?.from && calRange?.to
                          ? `${format(calRange.from, "dd/MM")} → ${format(calRange.to, "dd/MM/yyyy")}`
                          : calRange?.from
                          ? `${format(calRange.from, "dd/MM/yyyy")} → ...`
                          : "Selecione as datas"}
                      </span>
                      <button
                        onClick={applyCalendar}
                        disabled={!calRange?.from}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-all"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
