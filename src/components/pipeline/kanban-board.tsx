"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { LeadCard } from "@/components/pipeline/lead-card";
import { LeadForm } from "@/components/prospeccao/lead-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PIPELINE_COLUMNS } from "@/lib/lead-display";
import type { Lead, LeadStatus } from "@/types/database";

export function KanbanBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = React.useState(initialLeads);
  const [dragOverColumn, setDragOverColumn] = React.useState<LeadStatus | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  function handleDragStart(e: React.DragEvent, leadId: string) {
    e.dataTransfer.setData("text/plain", leadId);
  }

  async function handleDrop(e: React.DragEvent, status: LeadStatus) {
    e.preventDefault();
    setDragOverColumn(null);
    const leadId = e.dataTransfer.getData("text/plain");
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === status) return;

    const previous = leads;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));

    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      setLeads(previous);
      const data = await res.json().catch(() => ({}));
      toast.error("Não foi possível mover o lead", { description: data.error });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{leads.length} leads no pipeline</p>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" /> Novo lead
        </Button>
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-surface p-4">
          <LeadForm
            onCreated={() => {
              setShowForm(false);
              window.location.reload();
            }}
          />
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_COLUMNS.map((col) => {
          const columnLeads = leads.filter((l) => l.status === col.status);
          return (
            <div
              key={col.status}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColumn(col.status);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, col.status)}
              className={cn(
                "flex w-72 shrink-0 flex-col rounded-lg border border-border bg-surface-raised/60 p-3 transition-colors",
                dragOverColumn === col.status && "border-brand bg-brand-soft/40"
              )}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-ink">{col.label}</h3>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
                  {columnLeads.length}
                </span>
              </div>
              <div className="min-h-[80px] space-y-2">
                {columnLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onDragStart={handleDragStart} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
