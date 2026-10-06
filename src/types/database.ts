export type LeadStatus =
  | "novo"
  | "contatado"
  | "respondeu"
  | "proposta"
  | "fechado"
  | "perdido";

export type LeadOpportunity = "baixa" | "media" | "alta" | null;

export type InteractionType =
  | "lead_criado"
  | "mensagem_gerada"
  | "mensagem_enviada"
  | "empresa_respondeu"
  | "proposta_enviada"
  | "cliente_fechado"
  | "lead_perdido"
  | "nota"
  | "ligacao"
  | "status_alterado";

export type AIGenerationType =
  | "abordagem"
  | "follow_up"
  | "analise_empresa"
  | "assistente";

export type PlanId = "free" | "starter" | "pro" | "agency";

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled";

export type Profile = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
  updated_at: string;
}

export type Lead = {
  id: string;
  user_id: string;
  company_name: string;
  category: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  rating: number | null;
  status: LeadStatus;
  opportunity: LeadOpportunity;
  estimated_value: number | null;
  notes: string | null;
  next_action: string | null;
  next_action_date: string | null;
  last_interaction_at: string | null;
  created_at: string;
  updated_at: string;
}

export type Interaction = {
  id: string;
  lead_id: string;
  user_id: string;
  type: InteractionType;
  description: string;
  created_at: string;
}

export type AIGeneration = {
  id: string;
  user_id: string;
  lead_id: string | null;
  type: AIGenerationType;
  response: string;
  created_at: string;
}

export type Subscription = {
  id: string;
  user_id: string;
  plan: PlanId;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export const PLAN_LIMITS: Record<
  PlanId,
  { leadsPerMonth: number; aiGenerationsPerMonth: number }
> = {
  free: { leadsPerMonth: 20, aiGenerationsPerMonth: 10 },
  starter: { leadsPerMonth: 200, aiGenerationsPerMonth: 100 },
  pro: { leadsPerMonth: 1000, aiGenerationsPerMonth: 400 },
  agency: { leadsPerMonth: 3000, aiGenerationsPerMonth: 1500 },
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      leads: {
        Row: Lead;
        Insert: Partial<Lead> & { user_id: string; company_name: string };
        Update: Partial<Lead>;
        Relationships: [];
      };
      interactions: {
        Row: Interaction;
        Insert: Partial<Interaction> & {
          lead_id: string;
          user_id: string;
          type: InteractionType;
          description: string;
        };
        Update: Partial<Interaction>;
        Relationships: [];
      };
      ai_generations: {
        Row: AIGeneration;
        Insert: Partial<AIGeneration> & {
          user_id: string;
          type: AIGenerationType;
          response: string;
        };
        Update: Partial<AIGeneration>;
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: Partial<Subscription> & { user_id: string; plan: PlanId };
        Update: Partial<Subscription>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
