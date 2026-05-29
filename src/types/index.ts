// ═══════════════════════════════════════════════════════════════
//  Infinite Leads v2 — TypeScript Types
// ═══════════════════════════════════════════════════════════════

import { StatusKey } from "@/lib/status";

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
  status: StatusKey;
  last_interaction_at: string;
  assigned_at: string;
  closed_at: string | null;
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

export interface LeadEvent {
  id: string;
  lead_id: string;
  type: "created" | "status_change" | "note" | "assigned";
  content: string | null;
  previous_status: string | null;
  new_status: string | null;
  created_at: string;
}

export interface LeadNote {
  id: string;
  lead_id: string;
  content: string;
  created_at: string;
}

export interface LeadDetail {
  lead: Lead;
  events: LeadEvent[];
  notes: LeadNote[];
}

// ── API Payloads ─────────────────────────────────────────────────

export interface LeadPayload {
  customer_name?: string;
  customer_phone?: string;
  city?: string;
  state?: string;
  message?: string;
  source: "form" | "cta_btn" | "float";
  kit?: string;
  seller_phone?: string;
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_content?: string;
  utm_term?: string;
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

// ── Dashboard Stats ──────────────────────────────────────────────

export interface DashboardStats {
  total_leads: number;
  leads_today: number;
  leads_week: number;
  active_sellers: number;
  open_leads: number;
  no_response_leads: number;
  closed_leads: number;
  response_rate: number;
  recovery_opportunities: number;
  leads_by_seller: SellerStat[];
  leads_by_day: DayStat[];
  leads_by_source: SourceStat[];
  leads_by_campaign: CampaignStat[];
  leads_by_status: StatusStat[];
  leads_by_state: StateStat[];
}

export interface SellerStat   { seller_id: string; seller_name: string; count: number; percentage: number; }
export interface DayStat      { date: string; count: number; }
export interface SourceStat   { source: string; count: number; }
export interface CampaignStat { campaign: string; source: string; count: number; }
export interface StatusStat   { status: string; count: number; }
export interface StateStat    { state: string; count: number; }

// ── Recovery ─────────────────────────────────────────────────────

export interface RecoveryData {
  no_response: Lead[];
  forgotten: Lead[];
  cold: Lead[];
  lost_recent: Lead[];
}
