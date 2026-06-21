-- David Auto Center Club - Supabase/PostgreSQL
-- Execute no SQL Editor do Supabase depois de criar o projeto.

create extension if not exists "pgcrypto";

create type user_role as enum ('Administrador', 'Gerente', 'Atendente');
create type redemption_status as enum ('pendente', 'resgatado', 'cancelado');
create type appointment_status as enum ('Aguardando aprovacao', 'Aprovado', 'Recusado', 'Cancelado', 'Concluido');
create type vip_group_mode as enum ('obrigatorio', 'opcional', 'desativado');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  role user_role not null default 'Atendente',
  created_at timestamptz not null default now()
);

create table public.settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.app_state (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  descricao text,
  texto text,
  data_inicial date not null,
  data_final date not null,
  horario_inicial time,
  horario_final time,
  ativa boolean not null default false,
  max_participantes integer,
  max_giros integer not null default 1,
  um_giro_por_placa boolean not null default true,
  um_giro_por_telefone boolean not null default true,
  regras jsonb not null default '[]',
  campos_obrigatorios jsonb not null default '[]',
  campos_visiveis jsonb not null default '[]',
  banner_url text,
  link_grupo_vip text,
  link_compartilhamento text,
  vip_group_mode vip_group_mode not null default 'opcional',
  publico jsonb not null default '["todos"]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.prizes (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  nome text not null,
  descricao text,
  categoria text not null,
  valor_estimado numeric(12,2) not null default 0,
  estoque_disponivel integer not null default 0,
  probabilidade numeric(8,4) not null default 0,
  validade_dias integer not null default 30,
  observacoes text,
  status text not null default 'ativo',
  imagem_url text,
  limite_especial text not null default 'ilimitado',
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  whatsapp text,
  email text,
  data_nascimento date,
  endereco text,
  cidade text,
  cep text,
  nivel text not null default 'Bronze',
  total_gasto numeric(12,2) not null default 0,
  pontos integer not null default 0,
  cashback numeric(12,2) not null default 0,
  referral_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  placa text not null,
  marca text,
  modelo text,
  ano integer,
  km_atual integer,
  ultima_visita date,
  ultima_troca_oleo date,
  proxima_revisao date,
  created_at timestamptz not null default now(),
  unique(customer_id, placa)
);

create table public.participations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  telefone text not null,
  placa text not null,
  ip inet,
  user_agent text,
  accepted_terms jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create unique index participations_campaign_plate_idx on public.participations(campaign_id, placa);
create unique index participations_campaign_phone_idx on public.participations(campaign_id, telefone);

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id),
  prize_id uuid not null references public.prizes(id),
  customer_id uuid not null references public.customers(id),
  vehicle_id uuid not null references public.vehicles(id),
  participation_id uuid not null references public.participations(id),
  codigo text not null unique,
  qr_payload text not null,
  validade date not null,
  status redemption_status not null default 'pendente',
  redeemed_by uuid references public.profiles(id),
  redeemed_at timestamptz,
  observacao text,
  placa_conferida boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_customer_id uuid not null references public.customers(id),
  referred_customer_id uuid references public.customers(id),
  campaign_id uuid references public.campaigns(id),
  code text not null,
  created_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  vehicle_id uuid references public.vehicles(id),
  servico text not null,
  requested_date date not null,
  periodo text,
  status appointment_status not null default 'Aguardando aprovacao',
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  observacoes text,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip inet,
  user_agent text,
  motivo text,
  created_at timestamptz not null default now()
);

create or replace function public.decrement_prize_stock()
returns trigger
language plpgsql
as $$
begin
  update public.prizes
  set estoque_disponivel = greatest(estoque_disponivel - 1, 0),
      status = case when estoque_disponivel - 1 <= 0 then 'esgotado' else status end
  where id = new.prize_id;
  return new;
end;
$$;

create trigger redemptions_decrement_stock
after insert on public.redemptions
for each row execute function public.decrement_prize_stock();

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.app_state enable row level security;
alter table public.campaigns enable row level security;
alter table public.prizes enable row level security;
alter table public.customers enable row level security;
alter table public.vehicles enable row level security;
alter table public.participations enable row level security;
alter table public.redemptions enable row level security;
alter table public.referrals enable row level security;
alter table public.appointments enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.current_role()
returns user_role
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create policy "public can read active campaigns" on public.campaigns for select using (ativa = true);
create policy "public can read active prizes" on public.prizes for select using (status = 'ativo');
create policy "admins manage campaigns" on public.campaigns for all using (public.current_role() = 'Administrador') with check (public.current_role() = 'Administrador');
create policy "admins manage prizes" on public.prizes for all using (public.current_role() in ('Administrador', 'Gerente')) with check (public.current_role() in ('Administrador', 'Gerente'));
create policy "staff read customers" on public.customers for select using (public.current_role() in ('Administrador', 'Gerente', 'Atendente'));
create policy "staff read vehicles" on public.vehicles for select using (public.current_role() in ('Administrador', 'Gerente', 'Atendente'));
create policy "staff manage redemptions" on public.redemptions for all using (public.current_role() in ('Administrador', 'Gerente', 'Atendente')) with check (public.current_role() in ('Administrador', 'Gerente', 'Atendente'));
create policy "managers manage appointments" on public.appointments for all using (public.current_role() in ('Administrador', 'Gerente')) with check (public.current_role() in ('Administrador', 'Gerente'));
create policy "admins read logs" on public.audit_logs for select using (public.current_role() = 'Administrador');
