-- Minimal Supabase-compatible shims so our project migrations can be
-- validated against a bare PostgreSQL instance.
-- These reproduce only the objects our migrations reference.

-- extensions
create extension if not exists pgcrypto;

-- auth schema
create schema if not exists auth;

create table auth.users (
  id uuid primary key,
  email text,
  role text default 'authenticated'
);

create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

-- roles that supabase policies target
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role;
  end if;
end $$;

-- storage schema (supabase storage emulation)
create schema if not exists storage;

create table storage.buckets (
  id text primary key,
  name text,
  public boolean default false,
  created_at timestamptz default now()
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text,
  owner uuid,
  created_at timestamptz default now()
);

-- Supabase's storage service enables RLS on these tables; without it the
-- storage policies created by our migrations would never be enforced.
alter table storage.objects enable row level security;
alter table storage.buckets enable row level security;

create or replace function storage.foldername(name text)
returns text[] language sql immutable as $$
  select string_to_array(name, '/')
$$;

create or replace function storage.filename(name text)
returns text language sql immutable as $$
  select name
$$;

create schema if not exists realtime;

do $$ begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;