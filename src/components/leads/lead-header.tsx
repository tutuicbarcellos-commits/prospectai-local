"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_LABELS, OPPORTUNITY_LABELS, OPPORTUNITY_TONE } from "@/lib/lead-display";
import type { Lead, LeadStatus } from "@/types/database";

export function LeadHeader({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [status, setStatus] = React.useState<LeadStatus>(lead.status);
  const [updating, setUpdating] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function handleStatusChange(newStatus: LeadStatus) {
    setStatus(newStatus);
    setUpdating(true);
    const res = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setUpdating(false);
    if (!res.ok) {
      setStatus(lead.status);
      toast.error("Não foi possível atualizar o status");
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Excluir "${lead.company_name}" definitivamente?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      toast.error("Não foi possível excluir o lead");
      return;
    }
    toast.success("Lead excluído");
    router.push("/pipeline");
  }

  return (
    <div className="space-y-4">
      <Link href="/pipeline" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao pipeline
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{lead.company_name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {lead.category && <Badge tone="neutral">{lead.category}</Badge>}
            {lead.opportunity && (
              <Badge tone={OPPORTUNITY_TONE[lead.opportunity]}>
                {OPPORTUNITY_LABELS[lead.opportunity]}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
            className="w-40"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
          <Button variant="ghost" size="icon" onClick={handleDelete} loading={deleting} aria-label="Excluir lead">
            <Trash2 className="h-4 w-4 text-danger" />
          </Button>
        </div>
      </div>
    </div>
  );
}
