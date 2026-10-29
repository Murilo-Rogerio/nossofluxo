-- ==============================================================================
-- NOSSO FLUXO — Esquema de Banco de Dados e Políticas RLS (Supabase PostgreSQL)
-- ==============================================================================

-- 1. EXTENSÕES
create extension if not exists "pgcrypto";

-- 2. TABELA: categories (Categorias personalizadas)
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null,
  icon text not null,
  created_at timestamptz default now() not null
);

alter table public.categories enable row level security;

create policy "Usuários gerenciam suas próprias categorias"
  on public.categories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. TABELA: expenses (Despesas e parcelamentos)
create table if not exists public.expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  category text not null,
  spent_at date not null,
  recurrence text not null check (recurrence in ('unica', 'mensal', 'parcelada')),
  installments_total integer default null,
  installment_number integer default null,
  created_at timestamptz default now() not null
);

alter table public.expenses enable row level security;

create policy "Usuários gerenciam suas próprias despesas"
  on public.expenses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. TABELA: incomes (Receitas e salários)
create table if not exists public.incomes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  amount numeric(12,2) not null check (amount >= 0),
  source_type text not null check (source_type in ('fixo', 'variavel')),
  received_at date not null,
  is_fixed_monthly boolean default false not null,
  day_of_month integer default null,
  created_at timestamptz default now() not null
);

alter table public.incomes enable row level security;

create policy "Usuários gerenciam suas próprias receitas"
  on public.incomes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. TABELA: savings (Patrimônio e taxa CDI)
create table if not exists public.savings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  amount numeric(14,2) default 0.00 not null,
  cdi_annual_rate numeric(6,2) default 10.75 not null,
  cdi_percent numeric(6,2) default 100.00 not null,
  updated_at timestamptz default now() not null
);

alter table public.savings enable row level security;

create policy "Usuários gerenciam seu próprio patrimônio"
  on public.savings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. TABELA: savings_movements (Aportes e resgates)
create table if not exists public.savings_movements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('deposit', 'withdraw')),
  amount numeric(14,2) not null,
  created_at timestamptz default now() not null
);

alter table public.savings_movements enable row level security;

create policy "Usuários gerenciam suas próprias movimentações"
  on public.savings_movements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. TABELA: watchlist (Ações e FIIs monitorados)
create table if not exists public.watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  ticker text not null,
  type text not null check (type in ('acao', 'fii')),
  notes text,
  created_at timestamptz default now() not null,
  constraint watchlist_user_ticker_key unique (user_id, ticker)
);

alter table public.watchlist enable row level security;

create policy "Usuários gerenciam sua própria watchlist"
  on public.watchlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 8. TABELA: bank_connections (Conexões Open Finance / Pluggy)
create table if not exists public.bank_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  item_id text not null,
  connector_name text not null,
  status text not null default 'connected',
  last_synced_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

alter table public.bank_connections enable row level security;

create policy "Usuários gerenciam suas próprias conexões bancárias"
  on public.bank_connections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
