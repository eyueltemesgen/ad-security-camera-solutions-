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

-- Refresh PostgREST schema cache so new tables are visible to the API immediately
notify pgrst, 'reload schema';
