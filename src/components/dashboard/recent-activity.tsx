import { Activity } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import type { Interaction } from "@/types/database";

const TYPE_LABELS: Record<Interaction["type"], string> = {
  lead_criado: "Lead adicionado",
  mensagem_gerada: "Mensagem gerada com IA",
  mensagem_enviada: "Mensagem enviada",
  empresa_respondeu: "Empresa respondeu",
  proposta_enviada: "Proposta enviada",
  cliente_fechado: "Cliente fechado",
  lead_perdido: "Lead perdido",
  nota: "Observação adicionada",
  ligacao: "Ligação registrada",
  status_alterado: "Status alterado",
};

export function RecentActivity({
  activity,
}: {
  activity: (Interaction & { lead_name?: string })[];
}) {
  if (activity.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Nenhuma atividade ainda"
        description="Assim que você adicionar leads e registrar interações, elas aparecem aqui."
      />
    );
  }

  return (
    <ul className="space-y-4">
      {activity.map((item) => (
        <li key={item.id} className="flex gap-3 text-sm">
          <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
          <div>
            <p className="text-ink">
              <span className="font-medium">{TYPE_LABELS[item.type]}</span>
              {item.lead_name && <span className="text-muted"> · {item.lead_name}</span>}
            </p>
            <p className="text-xs text-muted">{formatDateTime(item.created_at)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
