"use client";
import { motion } from "framer-motion";
import { getStatus, StatusKey } from "@/lib/status";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  animate?: boolean;
}

export function StatusBadge({ status, size = "sm", animate = false }: StatusBadgeProps) {
  const s = getStatus(status);
  const px  = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  const badge = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${px}`}
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
      {s.label}
    </span>
  );

  if (!animate) return badge;

  return (
    <motion.span
      key={status}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {badge}
    </motion.span>
  );
}
