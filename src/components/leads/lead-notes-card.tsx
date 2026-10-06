"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import type { Lead } from "@/types/database";

export function LeadNotesCard({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [notes, setNotes] = React.useState(lead.notes ?? "");
  const [estimatedValue, setEstimatedValue] = React.useState(
    lead.estimated_value != null ? String(lead.estimated_value) : ""
  );
  const [nextAction, setNextAction] = React.useState(lead.next_action ?? "");
  const [nextActionDate, setNextActionDate] = React.useState(
    lead.next_action_date ? lead.next_action_date.slice(0, 10) : ""
  );
  const [saving, setSaving] = React.useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notes: notes || null,
        estimated_value: estimatedValue ? Number(estimatedValue) : null,
        next_action: nextAction || null,
        next_action_date: nextActionDate ? new Date(nextActionDate).toISOString() : null,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      toast.error("Não foi possível salvar as alterações");
      return;
    }

    toast.success("Lead atualizado");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Observações e próxima ação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contexto sobre a conversa, dores do cliente, etc."
            />
          </div>
          <div>
            <Label htmlFor="estimated_value">Valor da proposta (R$)</Label>
            <Input
              id="estimated_value"
              type="number"
              min="0"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="next_action">Próxima ação</Label>
              <Input
                id="next_action"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="Ex: Fazer follow-up"
              />
            </div>
            <div>
              <Label htmlFor="next_action_date">Data de follow-up</Label>
              <Input
                id="next_action_date"
                type="date"
                value={nextActionDate}
                onChange={(e) => setNextActionDate(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" size="sm" loading={saving}>
            Salvar alterações
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
