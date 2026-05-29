import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accent?: "blue" | "green" | "purple" | "amber";
}

const accents = {
  blue:   { icon: "bg-blue-500/15 text-blue-400",    border: "border-blue-500/20" },
  green:  { icon: "bg-emerald-500/15 text-emerald-400", border: "border-emerald-500/20" },
  purple: { icon: "bg-violet-500/15 text-violet-400", border: "border-violet-500/20" },
  amber:  { icon: "bg-amber-500/15 text-amber-400",   border: "border-amber-500/20" },
};

export function StatsCard({ title, value, subtitle, icon: Icon, trend, accent = "blue" }: StatsCardProps) {
  const a = accents[accent];
  return (
    <div className={cn(
      "bg-[#1a1d27] rounded-xl p-5 border border-white/[0.06] flex flex-col gap-4",
      "hover:border-white/10 transition-colors"
    )}>
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center border", a.icon, a.border)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.value >= 0
              ? "text-emerald-400 bg-emerald-500/10"
              : "text-red-400 bg-red-500/10"
          )}>
            {trend.value >= 0 ? "+" : ""}{trend.value} {trend.label}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        <div className="text-sm text-slate-400 mt-0.5">{title}</div>
        {subtitle && <div className="text-xs text-slate-600 mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}
