"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import type { Interaction, InteractionType } from "@/types/database";

const TYPE_LABELS: Record<InteractionType, string> = {
  lead_criado: "Lead adicionado",
  mensagem_gerada: "Mensagem gerada com IA",
  mensagem_enviada: "Mensagem enviada",
  empresa_respondeu: "Empresa respondeu",
  proposta_enviada: "Proposta enviada",
  cliente_fechado: "Cliente fechado",
  lead_perdido: "Lead perdido",
  nota: "Observação",
  ligacao: "Ligação",
  status_alterado: "Status alterado",
};

export function ActivityTimeline({
  leadId,
  interactions,
}: {
  leadId: string;
  interactions: Interaction[];
}) {
  const router = useRouter();
  const [type, setType] = React.useState<InteractionType>("mensagem_enviada");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;

    setSaving(true);
    const res = await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: leadId, type, description }),
    });
    setSaving(false);

    if (!res.ok) {
      toast.error("Não foi possível registrar a interação");
      return;
    }

    setDescription("");
    toast.success("Interação registrada");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4 text-brand" /> Histórico de atividades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
            <Select value={type} onChange={(e) => setType(e.target.value as InteractionType)}>
              {Object.entries(TYPE_LABELS)
                .filter(([value]) => value !== "lead_criado" && value !== "status_alterado")
                .map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
            </Select>
            <Textarea
              rows={2}
              placeholder="Descreva o que aconteceu"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" loading={saving}>
            Registrar interação
          </Button>
        </form>

        {interactions.length === 0 ? (
          <EmptyState
            icon={History}
            title="Nenhuma interação registrada"
            description="Registre contatos, mensagens e propostas para acompanhar o histórico deste lead."
          />
        ) : (
          <ol className="space-y-4 border-l border-border pl-4">
            {interactions.map((item) => (
              <li key={item.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-brand" />
                <p className="text-sm font-medium text-ink">{TYPE_LABELS[item.type]}</p>
                <p className="text-sm text-muted">{item.description}</p>
                <p className="mt-0.5 text-xs text-muted">{formatDateTime(item.created_at)}</p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
