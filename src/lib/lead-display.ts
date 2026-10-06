import type { LeadOpportunity, LeadStatus } from "@/types/database";

export const STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  contatado: "Contatado",
  respondeu: "Respondeu",
  proposta: "Proposta",
  fechado: "Fechado",
  perdido: "Perdido",
};

export const STATUS_TONE: Record<LeadStatus, "neutral" | "brand" | "amber" | "danger"> = {
  novo: "neutral",
  contatado: "brand",
  respondeu: "brand",
  proposta: "amber",
  fechado: "brand",
  perdido: "danger",
};

export const PIPELINE_COLUMNS: { status: LeadStatus; label: string }[] = [
  { status: "novo", label: "Novo" },
  { status: "contatado", label: "Contatado" },
  { status: "respondeu", label: "Respondeu" },
  { status: "proposta", label: "Proposta" },
  { status: "fechado", label: "Fechado" },
  { status: "perdido", label: "Perdido" },
];

export const OPPORTUNITY_LABELS: Record<NonNullable<LeadOpportunity>, string> = {
  baixa: "Baixa oportunidade",
  media: "Média oportunidade",
  alta: "Alta oportunidade",
};

export const OPPORTUNITY_TONE: Record<
  NonNullable<LeadOpportunity>,
  "neutral" | "brand" | "amber" | "danger"
> = {
  baixa: "neutral",
  media: "amber",
  alta: "brand",
};
