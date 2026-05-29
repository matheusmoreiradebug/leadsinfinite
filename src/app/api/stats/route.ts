import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { DashboardStats } from "@/types";
import { format, subDays, startOfDay } from "date-fns";

export async function GET() {
  const supabase = createServerClient();

  const today     = format(startOfDay(new Date()), "yyyy-MM-dd");
  const weekStart = format(startOfDay(subDays(new Date(), 6)), "yyyy-MM-dd");
  const monthStart = format(startOfDay(subDays(new Date(), 29)), "yyyy-MM-dd");

  // Todas as queries em paralelo
  const [
    { count: total },
    { count: todayCount },
    { count: weekCount },
    { data: sellers },
    { data: leads30 },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true })
      .gte("created_at", today),
    supabase.from("leads").select("*", { count: "exact", head: true })
      .gte("created_at", weekStart),
    supabase.from("sellers").select("id, name, leads_count, active"),
    supabase.from("leads")
      .select("created_at, seller_id, seller_name, source, utm_source, utm_campaign, state")
      .gte("created_at", monthStart)
      .order("created_at", { ascending: true }),
  ]);

  const activeSellers = sellers?.filter((s) => s.active).length ?? 0;

  // Leads por vendedor
  const sellerMap = new Map<string, { name: string; count: number }>();
  for (const lead of leads30 ?? []) {
    if (!lead.seller_id) continue;
    const existing = sellerMap.get(lead.seller_id);
    if (existing) existing.count++;
    else sellerMap.set(lead.seller_id, { name: lead.seller_name ?? "—", count: 1 });
  }
  const totalLeadsSellers = Array.from(sellerMap.values()).reduce((s, v) => s + v.count, 0);
  const leadsBySeller = Array.from(sellerMap.entries()).map(([id, v]) => ({
    seller_id:   id,
    seller_name: v.name,
    count:       v.count,
    percentage:  totalLeadsSellers ? Math.round((v.count / totalLeadsSellers) * 100) : 0,
  }));

  // Leads por dia (últimos 30)
  const dayMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    dayMap.set(format(subDays(new Date(), i), "yyyy-MM-dd"), 0);
  }
  for (const lead of leads30 ?? []) {
    const day = lead.created_at.slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const leadsByDay = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));

  // Leads por source
  const sourceMap = new Map<string, number>();
  for (const lead of leads30 ?? []) {
    sourceMap.set(lead.source ?? "—", (sourceMap.get(lead.source ?? "—") ?? 0) + 1);
  }
  const leadsBySource = Array.from(sourceMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Leads por campanha UTM
  const campMap = new Map<string, { source: string; count: number }>();
  for (const lead of leads30 ?? []) {
    const camp = lead.utm_campaign ?? "(direto)";
    const src  = lead.utm_source ?? "(orgânico)";
    const key  = `${camp}|||${src}`;
    const ex   = campMap.get(key);
    if (ex) ex.count++;
    else campMap.set(key, { source: src, count: 1 });
  }
  const leadsByCampaign = Array.from(campMap.entries())
    .map(([key, v]) => ({ campaign: key.split("|||")[0], source: v.source, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Leads por estado
  const stateMap = new Map<string, number>();
  for (const lead of leads30 ?? []) {
    if (!lead.state) continue;
    stateMap.set(lead.state, (stateMap.get(lead.state) ?? 0) + 1);
  }
  const leadsByState = Array.from(stateMap.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const stats: DashboardStats = {
    total_leads:      total ?? 0,
    leads_today:      todayCount ?? 0,
    leads_week:       weekCount ?? 0,
    active_sellers:   activeSellers,
    leads_by_seller:  leadsBySeller,
    leads_by_day:     leadsByDay,
    leads_by_source:  leadsBySource,
    leads_by_campaign: leadsByCampaign,
    leads_by_state:   leadsByState,
  };

  return NextResponse.json(stats, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=30" },
  });
}
