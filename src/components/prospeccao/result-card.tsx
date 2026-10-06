"use client";

import { MapPin, Phone, Globe, Instagram, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { withFallback } from "@/lib/utils";
import type { ProspectResult } from "@/app/api/prospect/search/route";

export function ResultCard({
  result,
  onAdd,
  adding,
}: {
  result: ProspectResult;
  onAdd: () => void;
  adding: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-sm font-semibold text-ink">{result.company_name}</p>
          <p className="text-xs text-muted">{withFallback(result.category)}</p>
        </div>
        <Button size="sm" onClick={onAdd} loading={adding}>
          Adicionar ao pipeline
        </Button>
      </div>
      <div className="mt-3 grid gap-1.5 text-xs text-muted sm:grid-cols-2">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3" /> {withFallback(result.address)}
        </span>
        <span className="flex items-center gap-1.5">
          <Phone className="h-3 w-3" /> {withFallback(result.phone)}
        </span>
        <span className="flex items-center gap-1.5">
          <Globe className="h-3 w-3" /> {withFallback(result.website)}
        </span>
        <span className="flex items-center gap-1.5">
          <Instagram className="h-3 w-3" /> {withFallback(result.instagram)}
        </span>
        <span className="flex items-center gap-1.5">
          <Star className="h-3 w-3" />
          {result.rating ? `${result.rating}/5` : "Informação não encontrada"}
        </span>
      </div>
    </div>
  );
}
