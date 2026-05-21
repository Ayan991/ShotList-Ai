create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'studio')),
  stripe_customer_id text,
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
grant select, insert, update on public.users to authenticated;
grant select, insert, update, delete on public.weddings to authenticated;
grant select, insert, update on public.usage to authenticated;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
on public.users for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
on public.users for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can read own weddings" on public.weddings;
create policy "Users can read own weddings"
on public.weddings for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own weddings" on public.weddings;
create policy "Users can insert own weddings"
on public.weddings for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own weddings" on public.weddings;
create policy "Users can update own weddings"
on public.weddings for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own weddings" on public.weddings;
create policy "Users can delete own weddings"
on public.weddings for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read own usage" on public.usage;
create policy "Users can read own usage"
on public.usage for select
to authenticated
using (auth.uid() = user_id);

create schema if not exists private;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();
