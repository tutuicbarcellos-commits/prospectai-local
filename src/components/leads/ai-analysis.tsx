"use client";

import * as React from "react";
import { toast } from "sonner";
import { Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OPPORTUNITY_LABELS, OPPORTUNITY_TONE } from "@/lib/lead-display";
import type { LeadOpportunity } from "@/types/database";

interface Analysis {
  classificacao: "baixa" | "media" | "alta";
  resumo: string;
  presenca_online: string;
  pontos_de_melhoria: string[];
  sugestao_abordagem: string;
}

export function AIAnalysis({
  leadId,
  existingOpportunity,
}: {
  leadId: string;
  existingOpportunity: LeadOpportunity;
}) {
  const [analysis, setAnalysis] = React.useState<Analysis | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleAnalyze() {
    setLoading(true);
    const res = await fetch("/api/ai/analyze-company", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: leadId }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("Não foi possível analisar a empresa", { description: data.error });
      return;
    }

    const data = await res.json();
    setAnalysis(data.analysis);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand" /> Análise de oportunidade
        </CardTitle>
        {(analysis || existingOpportunity) && (
          <Badge tone={OPPORTUNITY_TONE[analysis?.classificacao ?? existingOpportunity!]}>
            {OPPORTUNITY_LABELS[analysis?.classificacao ?? existingOpportunity!]}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {!analysis && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted">
              A IA analisa apenas os dados reais que você já tem sobre essa empresa —
              site, Instagram, avaliação e categoria — e nunca inventa informações.
            </p>
            <Button size="sm" onClick={handleAnalyze} loading={loading}>
              Analisar oportunidade
            </Button>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted">Resumo</p>
              <p className="mt-1 text-sm text-ink">{analysis.resumo}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Presença online</p>
              <p className="mt-1 text-sm text-ink">{analysis.presenca_online}</p>
            </div>
            {analysis.pontos_de_melhoria.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted">Possíveis melhorias</p>
                <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-ink">
                  {analysis.pontos_de_melhoria.map((ponto, i) => (
                    <li key={i}>{ponto}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted">Sugestão de abordagem</p>
              <p className="mt-1 text-sm text-ink">{analysis.sugestao_abordagem}</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleAnalyze} loading={loading}>
              <RefreshCw className="h-3.5 w-3.5" /> Analisar novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
