import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createServerClient();
  const now = new Date();

  const ago = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  const [noResponse, forgotten, cold, lostRecent] = await Promise.all([
    // Sem resposta: status 'new' há mais de 2h
    supabase.from("leads").select("*")
      .eq("status", "new")
      .lt("last_interaction_at", ago(2))
      .gte("created_at", daysAgo(60))
      .order("last_interaction_at", { ascending: true })
      .limit(20),

    // Esquecidos: status aberto há mais de 24h sem interação
    supabase.from("leads").select("*")
      .in("status", ["attending", "waiting", "followup", "negotiation", "quoted"])
      .lt("last_interaction_at", ago(24))
      .gte("created_at", daysAgo(60))
      .order("last_interaction_at", { ascending: true })
      .limit(20),

    // Frios: status 'waiting' ou 'followup' sem interação há mais de 48h
    supabase.from("leads").select("*")
      .in("status", ["waiting", "followup"])
      .lt("last_interaction_at", ago(48))
      .gte("created_at", daysAgo(60))
      .order("last_interaction_at", { ascending: true })
      .limit(20),

    // Perdidos recentes: status 'lost' nos últimos 7 dias (recuperáveis)
    supabase.from("leads").select("*")
      .eq("status", "lost")
      .gte("closed_at", daysAgo(7))
      .order("closed_at", { ascending: false })
      .limit(20),
  ]);

  return NextResponse.json({
    no_response:  noResponse.data  ?? [],
    forgotten:    forgotten.data   ?? [],
    cold:         cold.data        ?? [],
    lost_recent:  lostRecent.data  ?? [],
    summary: {
      no_response:  noResponse.data?.length  ?? 0,
      forgotten:    forgotten.data?.length   ?? 0,
      cold:         cold.data?.length        ?? 0,
      lost_recent:  lostRecent.data?.length  ?? 0,
      total: (noResponse.data?.length ?? 0) + (forgotten.data?.length ?? 0) +
             (cold.data?.length ?? 0) + (lostRecent.data?.length ?? 0),
    },
  });
}
