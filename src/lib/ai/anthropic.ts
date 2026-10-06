import "server-only";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

/**
 * Thin, server-only wrapper around the Anthropic Messages API.
 *
 * Security notes:
 * - The API key never leaves the server (read from process.env, not
 *   NEXT_PUBLIC_*, and this file is marked `server-only` so importing it
 *   from a Client Component fails the build).
 * - Every caller in this codebase builds a narrow, purpose-specific
 *   system prompt and passes only the single lead's data needed for that
 *   task — never the user's whole lead list, never another user's data.
 * - System prompts explicitly instruct the model not to invent facts and
 *   to say a field is unknown rather than guess, and callers additionally
 *   fence out fields the lead doesn't have before they reach the prompt.
 */
async function callClaude(params: {
  system: string;
  prompt: string;
  maxTokens?: number;
}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY não configurada no servidor");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: params.maxTokens ?? 500,
      system: params.system,
      messages: [{ role: "user", content: params.prompt }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Falha na chamada de IA (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const text = (data.content ?? [])
    .filter((block: { type: string }) => block.type === "text")
    .map((block: { text: string }) => block.text)
    .join("\n")
    .trim();

  return text;
}

export interface LeadForAI {
  company_name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  rating: number | null;
}

function describeKnownFields(lead: LeadForAI) {
  const known: string[] = [`Nome: ${lead.company_name}`];
  if (lead.category) known.push(`Categoria: ${lead.category}`);
  if (lead.address) known.push(`Endereço: ${lead.address}`);
  if (lead.website) known.push(`Site: ${lead.website}`);
  else known.push("Site: não encontrado");
  if (lead.instagram) known.push(`Instagram: ${lead.instagram}`);
  if (lead.rating !== null && lead.rating !== undefined)
    known.push(`Avaliação: ${lead.rating}/5`);
  return known.join("\n");
}

const ANTI_INVENTION_RULE =
  "Regra absoluta: use apenas os dados fornecidos abaixo. Nunca invente " +
  "números, nomes de pessoas, promoções, prêmios, tecnologias usadas ou " +
  "qualquer outro fato sobre a empresa que não tenha sido informado. Se um " +
  "dado não foi fornecido, simplesmente não o mencione — não presuma.";

export async function generateOutreachMessage(input: {
  lead: LeadForAI;
  senderName: string;
  senderService: string;
  tone: "padrao" | "formal" | "descontraido";
  goal: "primeira_abordagem" | "follow_up";
}) {
  const system = [
    "Você escreve mensagens curtas de WhatsApp para prospecção comercial B2B no Brasil.",
    ANTI_INVENTION_RULE,
    "A mensagem deve ter no máximo 4 frases, soar natural e humana, nunca como spam ou anúncio.",
    "Não use emojis em excesso (no máximo 1). Não use termos comerciais exagerados como 'oferta imperdível'.",
    "Sempre se apresente pelo nome do remetente e mencione o nome da empresa quando ele foi informado.",
  ].join(" ");

  const prompt = [
    `Remetente: ${input.senderName}, presta serviço de: ${input.senderService}`,
    `Objetivo da mensagem: ${
      input.goal === "follow_up" ? "follow-up (a empresa ainda não respondeu)" : "primeiro contato"
    }`,
    `Tom desejado: ${input.tone}`,
    "Dados conhecidos da empresa-alvo:",
    describeKnownFields(input.lead),
    "Escreva apenas a mensagem final, sem explicações antes ou depois.",
  ].join("\n");

  return callClaude({ system, prompt, maxTokens: 300 });
}

export async function analyzeCompanyOpportunity(lead: LeadForAI) {
  const system = [
    "Você analisa a presença online de pequenas empresas para identificar oportunidades de prospecção.",
    ANTI_INVENTION_RULE,
    "Responda estritamente em JSON válido, sem markdown, no formato:",
    '{"classificacao": "baixa" | "media" | "alta", "resumo": string, "presenca_online": string, "pontos_de_melhoria": string[], "sugestao_abordagem": string}',
    "Baseie a classificação apenas em: existência de site, existência de Instagram, avaliação (se houver) e categoria do negócio.",
  ].join(" ");

  const prompt = [
    "Dados conhecidos da empresa:",
    describeKnownFields(lead),
    "Gere a análise agora.",
  ].join("\n");

  const raw = await callClaude({ system, prompt, maxTokens: 500 });
  const cleaned = raw.replace(/^```json\s*|```$/g, "").trim();

  try {
    return JSON.parse(cleaned) as {
      classificacao: "baixa" | "media" | "alta";
      resumo: string;
      presenca_online: string;
      pontos_de_melhoria: string[];
      sugestao_abordagem: string;
    };
  } catch {
    throw new Error("Não foi possível interpretar a resposta da IA");
  }
}

export interface AssistantContext {
  totals: {
    novo: number;
    contatado: number;
    respondeu: number;
    proposta: number;
    fechado: number;
    perdido: number;
  };
  leadsToday: Array<{ company_name: string; next_action: string | null }>;
  focusedLead?: LeadForAI | null;
}

export async function askAssistant(input: {
  message: string;
  context: AssistantContext;
}) {
  const system = [
    "Você é o assistente do ProspectAI Local, um CRM de prospecção comercial.",
    "Responda apenas com base nos dados fornecidos no contexto abaixo — nunca invente leads, números ou nomes de empresas que não estejam listados.",
    "Se a pergunta pedir algo que não está no contexto fornecido, diga que não tem essa informação disponível em vez de adivinhar.",
    "Seja direto e curto, em português do Brasil.",
  ].join(" ");

  const prompt = [
    "Contexto (somente dados do usuário atual):",
    JSON.stringify(input.context),
    "Pergunta do usuário:",
    input.message,
  ].join("\n\n");

  return callClaude({ system, prompt, maxTokens: 400 });
}
