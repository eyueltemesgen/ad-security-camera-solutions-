-- AD Security Camera Solutions
-- Initial Schema & RLS Policies for SOC Platform

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Role enum definition
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('admin', 'operator', 'client_viewer');
  end if;
  if not exists (select 1 from pg_type where typname = 'camera_status') then
    create type camera_status as enum ('online', 'offline', 'motion_detected', 'ai_alert');
  end if;
  if not exists (select 1 from pg_type where typname = 'event_severity') then
    create type event_severity as enum ('critical', 'warning', 'info');
  end if;
  if not exists (select 1 from pg_type where typname = 'event_type') then
    create type event_type as enum (
      'person_detection',
      'intrusion',
      'license_plate_recognition',
      'thermal_alert',
      'object_left_behind'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'incident_status') then
    create type incident_status as enum ('open', 'acknowledged', 'dispatched', 'resolved', 'false_alarm');
  end if;
end $$;

-- 1. CAMERAS
create table if not exists public.cameras (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rtsp_url text not null,
  ip_address inet not null,
  location_zone text not null,
  status camera_status not null default 'online',
  ptz_supported boolean not null default false,
  resolution text not null default '1080p',
  fov_angle integer default 90,
  map_x double precision default 50.0,
  map_y double precision default 50.0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. CAMERA_EVENTS
create table if not exists public.camera_events (
  id uuid primary key default gen_random_uuid(),
  camera_id uuid not null references public.cameras(id) on delete cascade,
  event_type event_type not null,
  severity event_severity not null default 'info',
  confidence_score numeric(5, 2) not null check (confidence_score >= 0 and confidence_score <= 100),
  snapshot_url text not null,
  metadata jsonb default '{}'::jsonb,
  timestamp timestamptz not null default now(),
  status text not null default 'new'
);

-- 3. INCIDENTS
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.camera_events(id) on delete cascade,
  assigned_guard_id text,
  status incident_status not null default 'open',
  escalation_level integer not null default 1 check (escalation_level between 1 and 5),
  notes text default '',
  dispatched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. STORAGE_RETENTION
create table if not exists public.storage_retention (
  id uuid primary key default gen_random_uuid(),
  camera_id uuid not null unique references public.cameras(id) on delete cascade,
  storage_used_gb numeric(8, 2) not null default 0.0,
  retention_days integer not null default 30,
  cloud_sync_status text not null default 'synced',
  edge_storage_gb numeric(8, 2) not null default 0.0,
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_cameras_status on public.cameras(status);
create index if not exists idx_cameras_zone on public.cameras(location_zone);
create index if not exists idx_events_camera on public.camera_events(camera_id);
create index if not exists idx_events_timestamp on public.camera_events(timestamp desc);
create index if not exists idx_events_severity on public.camera_events(severity);
create index if not exists idx_incidents_status on public.incidents(status);
create index if not exists idx_incidents_created on public.incidents(created_at desc);

-- Realtime publication
alter publication supabase_realtime add table public.cameras;
alter publication supabase_realtime add table public.camera_events;
alter publication supabase_realtime add table public.incidents;
alter publication supabase_realtime add table public.storage_retention;

-- Enable Row Level Security
alter table public.cameras enable row level security;
alter table public.camera_events enable row level security;
alter table public.incidents enable row level security;
alter table public.storage_retention enable row level security;

-- Helper to extract user role from auth JWT metadata
create or replace function public.current_user_role()
returns text language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role', ''),
    'client_viewer'
  );
$$;

-- RLS Policies: Cameras
-- Admins: full access
create policy "Admins have full access to cameras"
  on public.cameras for all
  using (public.current_user_role() = 'admin');

-- Operators/Guards: view and update status
create policy "Operators can view and update cameras"
  on public.cameras for select
  using (public.current_user_role() in ('operator', 'admin', 'client_viewer'));

create policy "Operators can update camera status"
  on public.cameras for update
  using (public.current_user_role() in ('operator', 'admin'));

-- RLS Policies: Camera Events
create policy "All authenticated roles can view camera events"
  on public.camera_events for select
  using (public.current_user_role() in ('admin', 'operator', 'client_viewer'));

create policy "Admins and Operators can manage camera events"
  on public.camera_events for all
  using (public.current_user_role() in ('admin', 'operator'));

-- RLS Policies: Incidents
create policy "All roles can view incidents"
  on public.incidents for select
  using (public.current_user_role() in ('admin', 'operator', 'client_viewer'));

create policy "Admins and Operators can manage incidents"
  on public.incidents for all
  using (public.current_user_role() in ('admin', 'operator'));

-- RLS Policies: Storage Retention
create policy "All roles can view storage analytics"
  on public.storage_retention for select
  using (public.current_user_role() in ('admin', 'operator', 'client_viewer'));

create policy "Admins can manage storage retention"
  on public.storage_retention for all
  using (public.current_user_role() = 'admin');
