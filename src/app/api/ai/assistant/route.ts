import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/supabase/server";
import { assistantMessageSchema } from "@/lib/validations/ai";
import { rateLimit, RATE_LIMITS, rateLimitKey } from "@/lib/rate-limit";
import { askAssistant, type AssistantContext } from "@/lib/ai/anthropic";
import type { LeadStatus } from "@/types/database";

/**
 * Builds a small, aggregated context object for the assistant instead of
 * ever forwarding the user's raw lead table. Only counts per status and
 * a short list of today's next actions are included — enough to answer
 * "quantos leads estão em negociação" or "quem eu preciso contatar hoje"
 * without exposing more than the assistant needs for this one question.
 */
async function buildContext(
  supabase: ReturnType<typeof import("@/lib/supabase/server").createClient>,
  userId: string,
  focusedLeadId?: string
): Promise<AssistantContext> {
  const statuses: LeadStatus[] = [
    "novo",
    "contatado",
    "respondeu",
    "proposta",
    "fechado",
    "perdido",
  ];

  const totals = { novo: 0, contatado: 0, respondeu: 0, proposta: 0, fechado: 0, perdido: 0 };

  await Promise.all(
    statuses.map(async (status) => {
      const { count } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", status);
      totals[status] = count ?? 0;
    })
  );

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const { data: leadsToday } = await supabase
    .from("leads")
    .select("company_name, next_action")
    .eq("user_id", userId)
    .not("next_action", "is", null)
    .lte("next_action_date", today.toISOString())
    .order("next_action_date", { ascending: true })
    .limit(10);

  let focusedLead = null;
  if (focusedLeadId) {
    const { data } = await supabase
      .from("leads")
      .select("company_name, category, address, phone, website, instagram, rating")
      .eq("id", focusedLeadId)
      .eq("user_id", userId)
      .maybeSingle();
    focusedLead = data ?? null;
  }

  return { totals, leadsToday: leadsToday ?? [], focusedLead };
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();

    const limited = rateLimit(rateLimitKey(user.id, "ai:assistant"), RATE_LIMITS.aiGeneration);
    if (!limited.success) {
      return NextResponse.json({ error: "Muitas perguntas em pouco tempo." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = assistantMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
    }

    const context = await buildContext(supabase as any, user.id, parsed.data.lead_id);
    const reply = await askAssistant({ message: parsed.data.message, context });

    await supabase.from("ai_generations").insert({
      user_id: user.id,
      lead_id: parsed.data.lead_id ?? null,
      type: "assistente",
      response: reply,
    });

    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    console.error("[POST /api/ai/assistant]", err);
    return NextResponse.json({ error: "Erro ao consultar o assistente." }, { status: 500 });
  }
}
