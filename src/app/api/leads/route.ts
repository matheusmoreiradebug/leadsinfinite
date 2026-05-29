import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { detectDevice } from "@/lib/utils";
import { LeadPayload, ApiLeadResponse } from "@/types";

// Preflight CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiLeadResponse>> {
  try {
    const body: LeadPayload = await req.json();

    if (!body.source) {
      return NextResponse.json({ success: false, error: "source é obrigatório" }, { status: 400 });
    }

    const supabase = createServerClient();

    // ── Resolver vendedor ─────────────────────────────────────────
    // Se o cliente já escolheu localmente (WA já foi aberto), usamos esse vendedor.
    // Caso contrário, usamos o rodízio server-side.
    let sellerId: string, sellerName: string, sellerPhone: string;

    if (body.seller_phone) {
      // Busca vendedor pelo número (cliente fez rodízio local)
      const { data: s } = await supabase
        .from("sellers")
        .select("id, name, phone")
        .eq("phone", body.seller_phone.replace(/\D/g, ""))
        .single();

      if (s) {
        sellerId = s.id; sellerName = s.name; sellerPhone = s.phone;
      } else {
        // Fallback: número não encontrado → rotação server-side
        const { data: rows } = await supabase.rpc("get_next_seller");
        const r = rows?.[0];
        if (!r) return NextResponse.json({ success: false, error: "Sem vendedores ativos" }, { status: 503 });
        sellerId = r.sid; sellerName = r.sname; sellerPhone = r.sphone;
      }
    } else {
      // Rodízio server-side (atômico via função SQL)
      const { data: rows, error } = await supabase.rpc("get_next_seller");
      if (error || !rows?.length) {
        console.error("Rotation error:", error);
        return NextResponse.json({ success: false, error: "Sem vendedores ativos" }, { status: 503 });
      }
      const r = rows[0];
      sellerId = r.sid; sellerName = r.sname; sellerPhone = r.sphone;
    }

    // ── Device & IP ───────────────────────────────────────────────
    const ua     = req.headers.get("user-agent") ?? "";
    const device = body.device ?? detectDevice(ua);
    const ip     = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? req.headers.get("x-real-ip")
      ?? "unknown";

    // ── Salvar lead ───────────────────────────────────────────────
    const { data: lead, error: insertErr } = await supabase
      .from("leads")
      .insert({
        seller_id:      sellerId,
        seller_name:    sellerName,
        seller_phone:   sellerPhone,
        customer_name:  body.customer_name  ?? "—",
        customer_phone: body.customer_phone ?? "—",
        city:     body.city,
        state:    body.state,
        message:  body.message,
        source:   body.source,
        kit:      body.kit,
        utm_source:   body.utm_source,
        utm_campaign: body.utm_campaign,
        utm_medium:   body.utm_medium,
        utm_content:  body.utm_content,
        utm_term:     body.utm_term,
        device,
        landing_page: body.landing_page,
        ip_address:   ip,
        user_agent:   ua,
      })
      .select("id")
      .single();

    if (insertErr) console.error("Lead insert error:", insertErr);

    // ── Incrementar contador do vendedor ──────────────────────────

    // Incrementa contador via select + update (simples e sem função extra)
    const { data: curSeller } = await supabase
      .from("sellers").select("leads_count").eq("id", sellerId).single();
    if (curSeller) {
      await supabase.from("sellers")
        .update({ leads_count: (curSeller.leads_count ?? 0) + 1, updated_at: new Date().toISOString() })
        .eq("id", sellerId);
    }

    // ── Montar WA URL (para fallback — caso cliente não tenha aberto) ──
    let waText = "Olá! Vim pelo site da Infinite Móveis Modulados e gostaria de um orçamento.";
    if (body.source === "form" && body.customer_name) {
      waText = [
        "Olá! Vim pelo site da Infinite Móveis Modulados e gostaria de um orçamento.\n",
        `*Nome:* ${body.customer_name}`,
        body.customer_phone ? `*WhatsApp:* ${body.customer_phone}` : "",
        body.city ? `*Cidade/Estado:* ${body.city}${body.state ? " - " + body.state : ""}` : "",
        body.message ? `*Obs:* ${body.message}` : "",
      ].filter(Boolean).join("\n");
    } else if (body.kit) {
      waText = `Olá! Vim pelo site da Infinite Móveis e tenho interesse no *${body.kit}*. Pode me passar um orçamento?`;
    }

    return NextResponse.json(
      { success: true, wa_url: `https://wa.me/${sellerPhone}?text=${encodeURIComponent(waText)}`, seller_name: sellerName, lead_id: lead?.id },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (err) {
    console.error("API /leads error:", err);
    return NextResponse.json({ success: false, error: "Erro interno" }, { status: 500 });
  }
}
