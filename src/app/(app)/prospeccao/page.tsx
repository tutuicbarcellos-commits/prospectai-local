"use client";

import * as React from "react";
import { toast } from "sonner";
import { SatelliteDish, PlusCircle } from "lucide-react";
import { SearchForm } from "@/components/prospeccao/search-form";
import { ResultCard } from "@/components/prospeccao/result-card";
import { LeadForm } from "@/components/prospeccao/lead-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProspectResult } from "@/app/api/prospect/search/route";

export default function ProspeccaoPage() {
  const [loading, setLoading] = React.useState(false);
  const [searched, setSearched] = React.useState(false);
  const [providerConnected, setProviderConnected] = React.useState(false);
  const [results, setResults] = React.useState<ProspectResult[]>([]);
  const [addingIndex, setAddingIndex] = React.useState<number | null>(null);
  const [lastQuery, setLastQuery] = React.useState({ category: "", location: "" });

  async function handleSearch(category: string, location: string) {
    setLoading(true);
    setSearched(true);
    setLastQuery({ category, location });

    const res = await fetch("/api/prospect/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, location }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("Não foi possível pesquisar agora", { description: data.error });
      return;
    }

    const data = await res.json();
    setResults(data.results);
    setProviderConnected(data.providerConnected);
  }

  async function handleAddResult(result: ProspectResult, index: number) {
    setAddingIndex(index);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...result, status: "novo" }),
    });
    setAddingIndex(null);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error("Não foi possível adicionar", { description: data.error });
      return;
    }

    toast.success(`"${result.company_name}" adicionado ao pipeline`);
    setResults((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pesquisar empresas</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchForm onSearch={handleSearch} loading={loading} />
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {!loading && searched && !providerConnected && (
        <Card>
          <CardContent className="py-2">
            <EmptyState
              icon={SatelliteDish}
              title="Busca automática ainda não conectada"
              description={`A integração com Google Maps para buscar "${lastQuery.category} em ${lastQuery.location}" automaticamente ainda não está configurada neste ambiente. Enquanto isso, cadastre manualmente as empresas que você encontrar — os dados nunca são inventados pela plataforma.`}
            />
          </CardContent>
        </Card>
      )}

      {!loading && searched && providerConnected && results.length === 0 && (
        <EmptyState
          icon={SatelliteDish}
          title="Nenhum resultado encontrado"
          description="Tente ajustar a categoria ou a localização da busca."
        />
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, i) => (
            <ResultCard
              key={`${result.company_name}-${i}`}
              result={result}
              adding={addingIndex === i}
              onAdd={() => handleAddResult(result, i)}
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4 text-brand" /> Adicionar empresa manualmente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LeadForm />
        </CardContent>
      </Card>
    </div>
  );
}
