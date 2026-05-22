create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  email text not null unique,
  name text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'studio')),
  created_at timestamptz not null default now()
);

create table if not exists public.weddings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  couple_names text not null,
  date date,
  venue text,
  inputs_json jsonb not null,
  result_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  month text not null,
  count integer not null default 0 check (count >= 0),
  unique (user_id, month)
);

alter table public.users enable row level security;
alter table public.weddings enable row level security;
alter table public.usage enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.users to service_role;
grant select, insert, update, delete on public.weddings to service_role;
grant select, insert, update, delete on public.usage to service_role;
