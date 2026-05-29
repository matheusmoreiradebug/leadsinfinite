"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  accent?: "blue" | "green" | "purple" | "amber" | "red" | "cyan";
  trend?: { value: number; label: string };
  animate?: boolean;
  delay?: number;
}

const accents = {
  blue:   { icon: "bg-blue-500/15 text-blue-400",      glow: "rgba(59,130,246,0.15)",   border: "rgba(59,130,246,0.2)"   },
  green:  { icon: "bg-emerald-500/15 text-emerald-400", glow: "rgba(34,197,94,0.15)",    border: "rgba(34,197,94,0.2)"    },
  purple: { icon: "bg-violet-500/15 text-violet-400",   glow: "rgba(139,92,246,0.15)",   border: "rgba(139,92,246,0.2)"   },
  amber:  { icon: "bg-amber-500/15 text-amber-400",     glow: "rgba(245,158,11,0.15)",   border: "rgba(245,158,11,0.2)"   },
  red:    { icon: "bg-red-500/15 text-red-400",         glow: "rgba(239,68,68,0.15)",    border: "rgba(239,68,68,0.2)"    },
  cyan:   { icon: "bg-cyan-500/15 text-cyan-400",       glow: "rgba(6,182,212,0.15)",    border: "rgba(6,182,212,0.2)"    },
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const duration = 800;
    const steps    = 30;
    const step     = value / steps;
    let current    = 0;
    ref.current    = setInterval(() => {
      current += step;
      if (current >= value) { setDisplay(value); clearInterval(ref.current!); }
      else setDisplay(Math.round(current));
    }, duration / steps);
    return () => clearInterval(ref.current!);
  }, [value]);

  return <>{display.toLocaleString("pt-BR")}</>;
}

export function StatsCard({ title, value, subtitle, icon: Icon, accent = "blue", trend, animate = true, delay = 0 }: StatsCardProps) {
  const a = accents[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative bg-[#111118] rounded-xl p-5 border border-white/[0.06] flex flex-col gap-4 overflow-hidden group cursor-default"
      style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04)` }}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${a.glow}, transparent 70%)` }}
      />

      <div className="flex items-start justify-between relative">
        <div
          className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", a.icon)}
          style={{ borderColor: a.border }}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            trend.value >= 0 ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
          )}>
            {trend.value >= 0 ? "+" : ""}{trend.value} {trend.label}
          </span>
        )}
      </div>

      <div className="relative">
        <div className="text-2xl font-bold text-white tracking-tight">
          {animate && typeof value === "number" ? <AnimatedNumber value={value} /> : value}
          {typeof value === "string" && value.includes("%") && ""}
        </div>
        <div className="text-sm text-slate-400 mt-0.5">{title}</div>
        {subtitle && <div className="text-xs text-slate-600 mt-1">{subtitle}</div>}
      </div>
    </motion.div>
  );
}
