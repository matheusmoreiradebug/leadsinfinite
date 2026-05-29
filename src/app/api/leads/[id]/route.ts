import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { OPEN_STATUSES } from "@/lib/status";

type Params = { params: Promise<{ id: string }> };

// GET /api/leads/[id] — lead completo com timeline e notas
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createServerClient();

  const [{ data: lead }, { data: events }, { data: notes }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).single(),
    supabase.from("lead_events").select("*").eq("lead_id", id).order("created_at", { ascending: true }),
    supabase.from("lead_notes").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
  ]);

  if (!lead) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });

  return NextResponse.json({ lead, events: events ?? [], notes: notes ?? [] });
}

// PATCH /api/leads/[id] — atualiza status
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const supabase = createServerClient();

  // Busca lead atual para registrar previous_status
  const { data: current } = await supabase
    .from("leads").select("status, customer_name").eq("id", id).single();

  if (!current) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });

  const updates: Record<string, unknown> = { last_interaction_at: new Date().toISOString() };

  if (body.status) {
    updates.status = body.status;
    if (body.status === "closed" || body.status === "lost") {
      updates.closed_at = new Date().toISOString();
    }
  }

  const { data: lead, error } = await supabase
    .from("leads").update(updates).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Registra evento na timeline
  if (body.status && body.status !== current.status) {
    await supabase.from("lead_events").insert({
      lead_id:         id,
      type:            "status_change",
      previous_status: current.status,
      new_status:      body.status,
      content:         `Status alterado de "${current.status}" para "${body.status}"`,
    });
  }

  return NextResponse.json({ lead });
}
