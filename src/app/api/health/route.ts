import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET() {
  const checks: Record<string, string> = {};

  // Verifica env vars
  checks.supabase_url     = process.env.NEXT_PUBLIC_SUPABASE_URL     ? "✅" : "❌ não configurado";
  checks.supabase_anon    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅" : "❌ não configurado";
  checks.service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY     ? "✅" : "❌ não configurado";
  checks.dashboard_pass   = process.env.DASHBOARD_PASSWORD             ? "✅" : "❌ não configurado";

  // Verifica conexão com Supabase
  try {
    const supabase = createServerClient();
    const { data: sellers, error } = await supabase
      .from("sellers")
      .select("id, name, active")
      .order("created_at");

    if (error) {
      checks.supabase_connection = `❌ ${error.message}`;
      checks.sellers = "❌ não verificado";
    } else {
      checks.supabase_connection = "✅ conectado";
      checks.sellers = sellers?.length
        ? `✅ ${sellers.length} vendedor(es): ${sellers.map(s => s.name).join(", ")}`
        : "⚠️ nenhum vendedor cadastrado — rode /api/seed";
    }

    const { data: rotState } = await supabase
      .from("rotation_state")
      .select("current_index")
      .single();
    checks.rotation = rotState
      ? `✅ índice atual: ${rotState.current_index}`
      : "⚠️ rotation_state não encontrado";

    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });
    checks.leads_total = `✅ ${count ?? 0} lead(s) registrado(s)`;

  } catch (err) {
    checks.supabase_connection = `❌ erro: ${err}`;
  }

  const allOk = Object.values(checks).every(v => v.startsWith("✅"));

  return NextResponse.json({ status: allOk ? "ok" : "degraded", checks }, {
    status: allOk ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  });
}
