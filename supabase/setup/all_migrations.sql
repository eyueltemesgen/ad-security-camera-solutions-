-- ============================================================================
-- AD SECURITY CAMERA SOLUTIONS — Consolidated Schema (all migrations)
-- PostgreSQL / Supabase
-- Generated from supabase/migrations/*.sql in filename order
-- ============================================================================


-- ============================================================================
-- SOURCE: supabase/migrations/20260826000001_initial_schema.sql
-- ============================================================================
-- ============================================================================
-- AD SECURITY CAMERA SOLUTIONS — Initial Schema
-- PostgreSQL / Supabase
-- Inventory source of truth: products.stock (no separate conflicting table)
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- profiles — extends auth.users
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  email       text not null default '',
  phone       text not null default '',
  avatar_url  text not null default '',
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Helper: is_admin() — SECURITY DEFINER so RLS policies don't recurse
-- (created after profiles, which it references)
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- product_categories
-- ----------------------------------------------------------------------------
create table if not exists public.product_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  description text not null default '',
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- products (stock = authoritative inventory quantity)
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text,
  description text not null default '',
  price       numeric(12, 2) not null check (price >= 0),
  stock       integer not null default 0 check (stock >= 0),
  rating      numeric(2, 1) not null default 0 check (rating between 0 and 5),
  sku         text unique,
  category_id uuid references public.product_categories (id) on delete set null,
  image_url   text not null default '',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx on public.products (is_active);

-- ----------------------------------------------------------------------------
-- wishlist_items — tied to authenticated user
-- ----------------------------------------------------------------------------
create table if not exists public.wishlist_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ----------------------------------------------------------------------------
-- orders
-- ----------------------------------------------------------------------------
create sequence if not exists public.order_number_seq start with 1;

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text not null unique
                   default ('AD-' || lpad(nextval('public.order_number_seq')::text, 6, '0')),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null default '',
  delivery_address text not null default '',
  subtotal         numeric(12, 2) not null default 0,
  tax              numeric(12, 2) not null default 0,
  total            numeric(12, 2) not null default 0,
  payment_method   text not null check (payment_method in ('telebirr', 'cbe_birr', 'chapa', 'cash_on_delivery')),
  payment_status   text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  status           text not null default 'pending'
                   check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- ----------------------------------------------------------------------------
-- order_items — snapshots product name/price at purchase time
-- ----------------------------------------------------------------------------
create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_id   uuid references public.products (id) on delete set null,
  product_name text not null,
  quantity     integer not null check (quantity > 0),
  unit_price   numeric(12, 2) not null,
  subtotal     numeric(12, 2) not null,
  created_at   timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ----------------------------------------------------------------------------
-- service_requests
-- ----------------------------------------------------------------------------
create table if not exists public.service_requests (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles (id) on delete set null,
  customer_name  text not null,
  phone          text not null default '',
  email          text not null default '',
  service        text not null,
  preferred_date date,
  location       text not null default '',
  description    text not null default '',
  status         text not null default 'pending'
                 check (status in ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists service_requests_user_idx on public.service_requests (user_id);

-- ----------------------------------------------------------------------------
-- notifications — user_id NULL means broadcast to all admins
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references public.profiles (id) on delete cascade,
  title      text not null,
  message    text not null default '',
  type       text not null default 'info',
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id);

-- ----------------------------------------------------------------------------
-- contact_messages
-- ----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text not null default '',
  message    text not null,
  status     text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- site_settings — single-row table
-- ----------------------------------------------------------------------------
create table if not exists public.site_settings (
  id              boolean primary key default true check (id),
  company_name    text not null default 'AD Security Camera Solutions',
  phone           text not null default '',
  secondary_phone text not null default '',
  email           text not null default '',
  address         text not null default '',
  currency        text not null default 'ETB',
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- updated_at maintenance
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_profiles on public.profiles;
create trigger touch_profiles before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_products on public.products;
create trigger touch_products before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_orders on public.orders;
create trigger touch_orders before update on public.orders
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_service_requests on public.service_requests;
create trigger touch_service_requests before update on public.service_requests
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_site_settings on public.site_settings;
create trigger touch_site_settings before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- Auto-create profile on signup (metadata: full_name, phone)
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Prevent non-admins from changing their role (privilege escalation guard)
-- ----------------------------------------------------------------------------
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_role on public.profiles;
create trigger guard_profile_role before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ----------------------------------------------------------------------------
-- Notify customer when order status changes
-- ----------------------------------------------------------------------------
create or replace function public.notify_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications (user_id, title, message, type)
    values (
      new.user_id,
      'Order ' || new.order_number || ' updated',
      'Your order status is now: ' || new.status,
      'order_status'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists notify_order_status_change on public.orders;
create trigger notify_order_status_change
  after update of status on public.orders
  for each row execute function public.notify_order_status_change();

-- ----------------------------------------------------------------------------
-- place_order — transactional checkout (server-side totals + stock update)
-- p_items: jsonb array of {"product_id": uuid, "quantity": int}
-- ----------------------------------------------------------------------------
create or replace function public.place_order(
  p_customer_name    text,
  p_customer_email   text,
  p_customer_phone   text,
  p_delivery_address text,
  p_payment_method   text,
  p_items            jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id    uuid := auth.uid();
  v_item       jsonb;
  v_product    public.products%rowtype;
  v_qty        integer;
  v_subtotal   numeric(12, 2) := 0;
  v_tax        numeric(12, 2);
  v_total      numeric(12, 2);
  v_order      public.orders%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required to place an order';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  if p_payment_method not in ('telebirr', 'cbe_birr', 'chapa', 'cash_on_delivery') then
    raise exception 'Invalid payment method';
  end if;

  -- Validate and price every line first (locks rows in a stable order)
  for v_item in
    select value from jsonb_array_elements(p_items)
    order by (value ->> 'product_id')
  loop
    v_qty := (v_item ->> 'quantity')::integer;
    if v_qty is null or v_qty < 1 then
      raise exception 'Invalid quantity';
    end if;

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
    for update;

    if not found or not v_product.is_active then
      raise exception 'Product is no longer available';
    end if;

    if v_product.stock < v_qty then
      raise exception 'Insufficient stock for "%" (available: %)', v_product.name, v_product.stock;
    end if;

    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  v_tax   := round(v_subtotal * 0.15, 2);   -- 15% VAT
  v_total := v_subtotal + v_tax;

  insert into public.orders (
    user_id, customer_name, customer_email, customer_phone,
    delivery_address, subtotal, tax, total,
    payment_method, payment_status, status
  ) values (
    v_user_id, p_customer_name, p_customer_email, coalesce(p_customer_phone, ''),
    coalesce(p_delivery_address, ''), v_subtotal, v_tax, v_total,
    p_payment_method, 'pending', 'pending'
  )
  returning * into v_order;

  for v_item in
    select value from jsonb_array_elements(p_items)
    order by (value ->> 'product_id')
  loop
    v_qty := (v_item ->> 'quantity')::integer;

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid;

    insert into public.order_items (
      order_id, product_id, product_name, quantity, unit_price, subtotal
    ) values (
      v_order.id, v_product.id, v_product.name, v_qty, v_product.price, v_product.price * v_qty
    );

    update public.products
    set stock = stock - v_qty
    where id = v_product.id;
  end loop;

  -- Notify admins (user_id NULL = admin broadcast)
  insert into public.notifications (user_id, title, message, type)
  values (
    null,
    'New order ' || v_order.order_number,
    p_customer_name || ' placed an order worth ' || to_char(v_total, 'FM999,999,990.00') || ' ETB',
    'new_order'
  );

  -- Notify the customer
  insert into public.notifications (user_id, title, message, type)
  values (
    v_user_id,
    'Order placed',
    'Your order ' || v_order.order_number || ' was received and is pending confirmation.',
    'order_placed'
  );

  return v_order;
end;
$$;

revoke all on function public.place_order(text, text, text, text, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, text, text, jsonb) to authenticated;

-- ============================================================================
-- SOURCE: supabase/migrations/20260826000002_rls_policies.sql
-- ============================================================================
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

-- ============================================================================
-- SOURCE: supabase/migrations/20260826000003_storage.sql
-- ============================================================================
-- ============================================================================
-- AD SECURITY CAMERA SOLUTIONS — Supabase Storage buckets & policies
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('avatars', 'avatars', true),
  ('company-assets', 'company-assets', true)
on conflict (id) do nothing;

-- Idempotent: drop existing AD storage policies so this script can be re-run
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname like 'ad\_%'
  loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end $$;

-- Public read access to all three buckets
create policy "ad_public_read"
  on storage.objects for select
  using (bucket_id in ('product-images', 'avatars', 'company-assets'));

-- Admin writes to product images and company assets
create policy "ad_admin_write_product_images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "ad_admin_update_product_images"
  on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "ad_admin_delete_product_images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

create policy "ad_admin_write_company_assets"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'company-assets' and public.is_admin());

create policy "ad_admin_update_company_assets"
  on storage.objects for update to authenticated
  using (bucket_id = 'company-assets' and public.is_admin())
  with check (bucket_id = 'company-assets' and public.is_admin());

create policy "ad_admin_delete_company_assets"
  on storage.objects for delete to authenticated
  using (bucket_id = 'company-assets' and public.is_admin());

-- Authenticated users manage their own avatar folder (avatars/<uid>/...)
create policy "ad_avatar_upload_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "ad_avatar_update_own_or_admin"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  )
  with check (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

create policy "ad_avatar_delete_own_or_admin"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- ============================================================================
-- SOURCE: supabase/migrations/20260826000004_seed.sql
-- ============================================================================
-- ============================================================================
-- AD SECURITY CAMERA SOLUTIONS — Seed data
-- Safe initial data only: categories, site settings, optional demo catalog.
-- No fake customers, orders, or reviews.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Categories (required)
-- ----------------------------------------------------------------------------
insert into public.product_categories (name, slug, description)
values
  ('CCTV', 'cctv', 'Security cameras, NVRs and surveillance equipment'),
  ('Time Attendance', 'time-attendance', 'Biometric and face-recognition attendance systems'),
  ('Video Intercom', 'video-intercom', 'Visitor and door access intercom systems'),
  ('Network', 'network', 'Switches, access points and networking equipment')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Site settings (single row)
-- ----------------------------------------------------------------------------
insert into public.site_settings (
  id, company_name, phone, secondary_phone, email, address, currency
)
values (
  true,
  'AD Security Camera Solutions',
  '+251 985 959 697',
  '+251 918 109 779',
  'adcctvcamera16@gmail.com',
  'Addis Ababa, Ethiopia',
  'ETB'
)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- OPTIONAL DEMO CATALOG — delete this section if you want to start empty.
-- Products carry no reviews/orders and are safe demo merchandise.
-- ----------------------------------------------------------------------------
insert into public.products (name, slug, description, price, stock, rating, sku, category_id, is_active)
select p.name, p.slug, p.description, p.price, p.stock, 0, p.sku, c.id, true
from (values
  ('IP Camera', 'ip-camera', 'High-quality IP camera with night vision and motion detection.', 17000, 25, 'AD-CCTV-001', 'cctv'),
  ('PTZ Camera', 'ptz-camera', 'Professional PTZ camera with 360 rotation and zoom capability.', 43000, 12, 'AD-CCTV-002', 'cctv'),
  ('Hikvision NVR 8-Channel', 'hikvision-nvr-8-channel', '8-channel NVR with 2TB HDD, H.265+ compression.', 9850, 30, 'AD-CCTV-003', 'cctv'),
  ('Fingerprint Time Attendance', 'fingerprint-time-attendance', 'Biometric fingerprint time attendance system, 1,000 users capacity.', 12500, 40, 'AD-ATT-001', 'time-attendance'),
  ('Face Recognition Attendance', 'face-recognition-attendance', 'Face recognition time attendance with touchless access, 2,000 users capacity.', 18900, 15, 'AD-ATT-002', 'time-attendance'),
  ('Video Intercom System Kit', 'video-intercom-system-kit', 'Complete video intercom system with 7-inch monitor, door camera, 2-way audio.', 15200, 20, 'AD-VIP-001', 'video-intercom'),
  ('Wireless Video Intercom', 'wireless-video-intercom', 'Wireless video intercom with smartphone integration, night vision, motion detection.', 22000, 4, 'AD-VIP-002', 'video-intercom'),
  ('Enterprise Network Switch', 'enterprise-network-switch', '24-port Gigabit network switch with PoE+, managed, rack-mountable.', 7800, 35, 'AD-NET-001', 'network'),
  ('WiFi 6 Access Point', 'wifi-6-access-point', 'High-performance WiFi 6 access point, dual-band, 3000 Mbps.', 5200, 50, 'AD-NET-002', 'network')
) as p (name, slug, description, price, stock, sku, category_slug)
join public.product_categories c on c.slug = p.category_slug
on conflict (sku) do nothing;

-- ============================================================================
-- SOURCE: supabase/migrations/20260826000005_realtime.sql
-- ============================================================================
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

-- ============================================================================
-- SOURCE: supabase/migrations/20260826000006_mobile_rebuild.sql
-- ============================================================================
-- Add website URL to site_settings and camera specs to products.

alter table public.site_settings
  add column if not exists website text not null default 'www.adsecurity.com';

alter table public.products
  add column if not exists resolution text,
  add column if not exists night_vision_m integer;

-- Keep business defaults accurate for fresh installs.
update public.site_settings
  set
    company_name = coalesce(nullif(company_name, ''), 'AD Security Camera Solutions'),
    phone = coalesce(nullif(phone, ''), '+251 985 959 697'),
    secondary_phone = coalesce(nullif(secondary_phone, ''), '+251 918 109 779'),
    email = coalesce(nullif(email, ''), 'adcctvcamera16@gmail.com'),
    website = coalesce(nullif(website, ''), 'www.adsecurity.com'),
    address = coalesce(nullif(address, ''), 'Addis Ababa, Ethiopia')
  where id = true;

insert into public.site_settings (id, company_name, phone, secondary_phone, email, website, address, currency)
values (
  true,
  'AD Security Camera Solutions',
  '+251 985 959 697',
  '+251 918 109 779',
  'adcctvcamera16@gmail.com',
  'www.adsecurity.com',
  'Addis Ababa, Ethiopia',
  'ETB'
)
on conflict (id) do nothing;

-- ============================================================================
-- SOURCE: supabase/migrations/20260827000007_cms.sql
-- ============================================================================
-- ============================================================================
-- AD SECURITY CAMERA SOLUTIONS — Phase 3: Admin CMS & full feature tables
-- Adds the website CMS layer + product/order/service enhancements.
-- Safe to re-run: idempotent (add column if not exists / create table if not exists).
-- ============================================================================

-- ============================================================================
-- 1. PRODUCT ENHANCEMENTS
-- ============================================================================

alter table public.product_categories
  add column if not exists image_url   text not null default '',
  add column if not exists sort_order  integer not null default 0,
  add column if not exists is_active   boolean not null default true;

alter table public.products
  add column if not exists brand            text not null default '',
  add column if not exists sale_price       numeric(12, 2),
  add column if not exists featured         boolean not null default false,
  add column if not exists warranty         text not null default '',
  add column if not exists short_description text not null default '',
  add column if not exists specifications   jsonb not null default '[]'::jsonb,
  add column if not exists features         jsonb not null default '[]'::jsonb;

-- Multiple images per product
create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  url         text not null default '',
  alt         text not null default '',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images (product_id);

-- Named specifications rows
create table if not exists public.product_specifications (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  name        text not null,
  value       text not null default '',
  sort_order  integer not null default 0
);
create index if not exists product_specs_product_idx on public.product_specifications (product_id);

-- ============================================================================
-- 2. SERVICES CMS
-- ============================================================================

create table if not exists public.services (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  icon        text not null default 'Wrench',
  features    jsonb not null default '[]'::jsonb,
  image_url   text not null default '',
  featured    boolean not null default true,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists services_active_idx on public.services (is_active);

create table if not exists public.service_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  slug        text not null unique,
  description text not null default '',
  sort_order  integer not null default 0
);

-- ============================================================================
-- 3. SERVICE REQUESTS ENHANCEMENTS
-- ============================================================================

alter table public.service_requests
  add column if not exists property_type    text not null default '',
  add column if not exists preferred_time   text not null default '',
  add column if not exists num_devices      integer,
  add column if not exists current_system   text not null default '',
  add column if not exists notes            text not null default '',
  add column if not exists admin_notes      text not null default '',
  add column if not exists assigned_staff   text not null default '',
  add column if not exists scheduled_date   date;

-- validate new service request statuses (keep legacy values to avoid breaking old rows)
alter table public.service_requests
  drop constraint if exists service_requests_status_check;

alter table public.service_requests
  add constraint service_requests_status_check
  check (status in ('submitted', 'under_review', 'contacted', 'scheduled',
                    'in_progress', 'completed', 'cancelled',
                    'pending', 'confirmed'));

-- uploaded files per service request
create table if not exists public.service_request_files (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.service_requests (id) on delete cascade,
  url         text not null default '',
  file_name   text not null default '',
  file_type   text not null default '',
  file_size   integer not null default 0,
  kind        text not null default 'image', -- image | document
  created_at  timestamptz not null default now()
);
create index if not exists sr_files_request_idx on public.service_request_files (request_id);

-- ============================================================================
-- 4. ORDERS ENHANCEMENTS
-- ============================================================================

alter table public.orders
  add column if not exists city             text not null default '',
  add column if not exists delivery_notes   text not null default '',
  add column if not exists admin_notes      text not null default '';

-- align statuses to business workflow (keep legacy values valid)
alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in (
    'pending', 'confirmed', 'processing', 'ready',
    'out_for_delivery', 'completed', 'cancelled',
    'shipped', 'delivered'
  ));

-- ============================================================================
-- 5. ADDRESSES
-- ============================================================================

create table if not exists public.addresses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  label       text not null default 'Home',
  full_name   text not null default '',
  phone       text not null default '',
  address     text not null default '',
  city        text not null default '',
  notes       text not null default '',
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses (user_id);

-- ============================================================================
-- 6. GALLERY
-- ============================================================================

create table if not exists public.gallery (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '',
  description text not null default '',
  category    text not null default 'Security Projects',
  image_url   text not null default '',
  featured    boolean not null default false,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists gallery_active_idx on public.gallery (is_active);

-- ============================================================================
-- 7. TESTIMONIALS
-- ============================================================================

create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  customer_name text not null default '',
  company     text not null default '',
  image_url   text not null default '',
  rating      integer not null default 5 check (rating between 1 and 5),
  content     text not null default '',
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ============================================================================
-- 8. FAQS
-- ============================================================================

create table if not exists public.faqs (
  id          uuid primary key default gen_random_uuid(),
  question    text not null default '',
  answer      text not null default '',
  category    text not null default 'General',
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================================
-- 9. NAVIGATION ITEMS
-- ============================================================================

create table if not exists public.navigation_items (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '',
  url         text not null default '',
  is_external boolean not null default false,
  is_active   boolean not null default true,
  sort_order  integer not null default 0
);

-- ============================================================================
-- 10. SOCIAL LINKS
-- ============================================================================

create table if not exists public.social_links (
  id          uuid primary key default gen_random_uuid(),
  platform    text not null default '',
  username    text not null default '',
  url         text not null default '',
  icon        text not null default 'globe',
  is_active   boolean not null default true,
  sort_order  integer not null default 0
);

-- ============================================================================
-- 11. FOOTER SECTIONS (CMS-controlled columns + links)
-- ============================================================================

create table if not exists public.footer_sections (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '',
  links       jsonb not null default '[]'::jsonb, -- [{label, url}]
  is_active   boolean not null default true,
  sort_order  integer not null default 0
);

-- ============================================================================
-- 12. MEDIA LIBRARY
-- ============================================================================

create table if not exists public.media (
  id          uuid primary key default gen_random_uuid(),
  filename    text not null default '',
  file_type   text not null default '',
  file_size   integer not null default 0,
  url         text not null default '',
  path        text not null default '',
  alt_text    text not null default '',
  usage       text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists media_created_idx on public.media (created_at desc);

-- ============================================================================
-- 13. ANNOUNCEMENTS
-- ============================================================================

create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '',
  message     text not null default '',
  image_url   text not null default '',
  cta_label   text not null default '',
  cta_url     text not null default '',
  start_date  date,
  end_date    date,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================================
-- 14. AUDIT LOGS
-- ============================================================================

create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references public.profiles (id) on delete set null,
  admin_email text not null default '',
  action      text not null default '',
  target      text not null default '',
  target_id   text not null default '',
  before      jsonb,
  after       jsonb,
  description text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on public.audit_logs (created_at desc);

-- ============================================================================
-- 15. CMS PAGES
-- ============================================================================

create table if not exists public.pages (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null default '',
  subtitle    text not null default '',
  content     text not null default '',
  image_url   text not null default '',
  seo_title   text not null default '',
  seo_description text not null default '',
  status      text not null default 'draft' check (status in ('draft', 'published')),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================================
-- 16. HOMEPAGE SECTIONS (section-level CMS)
-- ============================================================================

create table if not exists public.homepage_sections (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,      -- hero | services | featured_products | why_choose_us | installation | how_it_works | testimonials | gallery | faq | final_cta
  title       text not null default '',
  subtitle    text not null default '',
  content     jsonb not null default '{}'::jsonb,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- ============================================================================
-- 17. SITE SETTINGS ENHANCEMENTS (branding)
-- ============================================================================

alter table public.site_settings
  add column if not exists logo_url         text not null default '',
  add column if not exists favicon_url      text not null default '',
  add column if not exists tagline          text not null default '',
  add column if not exists description      text not null default '',
  add column if not exists working_hours    text not null default '',
  add column if not exists facebook         text not null default '',
  add column if not exists youtube          text not null default '',
  add column if not exists whatsapp         text not null default '',
  add column if not exists tiktok           text not null default '',
  add column if not exists telegram         text not null default '',
  add column if not exists instagram        text not null default '',
  add column if not exists linkedin         text not null default '',
  -- appearance / branding (theme-configurable)
  add column if not exists primary_color    text not null default '#1b4d2e',
  add column if not exists accent_color     text not null default '#55c997',
  add column if not exists seo_title        text not null default '',
  add column if not exists seo_description  text not null default '',
  add column if not exists seo_image        text not null default '',
  add column if not exists footer_text      text not null default '';

-- ============================================================================
-- 18. updated_at triggers for new tables
-- ============================================================================

drop trigger if exists touch_services on public.services;
create trigger touch_services before update on public.services
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_faqs on public.faqs;
create trigger touch_faqs before update on public.faqs
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_pages on public.pages;
create trigger touch_pages before update on public.pages
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_homepage_sections on public.homepage_sections;
create trigger touch_homepage_sections before update on public.homepage_sections
  for each row execute function public.touch_updated_at();

drop trigger if exists touch_announcements on public.announcements;
create trigger touch_announcements before update on public.announcements
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- 19. place_order redefined: accepts city + delivery notes
-- ============================================================================

create or replace function public.place_order(
  p_customer_name    text,
  p_customer_email   text,
  p_customer_phone   text,
  p_delivery_address text,
  p_city             text,
  p_delivery_notes   text,
  p_payment_method   text,
  p_items            jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id    uuid := auth.uid();
  v_item       jsonb;
  v_product    public.products%rowtype;
  v_qty        integer;
  v_subtotal   numeric(12, 2) := 0;
  v_tax        numeric(12, 2);
  v_total      numeric(12, 2);
  v_order      public.orders%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required to place an order';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  if p_payment_method not in ('telebirr', 'cbe_birr', 'chapa', 'cash_on_delivery') then
    raise exception 'Invalid payment method';
  end if;

  for v_item in
    select value from jsonb_array_elements(p_items)
    order by (value ->> 'product_id')
  loop
    v_qty := (v_item ->> 'quantity')::integer;
    if v_qty is null or v_qty < 1 then
      raise exception 'Invalid quantity';
    end if;

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
    for update;

    if not found or not v_product.is_active then
      raise exception 'Product is no longer available';
    end if;

    if v_product.stock < v_qty then
      raise exception 'Insufficient stock for "%" (available: %)', v_product.name, v_product.stock;
    end if;

    v_subtotal := v_subtotal + v_product.price * v_qty;
  end loop;

  v_tax   := round(v_subtotal * 0.15, 2);   -- 15% VAT
  v_total := v_subtotal + v_tax;

  insert into public.orders (
    user_id, customer_name, customer_email, customer_phone,
    delivery_address, city, delivery_notes, subtotal, tax, total,
    payment_method, payment_status, status
  ) values (
    v_user_id, p_customer_name, p_customer_email, coalesce(p_customer_phone, ''),
    coalesce(p_delivery_address, ''), coalesce(p_city, ''), coalesce(p_delivery_notes, ''),
    v_subtotal, v_tax, v_total,
    p_payment_method, 'pending', 'pending'
  )
  returning * into v_order;

  for v_item in
    select value from jsonb_array_elements(p_items)
    order by (value ->> 'product_id')
  loop
    v_qty := (v_item ->> 'quantity')::integer;

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid;

    insert into public.order_items (
      order_id, product_id, product_name, quantity, unit_price, subtotal
    ) values (
      v_order.id, v_product.id, v_product.name, v_qty, v_product.price, v_product.price * v_qty
    );

    update public.products
    set stock = stock - v_qty
    where id = v_product.id;
  end loop;

  insert into public.notifications (user_id, title, message, type)
  values (
    null,
    'New order ' || v_order.order_number,
    p_customer_name || ' placed an order worth ' || to_char(v_total, 'FM999,999,990.00') || ' ETB',
    'new_order'
  );

  insert into public.notifications (user_id, title, message, type)
  values (
    v_user_id,
    'Order placed',
    'Your order ' || v_order.order_number || ' was received and is pending confirmation.',
    'order_placed'
  );

  return v_order;
end;
$$;

revoke all on function public.place_order(text, text, text, text, text, text, text, jsonb) from public;
grant execute on function public.place_order(text, text, text, text, text, text, text, jsonb) to authenticated;
-- ============================================================================
-- SOURCE: supabase/migrations/20260827000008_cms_rls.sql
-- ============================================================================
-- ============================================================================
-- AD SECURITY CAMERA SOLUTIONS — Phase 3 CMS: Row Level Security
-- Pattern: public read active/published content, admin full write access.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- RLS enable all new tables
-- ----------------------------------------------------------------------------
alter table public.product_images       enable row level security;
alter table public.product_specifications enable row level security;
alter table public.services             enable row level security;
alter table public.service_categories   enable row level security;
alter table public.service_request_files enable row level security;
alter table public.addresses            enable row level security;
alter table public.gallery              enable row level security;
alter table public.testimonials         enable row level security;
alter table public.faqs                 enable row level security;
alter table public.navigation_items     enable row level security;
alter table public.social_links         enable row level security;
alter table public.footer_sections      enable row level security;
alter table public.media                enable row level security;
alter table public.announcements        enable row level security;
alter table public.audit_logs           enable row level security;
alter table public.pages                enable row level security;
alter table public.homepage_sections    enable row level security;

-- Idempotent cleanup of AD policies on these tables
do $$
declare pol record;
begin
  for pol in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and policyname like 'cms\_%'
  loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Generic helper: admin-select / public-select-active / admin-write policies
-- Public sees rows where is_active = true (where such a column exists).
-- content_is_active abstracts the column name.
-- ---------------------------------------------------------------------------

-- product_images: public read (join via products), admin write
create policy "public_select_product_images"
  on public.product_images for select
  using (true);
create policy "admin_insert_product_images"
  on public.product_images for insert with check (public.is_admin());
create policy "admin_update_product_images"
  on public.product_images for update using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_product_images"
  on public.product_images for delete using (public.is_admin());

-- product_specifications
create policy "public_select_product_specs"
  on public.product_specifications for select
  using (true);
create policy "admin_insert_product_specs"
  on public.product_specifications for insert with check (public.is_admin());
create policy "admin_update_product_specs"
  on public.product_specifications for update using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_product_specs"
  on public.product_specifications for delete using (public.is_admin());

-- services: public reads active; admin full
create policy "public_select_services_active"
  on public.services for select
  using (is_active or public.is_admin());
create policy "admin_insert_services"
  on public.services for insert with check (public.is_admin());
create policy "admin_update_services"
  on public.services for update using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_services"
  on public.services for delete using (public.is_admin());

-- service_categories
create policy "public_select_service_categories"
  on public.service_categories for select
  using (true);
create policy "admin_insert_service_categories"
  on public.service_categories for insert with check (public.is_admin());
create policy "admin_update_service_categories"
  on public.service_categories for update using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_service_categories"
  on public.service_categories for delete using (public.is_admin());

-- service_request_files: owner reads own request's files; admin full; uploads allowed for guests/owner
create policy "public_insert_service_request_files"
  on public.service_request_files for insert with check (true);
create policy "service_request_files_select"
  on public.service_request_files for select using (
    public.is_admin()
    or exists (
      select 1 from public.service_requests sr
      where sr.id = request_id and sr.user_id = auth.uid()
    )
  );
create policy "service_request_files_delete_admin"
  on public.service_request_files for delete using (public.is_admin());

-- addresses: owner only
create policy "addresses_select_own"
  on public.addresses for select using (user_id = auth.uid());
create policy "addresses_insert_own"
  on public.addresses for insert with check (user_id = auth.uid());
create policy "addresses_update_own"
  on public.addresses for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "addresses_delete_own"
  on public.addresses for delete using (user_id = auth.uid());

-- gallery
create policy "public_select_gallery_active"
  on public.gallery for select using (is_active or public.is_admin());
create policy "admin_insert_gallery"
  on public.gallery for insert with check (public.is_admin());
create policy "admin_update_gallery"
  on public.gallery for update using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_gallery"
  on public.gallery for delete using (public.is_admin());

-- testimonials
create policy "public_select_testimonials_active"
  on public.testimonials for select using (is_active or public.is_admin());
create policy "admin_insert_testimonials"
  on public.testimonials for insert with check (public.is_admin());
create policy "admin_update_testimonials"
  on public.testimonials for update using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_testimonials"
  on public.testimonials for delete using (public.is_admin());

-- faqs
create policy "public_select_faqs_active"
  on public.faqs for select using (is_active or public.is_admin());
create policy "admin_insert_faqs"
  on public.faqs for insert with check (public.is_admin());
create policy "admin_update_faqs"
  on public.faqs for update using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_faqs"
  on public.faqs for delete using (public.is_admin());

-- navigation_items
create policy "public_select_navigation_active"
  on public.navigation_items for select using (is_active or public.is_admin());
create policy "admin_insert_navigation"
  on public.navigation_items for insert with check (public.is_admin());
create policy "admin_update_navigation"
  on public.navigation_items for update using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_navigation"
  on public.navigation_items for delete using (public.is_admin());

-- social_links
create policy "public_select_social_active"
  on public.social_links for select using (is_active or public.is_admin());
create policy "admin_insert_social"
  on public.social_links for insert with check (public.is_admin());
create policy "admin_update_social"
  on public.social_links for update using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_social"
  on public.social_links for delete using (public.is_admin());

-- footer_sections
create policy "public_select_footer_active"
  on public.footer_sections for select using (is_active or public.is_admin());
create policy "admin_insert_footer"
  on public.footer_sections for insert with check (public.is_admin());
create policy "admin_update_footer"
  on public.footer_sections for update using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_footer"
  on public.footer_sections for delete using (public.is_admin());

-- media: admin write; public read (used to display reused images)
create policy "public_select_media"
  on public.media for select using (true);
create policy "admin_insert_media"
  on public.media for insert with check (public.is_admin());
create policy "admin_update_media"
  on public.media for update using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_media"
  on public.media for delete using (public.is_admin());

-- announcements: public reads active; admin full
create policy "public_select_announcements_active"
  on public.announcements for select using (is_active or public.is_admin());
create policy "admin_insert_announcements"
  on public.announcements for insert with check (public.is_admin());
create policy "admin_update_announcements"
  on public.announcements for update using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_announcements"
  on public.announcements for delete using (public.is_admin());

-- audit_logs: admin only
create policy "admin_select_audit_logs"
  on public.audit_logs for select using (public.is_admin());
create policy "admin_insert_audit_logs"
  on public.audit_logs for insert with check (public.is_admin());

-- pages: public read published; admin full
create policy "public_select_pages_published"
  on public.pages for select using (status = 'published' or public.is_admin());
create policy "admin_insert_pages"
  on public.pages for insert with check (public.is_admin());
create policy "admin_update_pages"
  on public.pages for update using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_pages"
  on public.pages for delete using (public.is_admin());

-- homepage_sections
create policy "public_select_homepage_active"
  on public.homepage_sections for select using (is_active or public.is_admin());
create policy "admin_insert_homepage_sections"
  on public.homepage_sections for insert with check (public.is_admin());
create policy "admin_update_homepage_sections"
  on public.homepage_sections for update using (public.is_admin()) with check (public.is_admin());
create policy "admin_delete_homepage_sections"
  on public.homepage_sections for delete using (public.is_admin());

-- ============================================================================
-- Storage: allow admin uploads to a media bucket + service files
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "ad_media_read" on storage.objects;
create policy "ad_media_read"
  on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "ad_media_write_admin" on storage.objects;
create policy "ad_media_write_admin"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "ad_media_update_admin" on storage.objects;
create policy "ad_media_update_admin"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "ad_media_delete_admin" on storage.objects;
create policy "ad_media_delete_admin"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- service-requests bucket for customer photo/document uploads (public read)
insert into storage.buckets (id, name, public)
values ('service-files', 'service-files', true)
on conflict (id) do nothing;

drop policy if exists "ad_service_files_read" on storage.objects;
create policy "ad_service_files_read"
  on storage.objects for select
  using (bucket_id = 'service-files');

drop policy if exists "ad_service_files_write" on storage.objects;
create policy "ad_service_files_write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'service-files');

drop policy if exists "ad_service_files_update" on storage.objects;
create policy "ad_service_files_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'service-files')
  with check (bucket_id = 'service-files');

-- avatars bucket: public read for all, write only to own folder (avt/<uid>/)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "ad_avatars_read" on storage.objects;
create policy "ad_avatars_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "ad_avatars_write_own" on storage.objects;
create policy "ad_avatars_write_own"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "ad_avatars_update_own" on storage.objects;
create policy "ad_avatars_update_own"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "ad_avatars_delete_own" on storage.objects;
create policy "ad_avatars_delete_own"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================================
-- Realtime publication additions
-- ============================================================================

do $$
begin
  begin alter publication supabase_realtime add table public.services;
  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.contact_messages;
  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.media;
  exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.gallery;
  exception when duplicate_object then null; end;
end $$;

notify pgrst, 'reload schema';
-- ============================================================================
-- SOURCE: supabase/migrations/20260827000009_cms_seed.sql
-- ============================================================================
-- ============================================================================
-- AD SECURITY CAMERA SOLUTIONS — Phase 3 CMS seed data
-- All of this is editable/deletable by the Admin from the CMS.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Services
-- ----------------------------------------------------------------------------
insert into public.services (name, slug, description, icon, features, featured, is_active, sort_order)
values
  ('CCTV Systems', 'cctv-systems', 'Professional surveillance systems for homes, offices, shops and businesses.', 'Video',
   '["Installation","Repair","Maintenance"]', true, true, 1),
  ('Network Solutions', 'network-solutions',
   'Networking infrastructure and connectivity solutions for reliable business networks.', 'Network',
   '["Cabling","Switching","Wi-Fi","Optimization"]', true, true, 2),
  ('Time Attendance', 'time-attendance',
   'Biometric and face-recognition employee attendance and management systems.', 'Clock',
   '["Biometric","Face Recognition","Reports"]', true, true, 3),
  ('Video Intercom', 'video-intercom',
   'Secure visitor verification and video communication entrance monitoring systems.', 'DoorOpen',
   '["Visitor Access","2-Way Audio","Night Vision"]', true, true, 4),
  ('Web & IT Solutions', 'web-it-solutions',
   'Professional websites, e-commerce platforms and IT technology solutions.', 'Code',
   '["Websites","E-commerce","IT Consulting"]', true, true, 5),
  ('Access Control', 'access-control',
   'Electronic locks, keypad entry and secure biometric access control systems.', 'ShieldCheck',
   '["Electronic Locks","Keypad","Biometric"]', true, true, 6)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Service categories (legacy grouping)
-- ----------------------------------------------------------------------------
insert into public.service_categories (slug, name, description, sort_order)
values
  ('installation', 'Installation', 'Professional system installation', 1),
  ('maintenance', 'Maintenance', 'Ongoing system upkeep', 2),
  ('repair', 'Repair', 'Diagnostics and repair', 3),
  ('consultation', 'Consultation', 'Security advice and system design', 4),
  ('sales', 'Sales', 'Security equipment sales', 5)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Navigation items (Admin-controlled)
-- ----------------------------------------------------------------------------
insert into public.navigation_items (title, url, is_external, is_active, sort_order)
values
  ('Home', '/', false, true, 1),
  ('Products', '/products', false, true, 2),
  ('Services', '/services', false, true, 3),
  ('About', '/about', false, true, 4),
  ('Gallery', '/gallery', false, true, 5),
  ('Contact', '/contact', false, true, 6)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Social links (Admin-controlled; usernames ≠ urls)
-- ----------------------------------------------------------------------------
insert into public.social_links (platform, username, url, icon, is_active, sort_order)
values
  ('Instagram', '@adsecuritycamera', 'https://instagram.com/adsecuritycamera', 'instagram', true, 1),
  ('Telegram', '@adsecuritycamera', 'https://t.me/adsecuritycamera', 'send', true, 2),
  ('TikTok', '@adsecuritycamera', 'https://tiktok.com/@adsecuritycamera', 'music', true, 3)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Footer sections (Admin-controlled)
-- ----------------------------------------------------------------------------
insert into public.footer_sections (title, links, is_active, sort_order)
values
  ('Quick Links', '[{"label":"Home","url":"/"},{"label":"Products","url":"/products"},{"label":"Services","url":"/services"},{"label":"About","url":"/about"},{"label":"Gallery","url":"/gallery"},{"label":"Contact","url":"/contact"}]', true, 1),
  ('Services', '[{"label":"CCTV Systems","url":"/services"},{"label":"Network Solutions","url":"/services"},{"label":"Time Attendance","url":"/services"},{"label":"Video Intercom","url":"/services"},{"label":"Web & IT Solutions","url":"/services"},{"label":"Access Control","url":"/services"}]', true, 2)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- FAQs
-- ----------------------------------------------------------------------------
insert into public.faqs (question, answer, category, is_active, sort_order)
values
  ('What CCTV system should I choose?', 'It depends on your needs — indoor vs outdoor, resolution, night vision and number of cameras. Contact us for a free site assessment and we will recommend the right system for your home or business.', 'Products', true, 1),
  ('Do you provide installation?', 'Yes. Professional installation is our core service — we handle site assessment, mounting, configuration and testing for all CCTV, network, attendance and intercom systems.', 'Services', true, 2),
  ('Do you provide maintenance?', 'Absolutely. We offer scheduled maintenance and fast repair services to keep your security systems running reliably.', 'Services', true, 3),
  ('Can you install systems for businesses?', 'Yes. We serve homes, offices, shops, warehouses and large businesses with scalable security and networking solutions.', 'Services', true, 4),
  ('Do you provide access control?', 'Yes, we supply and install electronic locks, keypad and biometric access control systems for secure entry management.', 'Products', true, 5),
  ('Do you provide networking services?', 'Yes, we design and install structured cabling, switches, access points and full networking infrastructure.', 'Services', true, 6)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Testimonials (Admin-controlled)
-- ----------------------------------------------------------------------------
insert into public.testimonials (customer_name, company, rating, content, is_active, sort_order)
values
  ('Bereket T.', 'Tekle Trading', 5,
   'AD Security installed 16 CCTV cameras at our warehouse. The quality is excellent and the team was professional and on-time.', true, 1),
  ('Sara M.', 'Local Cafe', 5,
   'Very responsive and helpful. They installed our access control and time attendance systems quickly.', true, 2),
  ('Dawit G.', 'Homeowner', 5,
   'Great service and genuine products. They walked me through everything and the after-sales support is fantastic.', true, 3)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Gallery
-- ----------------------------------------------------------------------------
insert into public.gallery (title, description, category, featured, is_active, sort_order)
values
  ('Warehouse CCTV Installation', 'Complete 12-camera surveillance for a warehouse facility.', 'CCTV Installation', true, true, 1),
  ('Office Access Control', 'Biometric entry system for an office building.', 'Access Control', true, true, 2),
  ('Network Cabling Project', 'Structured cabling and switch deployment.', 'Networking', true, true, 3),
  ('Time Attendance Deployment', 'Fingerprint attendance system rollout.', 'Time Attendance', true, true, 4),
  ('Retail Video Intercom', 'Video intercom for a retail storefront.', 'Video Intercom', true, true, 5),
  ('Home Security System', 'Complete home security and camera setup.', 'Security Projects', true, true, 6)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Homepage sections (section-level CMS)
-- ----------------------------------------------------------------------------
insert into public.homepage_sections (key, title, subtitle, content, is_active, sort_order)
values
  ('hero', '',
   '',
   jsonb_build_object(
     'heading', 'Complete Security Solutions for Your Home & Business',
     'subtitle', 'AD Security Camera Solution provides security systems, professional installation and technology solutions for homes and businesses across Ethiopia.',
     'cta1_label', 'Explore Products', 'cta1_url', '/products',
     'cta2_label', 'Request a Service', 'cta2_url', '/services'
   ), true, 1),
  ('services', 'Our Services',
   'End-to-end security and networking solutions',
   jsonb_build_object('show_featured_only', false), true, 2),
  ('featured_products', 'Featured Products',
   'Genuine security equipment with warranty',
   '{}'::jsonb, true, 3),
  ('why_choose_us', 'Why Choose Us',
   'Professional, reliable and customer-focused',
   jsonb_build_array(
     jsonb_build_object('title','Professional Installation','body','Expert certified technicians'),
     jsonb_build_object('title','Quality Security Equipment','body','100% authentic, trusted brands'),
     jsonb_build_object('title','Experienced Technical Support','body','Dedicated local support'),
     jsonb_build_object('title','Reliable Maintenance','body','Scheduled upkeep, fast response'),
     jsonb_build_object('title','Customized Solutions','body','Tailored to your needs'),
     jsonb_build_object('title','Customer-focused Service','body','Responsive, friendly and local')
   ), true, 4),
  ('installation', 'Professional Installation',
   'Site inspection, design, installation, configuration, testing, maintenance and support.',
   jsonb_build_object('cta_label','Book Installation','cta_url','/services'), true, 5),
  ('how_it_works', 'How It Works',
   'Simple, transparent process',
   jsonb_build_array(
     jsonb_build_object('step','1','title','Contact Us','body','Reach out by phone, email or message'),
     jsonb_build_object('step','2','title','Discuss Your Needs','body','We talk through your security requirements'),
     jsonb_build_object('step','3','title','Site Assessment','body','We inspect and design the right solution'),
     jsonb_build_object('step','4','title','Solution & Quote','body','Clear quote and plan'),
     jsonb_build_object('step','5','title','Installation','body','Professional install and setup'),
     jsonb_build_object('step','6','title','Support & Maintenance','body','Ongoing care and support')
   ), true, 6),
  ('testimonials', 'What Our Clients Say', '', '{}'::jsonb, true, 7),
  ('gallery', 'Our Work', 'Recent security projects', '{}'::jsonb, true, 8),
  ('faq', 'Frequently Asked Questions', '', '{}'::jsonb, true, 9),
  ('final_cta', 'Protect What Matters Most',
   'Professional, reliable security solutions for your home and business.',
   jsonb_build_object('cta1_label','Request Service','cta1_url','/services','cta2_label','Shop Products','cta2_url','/products'), true, 10)
on conflict (key) do nothing;

-- ----------------------------------------------------------------------------
-- Static pages (about, gallery, faq, contact content lives here)
-- ----------------------------------------------------------------------------
insert into public.pages (slug, title, subtitle, content, status, sort_order)
values
  ('about', 'About Us', 'Our story, mission and values',
   'AD Security Camera Solutions is a professional security and technology company. We sell security equipment and provide installation, maintenance, networking, access control, time attendance, video intercom, and IT/web solutions. We combine quality equipment with professional craftsmanship to keep homes and businesses across Ethiopia secure.',
   'published', 1),
  ('gallery', 'Our Projects', 'Recent security work',
   'Browse our recent installations across CCTV, access control, networking, time attendance and video intercom projects.',
   'published', 2),
  ('faq', 'Frequently Asked Questions', 'Answers to common questions',
   'Find answers about our products, services, installation and support.',
   'published', 3),
  ('contact', 'Contact Us', 'Get in touch',
   'Talk to our team about your security needs. We are quick to respond.',
   'published', 4)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Refresh company contact info to the required values
-- ----------------------------------------------------------------------------
update public.site_settings
  set email = coalesce(nullif(email,''), 'adsecuritycamerasolution@gmail.com'),
      tagline = coalesce(nullif(tagline,''), 'Professional Security & Technology Solutions'),
      instagram = 'https://instagram.com/adsecuritycamera',
      telegram = 'https://t.me/adsecuritycamera',
      tiktok = 'https://tiktok.com/@adsecuritycamera'
  where id = true;

notify pgrst, 'reload schema';