import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/supabase/server";
import { analyzeCompanySchema } from "@/lib/validations/ai";
import { rateLimit, RATE_LIMITS, rateLimitKey } from "@/lib/rate-limit";
import { analyzeCompanyOpportunity } from "@/lib/ai/anthropic";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();

    const limited = rateLimit(rateLimitKey(user.id, "ai:analyze"), RATE_LIMITS.aiGeneration);
    if (!limited.success) {
      return NextResponse.json({ error: "Muitas análises em pouco tempo." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = analyzeCompanySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { data: lead } = await supabase
      .from("leads")
      .select("company_name, category, address, phone, website, instagram, rating")
      .eq("id", parsed.data.lead_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    const analysis = await analyzeCompanyOpportunity(lead);

    await supabase
      .from("leads")
      .update({ opportunity: analysis.classificacao })
      .eq("id", parsed.data.lead_id)
      .eq("user_id", user.id);

    await supabase.from("ai_generations").insert({
      user_id: user.id,
      lead_id: parsed.data.lead_id,
      type: "analise_empresa",
      response: JSON.stringify(analysis),
    });

    return NextResponse.json({ analysis });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    console.error("[POST /api/ai/analyze-company]", err);
    return NextResponse.json({ error: "Erro ao analisar empresa." }, { status: 500 });
  }
}
