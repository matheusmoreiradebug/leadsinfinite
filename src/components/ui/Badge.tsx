"use client";
import { cn } from "@/lib/utils";

interface BadgeProps {
  label: string;
  variant?: "blue" | "green" | "yellow" | "red" | "gray";
  className?: string;
}

const variants = {
  blue:   "bg-blue-500/15 text-blue-400 border-blue-500/20",
  green:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  yellow: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  red:    "bg-red-500/15 text-red-400 border-red-500/20",
  gray:   "bg-slate-500/15 text-slate-400 border-slate-500/20",
};

export function Badge({ label, variant = "gray", className }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
      variants[variant],
      className
    )}>
      {label}
    </span>
  );
}
