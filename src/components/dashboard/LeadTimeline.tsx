"use client";
import { motion } from "framer-motion";
import { LeadEvent } from "@/types";
import { formatDate } from "@/lib/utils";
import { getStatus } from "@/lib/status";
import { MessageSquare, ArrowRight, UserCheck, Sparkles } from "lucide-react";

const TYPE_CONFIG = {
  created:       { icon: Sparkles,    color: "#3b82f6", label: "Lead criado" },
  status_change: { icon: ArrowRight,  color: "#6366f1", label: "Status alterado" },
  note:          { icon: MessageSquare, color: "#f59e0b", label: "Nota adicionada" },
  assigned:      { icon: UserCheck,   color: "#22c55e", label: "Atribuído" },
};

interface LeadTimelineProps {
  events: LeadEvent[];
}

export function LeadTimeline({ events }: LeadTimelineProps) {
  if (!events.length) {
    return <p className="text-sm text-slate-500 py-4">Nenhum evento ainda.</p>;
  }

  return (
    <div className="relative">
      {/* Linha vertical */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-white/[0.06]" />

      <div className="space-y-4">
        {events.map((event, i) => {
          const cfg  = TYPE_CONFIG[event.type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.note;
          const Icon = cfg.icon;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-start gap-4 pl-1"
            >
              {/* Ícone */}
              <div
                className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  {event.type === "status_change" && event.previous_status && event.new_status ? (
                    <span className="text-sm text-slate-200">
                      <span className="text-slate-400">de</span>{" "}
                      <span className="font-medium" style={{ color: getStatus(event.previous_status).color }}>
                        {getStatus(event.previous_status).label}
                      </span>{" "}
                      <span className="text-slate-400">para</span>{" "}
                      <span className="font-medium" style={{ color: getStatus(event.new_status).color }}>
                        {getStatus(event.new_status).label}
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm text-slate-200">{event.content ?? cfg.label}</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{formatDate(event.created_at)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
