import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/supabase/server";
import { leadIdParamSchema, updateLeadSchema } from "@/lib/validations/lead";
import { rateLimit, RATE_LIMITS, rateLimitKey } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit-log";

/**
 * Every handler here re-derives the caller's identity from the session
 * (via requireUser) and filters by `.eq("user_id", user.id)` in addition
 * to relying on Postgres RLS. The `:id` in the URL is never trusted on
 * its own — Test 1 in the brief ("user A opens user B's lead") resolves
 * to a 404, not the other user's data, because the row simply doesn't
 * match the RLS-scoped query.
 */

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { supabase, user } = await requireUser();

    const idCheck = leadIdParamSchema.safeParse(params.id);
    if (!idCheck.success) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    if (!lead) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    const { data: interactions } = await supabase
      .from("interactions")
      .select("*")
      .eq("lead_id", lead.id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ lead, interactions: interactions ?? [] });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    console.error("[GET /api/leads/:id]", err);
    return NextResponse.json({ error: "Erro ao buscar lead" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { supabase, user } = await requireUser();

    const limited = rateLimit(rateLimitKey(user.id, "leads:write"), RATE_LIMITS.leadWrite);
    if (!limited.success) {
      return NextResponse.json({ error: "Muitas requisições." }, { status: 429 });
    }

    const idCheck = leadIdParamSchema.safeParse(params.id);
    if (!idCheck.success) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("leads")
      .select("id, status")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    const { data: updated, error } = await supabase
      .from("leads")
      .update(parsed.data)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (error) throw error;

    if (parsed.data.status && parsed.data.status !== existing.status) {
      await supabase.from("interactions").insert({
        lead_id: params.id,
        user_id: user.id,
        type: "status_alterado",
        description: `Status alterado para "${parsed.data.status}".`,
      });
      await supabase
        .from("leads")
        .update({ last_interaction_at: new Date().toISOString() })
        .eq("id", params.id)
        .eq("user_id", user.id);
    }

    await logAudit(supabase, user.id, "lead.updated", { lead_id: params.id });

    return NextResponse.json({ lead: updated });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    console.error("[PATCH /api/leads/:id]", err);
    return NextResponse.json({ error: "Erro ao atualizar lead" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { supabase, user } = await requireUser();

    const idCheck = leadIdParamSchema.safeParse(params.id);
    if (!idCheck.success) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { data: deleted, error } = await supabase
      .from("leads")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!deleted) {
      return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
    }

    await logAudit(supabase, user.id, "lead.deleted", { lead_id: params.id });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    console.error("[DELETE /api/leads/:id]", err);
    return NextResponse.json({ error: "Erro ao excluir lead" }, { status: 500 });
  }
}
