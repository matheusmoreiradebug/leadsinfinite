import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// GET /api/next-seller — retorna o próximo vendedor do rodízio
// Chamado no carregamento da landing page para pré-atribuir o vendedor
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.rpc("get_next_seller");

    if (error || !data?.length) {
      console.error("next-seller error:", error);
      return NextResponse.json({ error: "Sem vendedores ativos" }, { status: 503 });
    }

    const s = data[0] as { sid: string; sname: string; sphone: string };

    return NextResponse.json(
      { phone: s.sphone, name: s.sname },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
