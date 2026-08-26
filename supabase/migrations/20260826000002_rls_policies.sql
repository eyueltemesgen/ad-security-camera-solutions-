-- ============================================================================
-- AD SECURITY CAMERA SOLUTIONS — Row Level Security
-- ============================================================================

alter table public.profiles          enable row level security;
alter table public.product_categories enable row level security;
alter table public.products          enable row level security;
alter table public.wishlist_items    enable row level security;
alter table public.orders            enable row level security;
alter table public.order_items       enable row level security;
alter table public.service_requests  enable row level security;
alter table public.notifications     enable row level security;
alter table public.contact_messages  enable row level security;
alter table public.site_settings     enable row level security;

-- Idempotent: drop any existing AD policies so this script can be re-run
do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and policyname like any (array['profiles\_%', 'product\_categories\_%', 'products\_%',
        'wishlist\_%', 'orders\_%', 'order\_items\_%', 'service\_requests\_%',
        'notifications\_%', 'contact\_messages\_%', 'site\_settings\_%'])
  loop
    execute format('drop policy if exists %I on %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_own_customer"
  on public.profiles for insert
  with check (id = auth.uid() and role = 'customer');

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_delete_admin"
  on public.profiles for delete
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- product_categories — public read, admin write
-- ----------------------------------------------------------------------------
create policy "product_categories_select_all"
  on public.product_categories for select
  using (true);

create policy "product_categories_insert_admin"
  on public.product_categories for insert
  with check (public.is_admin());

create policy "product_categories_update_admin"
  on public.product_categories for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_categories_delete_admin"
  on public.product_categories for delete
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- products — public reads active products only; admins read/write all
-- ----------------------------------------------------------------------------
create policy "products_select_active_or_admin"
  on public.products for select
  using (is_active or public.is_admin());

create policy "products_insert_admin"
  on public.products for insert
  with check (public.is_admin());

create policy "products_update_admin"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "products_delete_admin"
  on public.products for delete
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- wishlist_items — owner only
-- ----------------------------------------------------------------------------
create policy "wishlist_select_own"
  on public.wishlist_items for select
  using (user_id = auth.uid());

create policy "wishlist_insert_own"
  on public.wishlist_items for insert
  with check (user_id = auth.uid());

create policy "wishlist_delete_own"
  on public.wishlist_items for delete
  using (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- orders — owner reads/creates own; admin reads/updates/deletes all
-- Status changes are admin-only (no customer update policy).
-- ----------------------------------------------------------------------------
create policy "orders_select_own_or_admin"
  on public.orders for select
  using (user_id = auth.uid() or public.is_admin());

create policy "orders_insert_own"
  on public.orders for insert
  with check (user_id = auth.uid());

create policy "orders_update_admin"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "orders_delete_admin"
  on public.orders for delete
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- order_items — visible with parent order ownership; admin full access
-- ----------------------------------------------------------------------------
create policy "order_items_select_own_or_admin"
  on public.order_items for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "order_items_insert_own_or_admin"
  on public.order_items for insert
  with check (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "order_items_update_admin"
  on public.order_items for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "order_items_delete_admin"
  on public.order_items for delete
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- service_requests — guests may create (user_id NULL); owner reads own;
-- admin full access
-- ----------------------------------------------------------------------------
create policy "service_requests_select_own_or_admin"
  on public.service_requests for select
  using (user_id = auth.uid() or public.is_admin());

create policy "service_requests_insert_any"
  on public.service_requests for insert
  with check (user_id is null or user_id = auth.uid());

create policy "service_requests_update_admin"
  on public.service_requests for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "service_requests_delete_admin"
  on public.service_requests for delete
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- notifications — users see own; admins see all (incl. NULL admin broadcasts)
-- ----------------------------------------------------------------------------
create policy "notifications_select_own_or_admin"
  on public.notifications for select
  using (user_id = auth.uid() or public.is_admin());

create policy "notifications_insert_self_or_admin"
  on public.notifications for insert
  with check (user_id = auth.uid() or public.is_admin());

create policy "notifications_update_own_or_admin"
  on public.notifications for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "notifications_delete_own_or_admin"
  on public.notifications for delete
  using (user_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- contact_messages — anyone can submit; only admin can read/manage
-- ----------------------------------------------------------------------------
create policy "contact_messages_insert_any"
  on public.contact_messages for insert
  with check (true);

create policy "contact_messages_select_admin"
  on public.contact_messages for select
  using (public.is_admin());

create policy "contact_messages_update_admin"
  on public.contact_messages for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "contact_messages_delete_admin"
  on public.contact_messages for delete
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- site_settings — public read (business contact info), admin write
-- ----------------------------------------------------------------------------
create policy "site_settings_select_all"
  on public.site_settings for select
  using (true);

create policy "site_settings_insert_admin"
  on public.site_settings for insert
  with check (public.is_admin());

create policy "site_settings_update_admin"
  on public.site_settings for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "site_settings_delete_admin"
  on public.site_settings for delete
  using (public.is_admin());
