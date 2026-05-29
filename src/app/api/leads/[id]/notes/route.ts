import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

type Params = { params: Promise<{ id: string }> };

// GET /api/leads/[id]/notes
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("lead_notes").select("*").eq("lead_id", id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data });
}

// POST /api/leads/[id]/notes
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Conteúdo obrigatório" }, { status: 400 });

  const supabase = createServerClient();
  const now = new Date().toISOString();

  // Insere nota
  const { data: note, error } = await supabase
    .from("lead_notes").insert({ lead_id: id, content: content.trim() }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Registra evento na timeline
  await supabase.from("lead_events").insert({
    lead_id: id, type: "note", content: content.trim(),
  });

  // Atualiza last_interaction_at
  await supabase.from("leads").update({ last_interaction_at: now }).eq("id", id);

  return NextResponse.json({ note }, { status: 201 });
}
