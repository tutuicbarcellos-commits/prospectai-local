import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/settings/profile-form";
import { PLAN_LIMITS, type PlanId } from "@/types/database";

export const dynamic = "force-dynamic";

const PLAN_NAMES: Record<PlanId, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  agency: "Agency",
};

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user!.id)
    .single();

  const plan = (subscription?.plan ?? "free") as PlanId;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count: leadsThisMonth } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .gte("created_at", monthStart.toISOString());

  const { count: generationsThisMonth } = await supabase
    .from("ai_generations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .gte("created_at", monthStart.toISOString());

  const limits = PLAN_LIMITS[plan];

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm name={profile?.name ?? ""} email={profile?.email ?? user!.email ?? ""} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plano e uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">Plano atual</p>
              <p className="text-sm text-muted">{PLAN_NAMES[plan]}</p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-muted">
              <span>Leads este mês</span>
              <span>{leadsThisMonth ?? 0} / {limits.leadsPerMonth}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full bg-brand"
                style={{
                  width: `${Math.min(100, ((leadsThisMonth ?? 0) / limits.leadsPerMonth) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-muted">
              <span>Gerações de IA este mês</span>
              <span>{generationsThisMonth ?? 0} / {limits.aiGenerationsPerMonth}</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full bg-brand"
                style={{
                  width: `${Math.min(100, ((generationsThisMonth ?? 0) / limits.aiGenerationsPerMonth) * 100)}%`,
                }}
              />
            </div>
          </div>

          <p className="text-xs text-muted">
            A cobrança via Stripe ou Mercado Pago ainda não está ativa neste ambiente — o
            upgrade de plano será feito diretamente pelo painel assim que a integração de
            pagamentos estiver disponível.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
