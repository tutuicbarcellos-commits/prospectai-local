import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/supabase/server";
import { generateMessageSchema } from "@/lib/validations/ai";
import { rateLimit, RATE_LIMITS, rateLimitKey } from "@/lib/rate-limit";
import { generateOutreachMessage } from "@/lib/ai/anthropic";
import { PLAN_LIMITS, type PlanId } from "@/types/database";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();

    const limited = rateLimit(rateLimitKey(user.id, "ai:generate"), RATE_LIMITS.aiGeneration);
    if (!limited.success) {
      return NextResponse.json(
        { error: "Muitas gerações em pouco tempo. Aguarde um instante." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = generateMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Monthly AI-generation quota, enforced server-side from the real
    // subscription row — never trust a plan name sent by the client.
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .single();
    const plan = (subscription?.plan ?? "free") as PlanId;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("ai_generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", monthStart.toISOString());

    if ((count ?? 0) >= PLAN_LIMITS[plan].aiGenerationsPerMonth) {
      return NextResponse.json(
        {
          error: `Limite de ${PLAN_LIMITS[plan].aiGenerationsPerMonth} gerações de IA do plano ${plan} atingido neste mês.`,
        },
        { status: 403 }
      );
    }

    // Fetch only this lead, only if it belongs to the caller, and only
    // the fields the AI actually needs — never the user's full lead list.
    const { data: lead } = await supabase
      .from("leads")
      .select("company_name, category, address, phone, website, instagram, rating")
      .eq("id", parsed.data.lead_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    const message = await generateOutreachMessage({
      lead,
      senderName: profile?.name || "um profissional",
      senderService: "criação de sites e presença online para empresas locais",
      tone: parsed.data.tone,
      goal: parsed.data.goal,
    });

    const { data: generation, error } = await supabase
      .from("ai_generations")
      .insert({
        user_id: user.id,
        lead_id: parsed.data.lead_id,
        type: parsed.data.goal === "follow_up" ? "follow_up" : "abordagem",
        response: message,
      })
      .select("*")
      .single();

    if (error) throw error;

    await supabase.from("interactions").insert({
      lead_id: parsed.data.lead_id,
      user_id: user.id,
      type: "mensagem_gerada",
      description: "Mensagem de abordagem gerada com IA.",
    });

    return NextResponse.json({ message, generation });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    console.error("[POST /api/ai/generate-message]", err);
    return NextResponse.json(
      { error: "Erro ao gerar mensagem. Tente novamente." },
      { status: 500 }
    );
  }
}
