import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// PATCH /api/sellers/[id] — atualiza vendedor
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const allowed = ["name", "phone", "active"];
  const updates: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) {
      updates[key] = key === "phone" ? String(body[key]).replace(/\D/g, "") : body[key];
    }
  }
  updates.updated_at = new Date().toISOString();

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("sellers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ seller: data });
}

// DELETE /api/sellers/[id] — remove vendedor
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();
  const { error } = await supabase.from("sellers").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
