"use client";
import { useState } from "react";
import { format, startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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
  {
    label: "Hoje",
    get() { const d = new Date(); return { from: startOfDay(d), to: endOfDay(d), label: "Hoje" }; },
  },
  {
    label: "Ontem",
    get() { const d = subDays(new Date(), 1); return { from: startOfDay(d), to: endOfDay(d), label: "Ontem" }; },
  },
  {
    label: "Últimos 7 dias",
    get() { return { from: startOfDay(subDays(new Date(), 6)), to: endOfDay(new Date()), label: "Últimos 7 dias" }; },
  },
  {
    label: "Esta semana",
    get() { const n = new Date(); return { from: startOfWeek(n, { locale: ptBR }), to: endOfWeek(n, { locale: ptBR }), label: "Esta semana" }; },
  },
  {
    label: "Últimos 30 dias",
    get() { return { from: startOfDay(subDays(new Date(), 29)), to: endOfDay(new Date()), label: "Últimos 30 dias" }; },
  },
  {
    label: "Este mês",
    get() { const n = new Date(); return { from: startOfMonth(n), to: endOfMonth(n), label: "Este mês" }; },
  },
  {
    label: "Mês passado",
    get() { const d = subDays(startOfMonth(new Date()), 1); return { from: startOfMonth(d), to: endOfMonth(d), label: "Mês passado" }; },
  },
];

function formatLabel(value: DateRangeValue): string {
  if (value.label !== "Personalizado") return value.label;
  const from = format(value.from, "dd/MM/yyyy", { locale: ptBR });
  const to   = format(value.to,   "dd/MM/yyyy", { locale: ptBR });
  return from === to ? from : `${from} — ${to}`;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen]               = useState(false);
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [showCustom, setShowCustom]   = useState(false);

  function applyPreset(preset: typeof PRESETS[0]) {
    onChange(preset.get());
    setShowCustom(false);
    setOpen(false);
  }

  function applyCustom() {
    if (!customRange?.from) return;
    const to = customRange.to ?? customRange.from;
    onChange({
      from:  startOfDay(customRange.from),
      to:    endOfDay(to),
      label: "Personalizado",
    });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <span className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border cursor-pointer",
          "bg-[#111118] border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:border-white/[0.15]",
          open && "border-blue-500/50 bg-blue-500/10 text-blue-300"
        )}>
          <CalendarIcon className="w-4 h-4" />
          {formatLabel(value)}
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform text-slate-500", open && "rotate-180")} />
        </span>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0 border-white/[0.08] shadow-2xl"
        style={{ background: "#111118" }}
        align="end"
        sideOffset={8}
      >
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="flex"
        >
          {/* Presets */}
          <div className="w-44 border-r border-white/[0.06] p-2 space-y-0.5">
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-2 py-1.5">Período</p>
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
                {preset.label}
              </button>
            ))}
            <div className="pt-1 border-t border-white/[0.06] mt-1">
              <button
                onClick={() => setShowCustom(s => !s)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                  showCustom
                    ? "bg-blue-600/20 text-blue-300 font-medium"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                )}
              >
                Personalizado
              </button>
            </div>
          </div>

          {/* Custom calendar */}
          <AnimatePresence>
            {showCustom && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3">
                  <Calendar
                    mode="range"
                    selected={customRange}
                    onSelect={setCustomRange}
                    locale={ptBR}
                    numberOfMonths={2}
                    className="text-slate-200"
                  />
                  <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/[0.06]">
                    <button onClick={() => setShowCustom(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors">
                      Cancelar
                    </button>
                    <button
                      onClick={applyCustom}
                      disabled={!customRange?.from}
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
      </PopoverContent>
    </Popover>
  );
}
