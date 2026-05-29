"use client";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AlertBannerProps {
  count: number;
}

export function AlertBanner({ count }: AlertBannerProps) {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border"
      style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.2)" }}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
        <p className="text-sm text-red-200">
          <span className="font-semibold text-red-300">{count} lead{count > 1 ? "s" : ""}</span>
          {" "}sem resposta há mais de 2 horas
        </p>
      </div>
      <Link
        href="/dashboard/recovery"
        className="flex items-center gap-1.5 text-xs font-semibold text-red-300 hover:text-red-200 transition-colors flex-shrink-0"
      >
        Ver agora <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}
