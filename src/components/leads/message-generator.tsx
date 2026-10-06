"use client";

import * as React from "react";
import { toast } from "sonner";
import { MessageSquareText, Copy, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, Label } from "@/components/ui/input";

export function MessageGenerator({ leadId }: { leadId: string }) {
  const [message, setMessage] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [tone, setTone] = React.useState("padrao");
  const [goal, setGoal] = React.useState("primeira_abordagem");

  async function handleGenerate() {
    setLoading(true);
    const res = await fetch("/api/ai/generate-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: leadId, tone, goal }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("Não foi possível gerar a mensagem", { description: data.error });
      return;
    }

    const data = await res.json();
    setMessage(data.message);
  }

  function handleCopy() {
    if (!message) return;
    navigator.clipboard.writeText(message);
    toast.success("Mensagem copiada");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-brand" /> Gerador de mensagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="goal">Objetivo</Label>
            <Select id="goal" value={goal} onChange={(e) => setGoal(e.target.value)}>
              <option value="primeira_abordagem">Primeira abordagem</option>
              <option value="follow_up">Follow-up</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="tone">Tom</Label>
            <Select id="tone" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="padrao">Padrão</option>
              <option value="formal">Mais formal</option>
              <option value="descontraido">Mais descontraído</option>
            </Select>
          </div>
        </div>

        {message && (
          <div className="rounded-md bg-surface-raised p-4 text-sm leading-relaxed text-ink">
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleGenerate} loading={loading}>
            {message ? <RefreshCw className="h-3.5 w-3.5" /> : <MessageSquareText className="h-3.5 w-3.5" />}
            {message ? "Gerar outra" : "Gerar abordagem com IA"}
          </Button>
          {message && (
            <Button size="sm" variant="outline" onClick={handleCopy}>
              <Copy className="h-3.5 w-3.5" /> Copiar mensagem
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
