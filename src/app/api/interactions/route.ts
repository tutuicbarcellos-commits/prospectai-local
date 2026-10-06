import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/supabase/server";
import { createInteractionSchema } from "@/lib/validations/lead";
import { rateLimit, RATE_LIMITS, rateLimitKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();

    const limited = rateLimit(rateLimitKey(user.id, "interactions:create"), RATE_LIMITS.leadWrite);
    if (!limited.success) {
      return NextResponse.json({ error: "Muitas requisições." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = createInteractionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Ownership check: the lead referenced must belong to the caller.
    // RLS also enforces this at the database level — this is a fast,
    // explicit failure path with a clear error message.
    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("id", parsed.data.lead_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("interactions")
      .insert({ ...parsed.data, user_id: user.id })
      .select("*")
      .single();

    if (error) throw error;

    await supabase
      .from("leads")
      .update({ last_interaction_at: new Date().toISOString() })
      .eq("id", parsed.data.lead_id)
      .eq("user_id", user.id);

    return NextResponse.json({ interaction: data }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    console.error("[POST /api/interactions]", err);
    return NextResponse.json({ error: "Erro ao registrar interação" }, { status: 500 });
  }
}
