import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

// Vendedores do rodízio da Landing Page Infinite Móveis
const SELLERS = [
  { name: "Especialista 1", phone: "5511942719647" },
  { name: "Especialista 2", phone: "5511986046078" },
  { name: "Especialista 3", phone: "5511919477218" },
  { name: "Especialista 4", phone: "5511996063975" },
  { name: "Especialista 5", phone: "5511985953197" },
];

export async function POST() {
  try {
    const supabase = createServerClient();

    // Garante que rotation_state existe
    await supabase
      .from("rotation_state")
      .upsert({ id: 1, current_index: 0 }, { onConflict: "id", ignoreDuplicates: true });

    // Insere vendedores (ignora duplicatas por phone)
    const results = [];
    for (const seller of SELLERS) {
      const { data, error } = await supabase
        .from("sellers")
        .upsert(seller, { onConflict: "phone", ignoreDuplicates: true })
        .select();

      results.push({ seller: seller.name, status: error ? `erro: ${error.message}` : "ok", data });
    }

    // Busca lista final
    const { data: allSellers } = await supabase
      .from("sellers")
      .select("id, name, phone, active")
      .order("created_at");

    return NextResponse.json({
      success: true,
      message: `${allSellers?.length ?? 0} vendedor(es) no banco`,
      sellers: allSellers,
      results,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

// GET para facilitar teste no browser
export async function GET() {
  return POST();
}
