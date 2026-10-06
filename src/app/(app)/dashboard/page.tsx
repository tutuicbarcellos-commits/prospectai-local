import {
  Users,
  UserPlus,
  MessageCircle,
  Handshake,
  FileText,
  Trophy,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { PipelineChart } from "@/components/dashboard/pipeline-chart";
import { NextActions } from "@/components/dashboard/next-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyBRL } from "@/lib/utils";
import { STATUS_LABELS, PIPELINE_COLUMNS } from "@/lib/lead-display";
import type { Lead } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Every query below is implicitly scoped by RLS to this user's own rows —
  // there is no code path here that can read another user's leads.
  const { data: leads } = await supabase
    .from("leads")
    .select("id, status, estimated_value, next_action, next_action_date, company_name, created_at")
    .eq("user_id", user!.id);

  const allLeads = (leads ?? []) as Pick<
    Lead,
    "id" | "status" | "estimated_value" | "next_action" | "next_action_date" | "company_name" | "created_at"
  >[];

  const total = allLeads.length;
  const byStatus = (status: Lead["status"]) => allLeads.filter((l) => l.status === status).length;
  const novos = byStatus("novo");
  const contatados = byStatus("contatado");
  const emNegociacao = byStatus("proposta");
  const propostasEnviadas = allLeads.filter((l) =>
    ["proposta", "fechado", "perdido"].includes(l.status)
  ).length;
  const fechados = byStatus("fechado");
  const perdidos = byStatus("perdido");

  const valorPotencial = allLeads
    .filter((l) => !["fechado", "perdido"].includes(l.status))
    .reduce((sum, l) => sum + (l.estimated_value ?? 0), 0);

  const decididos = fechados + perdidos;
  const taxaConversao = decididos > 0 ? (fechados / decididos) * 100 : 0;

  const chartData = PIPELINE_COLUMNS.map((col) => ({
    status: STATUS_LABELS[col.status],
    total: byStatus(col.status),
  }));

  const proximasAcoes = allLeads
    .filter((l) => l.next_action)
    .sort((a, b) => {
      if (!a.next_action_date) return 1;
      if (!b.next_action_date) return -1;
      return new Date(a.next_action_date).getTime() - new Date(b.next_action_date).getTime();
    })
    .slice(0, 6);

  const { data: recentInteractions } = await supabase
    .from("interactions")
    .select("*, leads(company_name)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const activity = (recentInteractions ?? []).map((item: any) => ({
    ...item,
    lead_name: item.leads?.company_name,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de leads" value={String(total)} icon={Users} />
        <StatCard label="Leads novos" value={String(novos)} icon={UserPlus} />
        <StatCard label="Contatados" value={String(contatados)} icon={MessageCircle} />
        <StatCard label="Em negociação" value={String(emNegociacao)} icon={Handshake} />
        <StatCard label="Propostas enviadas" value={String(propostasEnviadas)} icon={FileText} />
        <StatCard label="Clientes fechados" value={String(fechados)} icon={Trophy} />
        <StatCard label="Valor potencial" value={formatCurrencyBRL(valorPotencial)} icon={Wallet} />
        <StatCard
          label="Taxa de conversão"
          value={`${taxaConversao.toFixed(1)}%`}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Leads por etapa do pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {total === 0 ? (
              <p className="py-10 text-center text-sm text-muted">
                Adicione leads para ver a distribuição do seu pipeline.
              </p>
            ) : (
              <PipelineChart data={chartData} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas ações</CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-0">
            <NextActions leads={proximasAcoes} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividade recente</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivity activity={activity} />
        </CardContent>
      </Card>
    </div>
  );
}
