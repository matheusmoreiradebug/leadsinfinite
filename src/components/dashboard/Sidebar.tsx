"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare, LogOut, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard",          label: "Visão Geral",  icon: LayoutDashboard },
  { href: "/dashboard/leads",    label: "Leads",        icon: MessageSquare },
  { href: "/dashboard/sellers",  label: "Vendedores",   icon: Users },
];

export function Sidebar() {
  const path = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-60 flex flex-col bg-[#12151f] border-r border-white/[0.06] z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Infinity className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-white leading-none">Infinite</div>
          <div className="text-[10px] text-slate-500 leading-none mt-0.5">Lead Tracker</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href));
          return (
            <Link key={href} href={href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              active
                ? "bg-blue-600/20 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
            )}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/[0.06]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
