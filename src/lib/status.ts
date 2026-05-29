import { minutesSince } from "./utils";

export const STATUSES = {
  new:         { label: "Novo Lead",           color: "#3b82f6", bg: "rgba(59,130,246,0.15)",  border: "rgba(59,130,246,0.3)",  urgency: 0 },
  attending:   { label: "Em Atendimento",      color: "#6366f1", bg: "rgba(99,102,241,0.15)",  border: "rgba(99,102,241,0.3)",  urgency: 0 },
  waiting:     { label: "Aguardando Resposta", color: "#f59e0b", bg: "rgba(245,158,11,0.15)",  border: "rgba(245,158,11,0.3)",  urgency: 1 },
  followup:    { label: "Follow-up",           color: "#f97316", bg: "rgba(249,115,22,0.15)",  border: "rgba(249,115,22,0.3)",  urgency: 2 },
  negotiation: { label: "Negociação",          color: "#8b5cf6", bg: "rgba(139,92,246,0.15)",  border: "rgba(139,92,246,0.3)",  urgency: 0 },
  quoted:      { label: "Orçamento Enviado",   color: "#06b6d4", bg: "rgba(6,182,212,0.15)",   border: "rgba(6,182,212,0.3)",   urgency: 1 },
  closed:      { label: "Fechado ✓",           color: "#22c55e", bg: "rgba(34,197,94,0.15)",   border: "rgba(34,197,94,0.3)",   urgency: 0 },
  lost:        { label: "Perdido",             color: "#ef4444", bg: "rgba(239,68,68,0.15)",   border: "rgba(239,68,68,0.3)",   urgency: 0 },
} as const;

export type StatusKey = keyof typeof STATUSES;

export const STATUS_ORDER: StatusKey[] = [
  "new", "attending", "waiting", "followup", "negotiation", "quoted", "closed", "lost"
];

export const OPEN_STATUSES: StatusKey[] = [
  "new", "attending", "waiting", "followup", "negotiation", "quoted"
];

export function getStatus(key: string) {
  return STATUSES[key as StatusKey] ?? STATUSES.new;
}

// Urgência baseada no tempo sem interação
export type Urgency = "ok" | "warn" | "urgent" | "critical";

export function responseUrgency(lastInteraction: string): Urgency {
  const mins = minutesSince(lastInteraction);
  if (mins < 30)   return "ok";
  if (mins < 120)  return "warn";
  if (mins < 1440) return "urgent";
  return "critical";
}

export const URGENCY_CONFIG: Record<Urgency, { color: string; label: string; bg: string }> = {
  ok:       { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   label: "Atendido" },
  warn:     { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  label: "Atenção" },
  urgent:   { color: "#f97316", bg: "rgba(249,115,22,0.1)",  label: "Urgente" },
  critical: { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   label: "Crítico" },
};
