import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, startOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// ── Tailwind class merge ─────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date formatting ──────────────────────────────────────────────
export function formatDate(iso: string): string {
  return format(parseISO(iso), "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function formatDateShort(iso: string): string {
  return format(parseISO(iso), "dd/MM/yy", { locale: ptBR });
}

export function formatDayLabel(dateStr: string): string {
  return format(parseISO(dateStr), "dd/MM", { locale: ptBR });
}

// ── Phone formatting ─────────────────────────────────────────────
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return raw;
}

// ── Source label ─────────────────────────────────────────────────
export function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    form:    "Formulário",
    cta_btn: "Botão Kit",
    float:   "WhatsApp Flutuante",
  };
  return map[source] ?? source;
}

// ── Generate last-N-days skeleton (fill gaps with 0) ────────────
export function fillDayGaps(
  data: { date: string; count: number }[],
  days = 30
): { date: string; count: number }[] {
  const map = new Map(data.map((d) => [d.date, d.count]));
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = format(startOfDay(subDays(new Date(), i)), "yyyy-MM-dd");
    result.push({ date: day, count: map.get(day) ?? 0 });
  }
  return result;
}

// ── Device detection (server-side from user-agent) ───────────────
export function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

// ── Auth hash (SHA-256 simples para cookie de dashboard) ─────────
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + process.env.DASHBOARD_PASSWORD);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
