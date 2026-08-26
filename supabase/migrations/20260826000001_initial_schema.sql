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
