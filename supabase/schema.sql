-- ProspectAI Local — schema + Row Level Security
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS guards.

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------

do $$ begin
  create type lead_status as enum ('novo','contatado','respondeu','proposta','fechado','perdido');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lead_opportunity as enum ('baixa','media','alta');
exception when duplicate_object then null; end $$;

do $$ begin
  create type interaction_type as enum (
    'lead_criado','mensagem_gerada','mensagem_enviada','empresa_respondeu',
    'proposta_enviada','cliente_fechado','lead_perdido','nota','ligacao','status_alterado'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type ai_generation_type as enum ('abordagem','follow_up','analise_empresa','assistente');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_id as enum ('free','starter','pro','agency');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum ('active','trialing','past_due','canceled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('user','admin');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_name text not null,
  category text,
  address text,
  phone text,
  website text,
  instagram text,
  rating numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  status lead_status not null default 'novo',
  opportunity lead_opportunity,
  estimated_value numeric(12,2) check (estimated_value is null or estimated_value >= 0),
  notes text,
  next_action text,
  next_action_date timestamptz,
  last_interaction_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists interactions (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references leads (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  type interaction_type not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists ai_generations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lead_id uuid references leads (id) on delete set null,
  type ai_generation_type not null,
  response text not null,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  plan plan_id not null default 'free',
  status subscription_status not null default 'active',
  -- populated once Stripe/Mercado Pago is wired up (see section 24 of the brief)
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Audit log for sensitive actions (section 23). Never stores secrets —
-- only an action name and a small, non-sensitive metadata payload.
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------

create index if not exists idx_leads_user_id on leads (user_id);
create index if not exists idx_leads_user_status on leads (user_id, status);
create index if not exists idx_leads_user_created on leads (user_id, created_at desc);
create index if not exists idx_interactions_lead_id on interactions (lead_id);
create index if not exists idx_interactions_user_id on interactions (user_id);
create index if not exists idx_ai_generations_user_id on ai_generations (user_id);
create index if not exists idx_ai_generations_lead_id on ai_generations (lead_id);
create index if not exists idx_subscriptions_user_id on subscriptions (user_id);
create index if not exists idx_audit_logs_user_id on audit_logs (user_id);

-- ---------------------------------------------------------------------
-- updated_at TRIGGERS
-- ---------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists trg_leads_updated_at on leads;
create trigger trg_leads_updated_at before update on leads
  for each row execute function set_updated_at();

drop trigger if exists trg_subscriptions_updated_at on subscriptions;
create trigger trg_subscriptions_updated_at before update on subscriptions
  for each row execute function set_updated_at();

-- Auto-create a profile + free subscription row when a new auth user signs up.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), new.email);

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table profiles enable row level security;
alter table leads enable row level security;
alter table interactions enable row level security;
alter table ai_generations enable row level security;
alter table subscriptions enable row level security;
alter table audit_logs enable row level security;

-- profiles: a user can read/update only their own profile row.
drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- leads: full CRUD, but only ever on rows owned by the caller.
drop policy if exists "leads_select_own" on leads;
create policy "leads_select_own" on leads
  for select using (auth.uid() = user_id);

drop policy if exists "leads_insert_own" on leads;
create policy "leads_insert_own" on leads
  for insert with check (auth.uid() = user_id);

drop policy if exists "leads_update_own" on leads;
create policy "leads_update_own" on leads
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "leads_delete_own" on leads;
create policy "leads_delete_own" on leads
  for delete using (auth.uid() = user_id);

-- interactions: readable/writable only by their owner, and only when the
-- parent lead also belongs to that same user (defense in depth against IDOR).
drop policy if exists "interactions_select_own" on interactions;
create policy "interactions_select_own" on interactions
  for select using (
    auth.uid() = user_id
    and exists (select 1 from leads l where l.id = lead_id and l.user_id = auth.uid())
  );

drop policy if exists "interactions_insert_own" on interactions;
create policy "interactions_insert_own" on interactions
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from leads l where l.id = lead_id and l.user_id = auth.uid())
  );

drop policy if exists "interactions_delete_own" on interactions;
create policy "interactions_delete_own" on interactions
  for delete using (auth.uid() = user_id);

-- ai_generations: a user can only see/create their own generation history.
drop policy if exists "ai_generations_select_own" on ai_generations;
create policy "ai_generations_select_own" on ai_generations
  for select using (auth.uid() = user_id);

drop policy if exists "ai_generations_insert_own" on ai_generations;
create policy "ai_generations_insert_own" on ai_generations
  for insert with check (auth.uid() = user_id);

-- subscriptions: read-only from the client. Writes happen exclusively via
-- the service-role key inside the (future) payment-webhook route handler,
-- so there is intentionally no insert/update policy for regular users —
-- a user changing their plan client-side has no effect on this table.
drop policy if exists "subscriptions_select_own" on subscriptions;
create policy "subscriptions_select_own" on subscriptions
  for select using (auth.uid() = user_id);

-- audit_logs: users may read their own audit trail; nothing is ever
-- editable or deletable from the client, and inserts happen server-side.
drop policy if exists "audit_logs_select_own" on audit_logs;
create policy "audit_logs_select_own" on audit_logs
  for select using (auth.uid() = user_id);
