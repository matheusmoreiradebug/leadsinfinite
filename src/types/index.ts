// ═══════════════════════════════════════════════════════════════
//  Infinite Leads — TypeScript Types
// ═══════════════════════════════════════════════════════════════

export interface Seller {
  id: string;
  name: string;
  phone: string;
  active: boolean;
  leads_count: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  created_at: string;
  seller_id: string | null;
  seller_name: string | null;
  seller_phone: string | null;
  customer_name: string;
  customer_phone: string;
  city: string | null;
  state: string | null;
  message: string | null;
  source: "form" | "cta_btn" | "float" | string;
  kit: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  utm_term: string | null;
  device: "mobile" | "tablet" | "desktop" | string | null;
  landing_page: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export interface RotationState {
  id: number;
  current_index: number;
  updated_at: string;
}

// ── API payloads ─────────────────────────────────────────────────

export interface LeadPayload {
  // Dados do cliente (form)
  customer_name?: string;
  customer_phone?: string;
  city?: string;
  state?: string;
  message?: string;
  // Fonte do clique
  source: "form" | "cta_btn" | "float";
  kit?: string;
  // Vendedor escolhido localmente (cliente abre WA antes da resposta da API)
  seller_phone?: string;
  // UTMs (capturados na landing)
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_content?: string;
  utm_term?: string;
  // Device / contexto
  device?: string;
  landing_page?: string;
  user_agent?: string;
}

export interface ApiLeadResponse {
  success: boolean;
  wa_url?: string;
  seller_name?: string;
  lead_id?: string;
  error?: string;
}

// ── Dashboard stats ──────────────────────────────────────────────

export interface DashboardStats {
  total_leads: number;
  leads_today: number;
  leads_week: number;
  active_sellers: number;
  leads_by_seller: SellerStat[];
  leads_by_day: DayStat[];
  leads_by_source: SourceStat[];
  leads_by_campaign: CampaignStat[];
  leads_by_state: StateStat[];
}

export interface SellerStat {
  seller_id: string;
  seller_name: string;
  count: number;
  percentage: number;
}

export interface DayStat {
  date: string;   // YYYY-MM-DD
  count: number;
}

export interface SourceStat {
  source: string;
  count: number;
}

export interface CampaignStat {
  campaign: string;
  source: string;
  count: number;
}

export interface StateStat {
  state: string;
  count: number;
}
