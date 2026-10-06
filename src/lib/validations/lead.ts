import { z } from "zod";

export const leadStatusSchema = z.enum([
  "novo",
  "contatado",
  "respondeu",
  "proposta",
  "fechado",
  "perdido",
]);

export const leadOpportunitySchema = z.enum(["baixa", "media", "alta"]).nullable();

const optionalTrimmedString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null));

export const createLeadSchema = z.object({
  company_name: z.string().trim().min(2, "Informe o nome da empresa").max(160),
  category: optionalTrimmedString(80),
  address: optionalTrimmedString(240),
  phone: z
    .string()
    .trim()
    .max(32)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine((v) => v === null || /^[0-9()+\-.\s]{8,32}$/.test(v), {
      message: "Telefone inválido",
    }),
  website: z
    .string()
    .trim()
    .max(240)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null))
    .refine((v) => v === null || /^https?:\/\/.+/i.test(v), {
      message: "Site precisa começar com http:// ou https://",
    }),
  instagram: optionalTrimmedString(60),
  rating: z.coerce.number().min(0).max(5).optional().nullable(),
  status: leadStatusSchema.default("novo"),
  opportunity: leadOpportunitySchema.optional(),
  estimated_value: z.coerce.number().min(0).max(10_000_000).optional().nullable(),
  notes: optionalTrimmedString(4000),
  next_action: optionalTrimmedString(200),
  next_action_date: z.string().datetime().optional().nullable(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const leadIdParamSchema = z.string().uuid("ID de lead inválido");

export const createInteractionSchema = z.object({
  lead_id: z.string().uuid(),
  type: z.enum([
    "lead_criado",
    "mensagem_gerada",
    "mensagem_enviada",
    "empresa_respondeu",
    "proposta_enviada",
    "cliente_fechado",
    "lead_perdido",
    "nota",
    "ligacao",
    "status_alterado",
  ]),
  description: z.string().trim().min(1).max(2000),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;
