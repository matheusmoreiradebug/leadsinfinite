import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// GET /api/sellers — lista todos os vendedores
export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("sellers")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sellers: data });
}

// POST /api/sellers — cria novo vendedor
export async function POST(req: NextRequest) {
  const { name, phone } = await req.json();
  if (!name || !phone) {
    return NextResponse.json({ error: "name e phone são obrigatórios" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("sellers")
    .insert({ name, phone: phone.replace(/\D/g, "") })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ seller: data }, { status: 201 });
}
