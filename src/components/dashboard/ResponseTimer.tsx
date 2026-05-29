"use client";
import { useEffect, useState } from "react";
import { minutesSince } from "@/lib/utils";
import { responseUrgency, URGENCY_CONFIG } from "@/lib/status";
import { Clock } from "lucide-react";

interface ResponseTimerProps {
  lastInteraction: string;
  status: string;
}

function formatTime(mins: number): string {
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h < 24) return m > 0 ? `${h}h ${m}min` : `${h}h`;
  const d = Math.floor(h / 24);
  const hh = h % 24;
  return hh > 0 ? `${d}d ${hh}h` : `${d}d`;
}

export function ResponseTimer({ lastInteraction, status }: ResponseTimerProps) {
  const [mins, setMins] = useState(() => minutesSince(lastInteraction));

  // Não mostra para leads fechados ou perdidos
  if (status === "closed" || status === "lost") return null;

  useEffect(() => {
    const interval = setInterval(() => setMins(minutesSince(lastInteraction)), 60000);
    return () => clearInterval(interval);
  }, [lastInteraction]);

  const urgency = responseUrgency(lastInteraction);
  const cfg     = URGENCY_CONFIG[urgency];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <Clock className="w-3 h-3" />
      {formatTime(mins)}
    </span>
  );
}
