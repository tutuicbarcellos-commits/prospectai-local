import { z } from "zod";

export const generateMessageSchema = z.object({
  lead_id: z.string().uuid(),
  tone: z.enum(["padrao", "formal", "descontraido"]).default("padrao"),
  goal: z.enum(["primeira_abordagem", "follow_up"]).default("primeira_abordagem"),
});

export const analyzeCompanySchema = z.object({
  lead_id: z.string().uuid(),
});

export const assistantMessageSchema = z.object({
  message: z.string().trim().min(1, "Escreva uma pergunta").max(1000),
  // Optional lead context, so the assistant can answer "gere uma mensagem
  // para esse lead" from the lead detail page. Never a free-form list of
  // other users' data — the server resolves this id through RLS itself.
  lead_id: z.string().uuid().optional(),
});

export const prospectSearchSchema = z.object({
  category: z.string().trim().min(2).max(60),
  location: z.string().trim().min(2).max(120),
});

export type GenerateMessageInput = z.infer<typeof generateMessageSchema>;
export type AnalyzeCompanyInput = z.infer<typeof analyzeCompanySchema>;
export type AssistantMessageInput = z.infer<typeof assistantMessageSchema>;
export type ProspectSearchInput = z.infer<typeof prospectSearchSchema>;
