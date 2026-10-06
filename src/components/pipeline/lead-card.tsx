"use client";

import Link from "next/link";
import { MapPin, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyBRL } from "@/lib/utils";
import { OPPORTUNITY_LABELS, OPPORTUNITY_TONE } from "@/lib/lead-display";
import type { Lead } from "@/types/database";

export function LeadCard({
  lead,
  onDragStart,
}: {
  lead: Lead;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      className="cursor-grab rounded-md border border-border bg-surface p-3 shadow-card transition-shadow active:cursor-grabbing hover:shadow-popover"
    >
      <Link href={`/leads/${lead.id}`} className="block">
        <p className="text-sm font-semibold text-ink">{lead.company_name}</p>
        {lead.category && <p className="mt-0.5 text-xs text-muted">{lead.category}</p>}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {lead.opportunity && (
            <Badge tone={OPPORTUNITY_TONE[lead.opportunity]}>
              {OPPORTUNITY_LABELS[lead.opportunity]}
            </Badge>
          )}
        </div>

        <div className="mt-2 space-y-1 text-xs text-muted">
          {lead.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{lead.address}</span>
            </div>
          )}
          {lead.estimated_value != null && (
            <div className="flex items-center gap-1.5">
              <Wallet className="h-3 w-3 shrink-0" />
              {formatCurrencyBRL(lead.estimated_value)}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
