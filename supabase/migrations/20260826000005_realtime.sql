-- ============================================================================
-- AD SECURITY CAMERA SOLUTIONS — Supabase Realtime publication
-- Powers the live admin dashboard (new orders, service requests, notifications)
-- ============================================================================

do $$
begin
  begin
    alter publication supabase_realtime add table public.orders;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.service_requests;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.notifications;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.products;
  exception when duplicate_object then null;
  end;
end $$;
