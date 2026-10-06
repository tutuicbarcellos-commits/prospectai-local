import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/supabase/server";
import { createLeadSchema, leadStatusSchema } from "@/lib/validations/lead";
import { rateLimit, RATE_LIMITS, rateLimitKey } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit-log";
import { PLAN_LIMITS, type PlanId } from "@/types/database";

export async function GET(request: Request) {
  try {
    const { supabase, user } = await requireUser();

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const statusCheck = statusParam ? leadStatusSchema.safeParse(statusParam) : null;

    let query = supabase
      .from("leads")
      .select("*")
      .eq("user_id", user.id) // belt-and-suspenders; RLS enforces this regardless
      .order("created_at", { ascending: false });

    if (statusCheck?.success) query = query.eq("status", statusCheck.data);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ leads: data });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    console.error("[GET /api/leads]", err);
    return NextResponse.json({ error: "Erro ao buscar leads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await requireUser();

    const limited = rateLimit(rateLimitKey(user.id, "leads:create"), RATE_LIMITS.leadWrite);
    if (!limited.success) {
      return NextResponse.json(
        { error: "Muitas requisições. Aguarde um momento e tente novamente." },
        { status: 429 }
      );
    }

    // Enforce the monthly lead quota from the user's real subscription row —
    // never from a value the client could pass in.
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
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", monthStart.toISOString());

    if ((count ?? 0) >= PLAN_LIMITS[plan].leadsPerMonth) {
      return NextResponse.json(
        {
          error: `Limite de ${PLAN_LIMITS[plan].leadsPerMonth} leads do plano ${plan} atingido neste mês. Faça upgrade para continuar.`,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = createLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({ ...parsed.data, user_id: user.id })
      .select("*")
      .single();

    if (error) throw error;

    await supabase.from("interactions").insert({
      lead_id: data.id,
      user_id: user.id,
      type: "lead_criado",
      description: `Lead "${data.company_name}" adicionado ao pipeline.`,
    });

    await logAudit(supabase, user.id, "lead.created", { lead_id: data.id });

    return NextResponse.json({ lead: data }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    console.error("[POST /api/leads]", err);
    return NextResponse.json({ error: "Erro ao criar lead" }, { status: 500 });
  }
}
