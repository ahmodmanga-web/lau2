create extension if not exists "pgcrypto";

create table if not exists public.tshirt_inventory (
  id uuid primary key default gen_random_uuid(),
  shirt_number text not null,
  person_name text not null,
  notes text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tshirt_inventory add column if not exists created_by_name text;

create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  employee_number text not null unique,
  name text not null,
  shirt_count integer not null default 0 check (shirt_count >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
drop policy if exists "admins can read own admin record" on public.admin_users;
create policy "admins can read own admin record"
on public.admin_users for select using (user_id = auth.uid());

alter table public.workers add column if not exists shirt_count integer not null default 0;

alter table public.tshirt_inventory add column if not exists worker_id uuid references public.workers(id) on delete set null;
alter table public.tshirt_inventory add column if not exists employee_number text;

create index if not exists tshirt_inventory_shirt_number_idx
  on public.tshirt_inventory (shirt_number);

create index if not exists tshirt_inventory_person_name_idx
  on public.tshirt_inventory (person_name);

alter table public.workers enable row level security;
drop policy if exists "public can read workers" on public.workers;
drop policy if exists "public can insert workers" on public.workers;
drop policy if exists "public can delete workers" on public.workers;
drop policy if exists "admins can read workers" on public.workers;
drop policy if exists "authenticated users can read workers" on public.workers;
create policy "authenticated users can read workers" on public.workers for select to authenticated using (true);
drop policy if exists "admins can insert workers" on public.workers;
create policy "admins can insert workers" on public.workers for insert with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
drop policy if exists "admins can update workers" on public.workers;
create policy "admins can update workers" on public.workers for update using (exists (select 1 from public.admin_users where user_id = auth.uid())) with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
drop policy if exists "admins can delete workers" on public.workers;
create policy "admins can delete workers" on public.workers for delete using (exists (select 1 from public.admin_users where user_id = auth.uid()));

alter table public.tshirt_inventory add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('tshirt-defects', 'tshirt-defects', true)
on conflict (id) do update set public = true;

drop policy if exists "public can read tshirt defect images" on storage.objects;
create policy "public can read tshirt defect images" on storage.objects for select using (bucket_id = 'tshirt-defects');
drop policy if exists "public can upload tshirt defect images" on storage.objects;
create policy "public can upload tshirt defect images" on storage.objects for insert with check (bucket_id = 'tshirt-defects');

create or replace function public.set_tshirt_inventory_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tshirt_inventory_updated_at on public.tshirt_inventory;
create trigger set_tshirt_inventory_updated_at
before update on public.tshirt_inventory
for each row execute procedure public.set_tshirt_inventory_updated_at();

alter table public.tshirt_inventory enable row level security;

drop policy if exists "public can read tshirt inventory" on public.tshirt_inventory;
drop policy if exists "authenticated users can read tshirt inventory" on public.tshirt_inventory;
create policy "authenticated users can read tshirt inventory"
on public.tshirt_inventory for select to authenticated using (true);

drop policy if exists "public can insert tshirt inventory" on public.tshirt_inventory;
drop policy if exists "authenticated users can insert tshirt inventory" on public.tshirt_inventory;
create policy "authenticated users can insert tshirt inventory"
on public.tshirt_inventory for insert to authenticated with check (true);

drop policy if exists "public can update tshirt inventory" on public.tshirt_inventory;
drop policy if exists "admins can update tshirt inventory" on public.tshirt_inventory;
create policy "admins can update tshirt inventory"
on public.tshirt_inventory for update
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));
drop policy if exists "public can delete tshirt inventory" on public.tshirt_inventory;
drop policy if exists "admins can delete tshirt inventory" on public.tshirt_inventory;
create policy "admins can delete tshirt inventory"
on public.tshirt_inventory for delete
using (exists (select 1 from public.admin_users where user_id = auth.uid()));

