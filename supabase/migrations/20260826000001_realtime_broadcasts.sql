-- AD Security Camera Solutions
-- Realtime Dispatch Broadcast & Audit Trail

-- Broadcast channel table for guard dispatch and team notifications
create table if not exists public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  priority text not null default 'info' check (priority in ('info', 'warning', 'critical')),
  sender_id text not null,
  target_zone text,
  created_at timestamptz not null default now()
);

alter table public.broadcasts enable row level security;

create policy "All roles can view broadcasts"
  on public.broadcasts for select
  using (public.current_user_role() in ('admin', 'operator', 'client_viewer'));

create policy "Admins and Operators can publish broadcasts"
  on public.broadcasts for insert
  with check (public.current_user_role() in ('admin', 'operator'));

alter publication supabase_realtime add table public.broadcasts;

-- Audit trail log for incident response history
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid references public.incidents(id) on delete set null,
  actor_id text not null,
  action text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;

create policy "All roles can view audit logs"
  on public.audit_logs for select
  using (public.current_user_role() in ('admin', 'operator', 'client_viewer'));

create policy "Admins and Operators can write audit logs"
  on public.audit_logs for insert
  with check (public.current_user_role() in ('admin', 'operator'));
