"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, MessageSquare, LogOut, Infinity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard",           label: "Visão Geral",  icon: LayoutDashboard },
  { href: "/dashboard/leads",     label: "Leads",        icon: MessageSquare   },
  { href: "/dashboard/recovery",  label: "Recuperação",  icon: AlertTriangle   },
  { href: "/dashboard/sellers",   label: "Vendedores",   icon: Users           },
];

export function Sidebar() {
  const path   = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-60 flex flex-col z-40"
      style={{ background: "#0a0a0f", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.05]">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 0 20px rgba(37,99,235,0.4)" }}>
          <Infinity className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-white leading-none tracking-tight">Infinite Leads</div>
          <div className="text-[10px] text-slate-600 leading-none mt-0.5">CRM Operacional</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }, i) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          const isRecovery = href === "/dashboard/recovery";
          return (
            <motion.div
              key={href}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={href} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "text-white"
                  : isRecovery
                    ? "text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10"
                    : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.05]"
              )}
              style={active ? {
                background: "rgba(37,99,235,0.15)",
                border: "1px solid rgba(37,99,235,0.25)",
                color: "#93c5fd",
              } : { border: "1px solid transparent" }}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.05]">
        <div className="px-3 py-2 mb-2">
          <p className="text-[10px] text-slate-700 uppercase tracking-wider font-medium">Infinite Móveis</p>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent">
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
