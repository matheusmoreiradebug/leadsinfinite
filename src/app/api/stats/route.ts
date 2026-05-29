import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { DashboardStats } from "@/types";
import { format, subDays, startOfDay } from "date-fns";
import { OPEN_STATUSES } from "@/lib/status";

export async function GET() {
  const supabase = createServerClient();

  const today      = format(startOfDay(new Date()), "yyyy-MM-dd");
  const weekStart  = format(startOfDay(subDays(new Date(), 6)), "yyyy-MM-dd");
  const monthStart = format(startOfDay(subDays(new Date(), 29)), "yyyy-MM-dd");
  const ago2h      = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const ago30m     = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const [
    { count: total },
    { count: todayCount },
    { count: weekCount },
    { data: sellers },
    { data: leads30 },
    { count: openCount },
    { count: noResponseCount },
    { count: closedCount },
    { count: respondedIn30m },
    { count: newLeadsTotal },
    { count: recoveryCount },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", today),
    supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", weekStart),
    supabase.from("sellers").select("id, name, leads_count, active"),
    supabase.from("leads")
      .select("created_at, seller_id, seller_name, source, utm_source, utm_campaign, state, status")
      .gte("created_at", monthStart)
      .order("created_at", { ascending: true }),
    supabase.from("leads").select("*", { count: "exact", head: true })
      .in("status", OPEN_STATUSES as unknown as string[]),
    supabase.from("leads").select("*", { count: "exact", head: true })
      .eq("status", "new").lt("last_interaction_at", ago2h),
    supabase.from("leads").select("*", { count: "exact", head: true })
      .eq("status", "closed"),
    // Leads que saíram de 'new' em menos de 30 min (respondidos rápido)
    supabase.from("lead_events").select("*", { count: "exact", head: true })
      .eq("type", "status_change").eq("previous_status", "new")
      .gte("created_at", ago30m),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    // Oportunidades de recuperação
    supabase.from("leads").select("*", { count: "exact", head: true })
      .in("status", ["new", "waiting", "followup"] as string[])
      .lt("last_interaction_at", ago2h),
  ]);

  const activeSellers = sellers?.filter((s) => s.active).length ?? 0;
  const responseRate  = newLeadsTotal ? Math.round(((respondedIn30m ?? 0) / (newLeadsTotal || 1)) * 100) : 0;

  // Leads por vendedor
  const sellerMap = new Map<string, { name: string; count: number }>();
  for (const lead of leads30 ?? []) {
    if (!lead.seller_id) continue;
    const e = sellerMap.get(lead.seller_id);
    if (e) e.count++; else sellerMap.set(lead.seller_id, { name: lead.seller_name ?? "—", count: 1 });
  }
  const totalLS = Array.from(sellerMap.values()).reduce((s, v) => s + v.count, 0);
  const leadsBySeller = Array.from(sellerMap.entries()).map(([id, v]) => ({
    seller_id: id, seller_name: v.name, count: v.count,
    percentage: totalLS ? Math.round((v.count / totalLS) * 100) : 0,
  }));

  // Leads por dia (últimos 30)
  const dayMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) dayMap.set(format(subDays(new Date(), i), "yyyy-MM-dd"), 0);
  for (const lead of leads30 ?? []) {
    const day = lead.created_at.slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }
  const leadsByDay = Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }));

  // Leads por source
  const srcMap = new Map<string, number>();
  for (const l of leads30 ?? []) srcMap.set(l.source ?? "—", (srcMap.get(l.source ?? "—") ?? 0) + 1);
  const leadsBySource = Array.from(srcMap.entries()).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);

  // Leads por campanha
  const campMap = new Map<string, { source: string; count: number }>();
  for (const l of leads30 ?? []) {
    const camp = l.utm_campaign ?? "(direto)";
    const src  = l.utm_source  ?? "(orgânico)";
    const key  = `${camp}|||${src}`;
    const ex   = campMap.get(key);
    if (ex) ex.count++; else campMap.set(key, { source: src, count: 1 });
  }
  const leadsByCampaign = Array.from(campMap.entries())
    .map(([k, v]) => ({ campaign: k.split("|||")[0], source: v.source, count: v.count }))
    .sort((a, b) => b.count - a.count).slice(0, 10);

  // Leads por status
  const statusMap = new Map<string, number>();
  for (const l of leads30 ?? []) statusMap.set(l.status ?? "new", (statusMap.get(l.status ?? "new") ?? 0) + 1);
  const leadsByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

  // Leads por estado
  const stateMap = new Map<string, number>();
  for (const l of leads30 ?? []) { if (!l.state) continue; stateMap.set(l.state, (stateMap.get(l.state) ?? 0) + 1); }
  const leadsByState = Array.from(stateMap.entries()).map(([state, count]) => ({ state, count })).sort((a, b) => b.count - a.count).slice(0, 10);

  const stats: DashboardStats = {
    total_leads:            total ?? 0,
    leads_today:            todayCount ?? 0,
    leads_week:             weekCount ?? 0,
    active_sellers:         activeSellers,
    open_leads:             openCount ?? 0,
    no_response_leads:      noResponseCount ?? 0,
    closed_leads:           closedCount ?? 0,
    response_rate:          responseRate,
    recovery_opportunities: recoveryCount ?? 0,
    leads_by_seller:        leadsBySeller,
    leads_by_day:           leadsByDay,
    leads_by_source:        leadsBySource,
    leads_by_campaign:      leadsByCampaign,
    leads_by_status:        leadsByStatus,
    leads_by_state:         leadsByState,
  };

  return NextResponse.json(stats, {
    headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=15" },
  });
}
