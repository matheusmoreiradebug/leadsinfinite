import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, formatDistanceToNow, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return format(parseISO(iso), "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function formatDateShort(iso: string): string {
  return format(parseISO(iso), "dd/MM/yy", { locale: ptBR });
}

export function formatDayLabel(dateStr: string): string {
  return format(parseISO(dateStr), "dd/MM", { locale: ptBR });
}

export function timeAgo(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { locale: ptBR, addSuffix: true });
}

export function minutesSince(iso: string): number {
  return differenceInMinutes(new Date(), parseISO(iso));
}

export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return raw;
}

export function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    form:    "Formulário",
    cta_btn: "Botão Kit",
    float:   "WhatsApp Float",
  };
  return map[source] ?? source;
}

export function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) return "mobile";
  return "desktop";
}

export function fillDayGaps(
  data: { date: string; count: number }[],
  days = 30
): { date: string; count: number }[] {
  const map = new Map(data.map((d) => [d.date, d.count]));
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = format(d, "yyyy-MM-dd");
    result.push({ date: day, count: map.get(day) ?? 0 });
  }
  return result;
}
