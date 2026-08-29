-- ============================================================================
-- AD SECURITY CAMERA SOLUTION — Production database schema
-- PostgreSQL 14+ / Express API
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- users (customers + admins). Passwords hashed with bcrypt on the API layer.
-- ----------------------------------------------------------------------------
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null default '',
  email         text not null unique,
  phone         text not null default '',
  password_hash text not null,
  avatar_url    text not null default '',
  role          text not null default 'customer' check (role in ('customer', 'admin')),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists user_addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users (id) on delete cascade,
  label      text not null default 'Home',
  full_name  text not null default '',
  phone      text not null default '',
  address    text not null default '',
  city       text not null default '',
  country    text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists user_addresses_user_idx on user_addresses (user_id);

-- ----------------------------------------------------------------------------
-- Product catalog
-- ----------------------------------------------------------------------------
create table if not exists product_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  image_url   text not null default '',
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  sku              text not null default '',
  slug             text not null unique,
  category_id      uuid references product_categories (id) on delete set null,
  brand            text not null default '',
  short_description text not null default '',
  description      text not null default '',
  price            numeric(12,2) not null default 0 check (price >= 0),
  sale_price       numeric(12,2) check (sale_price is null or sale_price >= 0),
  cost_price       numeric(12,2) not null default 0 check (cost_price >= 0),
  stock            integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 5,
  image_url        text not null default '',
  is_featured      boolean not null default false,
  is_active        boolean not null default true,
  warranty_info    text not null default '',
  rating           numeric(2,1) not null default 0 check (rating between 0 and 5),
  meta_title       text not null default '',
  meta_description text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists products_category_idx on products (category_id);
create index if not exists products_active_idx on products (is_active);
create index if not exists products_featured_idx on products (is_featured) where is_active = true;
create index if not exists products_slug_idx on products (slug);

create table if not exists product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url        text not null,
  alt_text   text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on product_images (product_id);

create table if not exists product_specifications (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  key        text not null,
  value      text not null,
  sort_order integer not null default 0
);
create index if not exists product_specs_product_idx on product_specifications (product_id);

-- ----------------------------------------------------------------------------
-- Services
-- ----------------------------------------------------------------------------
create table if not exists service_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text not null default '',
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists services (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  category_id      uuid references service_categories (id) on delete set null,
  icon             text not null default 'wrench',
  image_url        text not null default '',
  short_description text not null default '',
  description      text not null default '',
  features         jsonb not null default '[]'::jsonb,
  is_featured      boolean not null default false,
  is_active        boolean not null default true,
  sort_order       integer not null default 0,
  meta_title       text not null default '',
  meta_description text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists services_category_idx on services (category_id);

-- ----------------------------------------------------------------------------
-- Orders / checkout
-- ----------------------------------------------------------------------------
create sequence if not exists order_number_seq start with 1001;

create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text not null unique default ('AD-' || lpad(nextval('order_number_seq')::text, 6, '0')),
  user_id          uuid references users (id) on delete set null,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null default '',
  delivery_address text not null default '',
  delivery_city    text not null default '',
  delivery_notes   text not null default '',
  status           text not null default 'pending'
                   check (status in ('pending','confirmed','processing','ready','out_for_delivery','completed','cancelled')),
  payment_method   text not null default 'cash_on_delivery'
                   check (payment_method in ('telebirr','cbe_birr','chapa','cash_on_delivery')),
  payment_status   text not null default 'pending' check (payment_status in ('pending','paid','failed')),
  subtotal         numeric(12,2) not null default 0,
  tax              numeric(12,2) not null default 0,
  total            numeric(12,2) not null default 0,
  admin_notes      text not null default '',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists orders_user_idx on orders (user_id);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_created_idx on orders (created_at desc);

create table if not exists order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders (id) on delete cascade,
  product_id   uuid references products (id) on delete set null,
  product_name text not null,
  sku          text not null default '',
  image_url    text not null default '',
  quantity     integer not null check (quantity > 0),
  unit_price   numeric(12,2) not null,
  subtotal     numeric(12,2) not null,
  created_at   timestamptz not null default now()
);
create index if not exists order_items_order_idx on order_items (order_id);

-- Persistent carts for authenticated customers
create table if not exists carts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cart_items (
  id         uuid primary key default gen_random_uuid(),
  cart_id    uuid not null references carts (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  quantity   integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, product_id)
);
create index if not exists cart_items_cart_idx on cart_items (cart_id);

-- ----------------------------------------------------------------------------
-- Service requests
-- ----------------------------------------------------------------------------
create sequence if not exists service_request_seq start with 1001;

create table if not exists service_requests (
  id               uuid primary key default gen_random_uuid(),
  request_number   text not null unique default ('SR-' || lpad(nextval('service_request_seq')::text, 5, '0')),
  user_id          uuid references users (id) on delete set null,
  customer_name    text not null,
  phone            text not null default '',
  email            text not null default '',
  service_id       uuid references services (id) on delete set null,
  service_name     text not null default '',
  location         text not null default '',
  property_type    text not null default '',
  preferred_date   date,
  preferred_time   text not null default '',
  device_count     integer,
  current_system   text not null default '',
  description      text not null default '',
  notes            text not null default '',
  status           text not null default 'submitted'
                   check (status in ('submitted','under_review','contacted','scheduled','in_progress','completed','cancelled')),
  admin_notes      text not null default '',
  assigned_technician text not null default '',
  scheduled_date   date,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists service_requests_user_idx on service_requests (user_id);
create index if not exists service_requests_status_idx on service_requests (status);

create table if not exists service_request_files (
  id         uuid primary key default gen_random_uuid(),
  request_id uuid not null references service_requests (id) on delete cascade,
  file_url   text not null,
  file_name  text not null default '',
  file_type  text not null default '',
  file_size  integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists srf_request_idx on service_request_files (request_id);

-- ----------------------------------------------------------------------------
-- Communications
-- ----------------------------------------------------------------------------
create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text not null default '',
  subject    text not null default '',
  message    text not null,
  status     text not null default 'new' check (status in ('new','read','responded','archived')),
  created_at timestamptz not null default now()
);
create index if not exists contact_messages_created_idx on contact_messages (created_at desc);

create table if not exists notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users (id) on delete cascade, -- null = admin broadcast
  title      text not null,
  message    text not null default '',
  type       text not null default 'info',
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id);

create table if not exists password_resets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users (id) on delete cascade,
  token      text not null unique,
  expires_at timestamptz not null,
  used       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Content / CMS
-- ----------------------------------------------------------------------------
create table if not exists testimonials (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  company    text not null default '',
  image_url  text not null default '',
  rating     integer not null default 5 check (rating between 1 and 5),
  content    text not null,
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (name, content)
);

create table if not exists faqs (
  id         uuid primary key default gen_random_uuid(),
  category   text not null default 'General',
  question   text not null,
  answer     text not null,
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (question)
);

create table if not exists gallery (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null default '',
  title       text not null default '',
  description text not null default '',
  category    text not null default 'Security Projects',
  is_featured boolean not null default false,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  unique (title)
);
create index if not exists gallery_active_idx on gallery (is_active);

create table if not exists media (
  id         uuid primary key default gen_random_uuid(),
  file_url   text not null,
  file_name  text not null default '',
  file_type  text not null default '',
  file_size  integer not null default 0,
  alt_text   text not null default '',
  usage      text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists navigation_items (
  id         uuid primary key default gen_random_uuid(),
  label      text not null unique,
  url        text not null default '/',
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists footer_sections (
  id         uuid primary key default gen_random_uuid(),
  title      text not null unique,
  links      jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_active  boolean not null default true
);

create table if not exists social_links (
  id         uuid primary key default gen_random_uuid(),
  platform   text not null unique,
  username   text not null default '',
  url        text not null default '',
  icon       text not null default '',
  is_active  boolean not null default true,
  sort_order integer not null default 0
);

-- website_settings: key/value CMS store grouped by section.
create table if not exists website_settings (
  id         uuid primary key default gen_random_uuid(),
  section    text not null,
  key        text not null,
  value      jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now(),
  unique (section, key)
);

-- Homepage sections. Content is JSONB, fully admin-editable.
create table if not exists homepage_sections (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  title      text not null default '',
  content    jsonb not null default '{}'::jsonb,
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

-- CMS-managed pages (About, Services, Products, Gallery, FAQ, Contact, custom)
create table if not exists pages (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  subtitle         text not null default '',
  content          jsonb not null default '{}'::jsonb,
  meta_title       text not null default '',
  meta_description text not null default '',
  is_active        boolean not null default true,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  message    text not null default '',
  image_url  text not null default '',
  cta_label  text not null default '',
  cta_url    text not null default '',
  start_at   timestamptz,
  end_at     timestamptz,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Audit log
-- ----------------------------------------------------------------------------
create table if not exists audit_logs (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references users (id) on delete set null,
  admin_name  text not null default '',
  action      text not null,
  target_type text not null default '',
  target_id   text not null default '',
  description text not null default '',
  old_value   jsonb not null default 'null'::jsonb,
  new_value   jsonb not null default 'null'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists audit_logs_created_idx on audit_logs (created_at desc);

-- ----------------------------------------------------------------------------
-- updated_at maintenance triggers
-- ----------------------------------------------------------------------------
create or replace function touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.apply_trigger(tbl regclass) returns void
language plpgsql as $$
begin
  execute format('drop trigger if exists touch_%s on %s', replace(tbl::text, '.', '_'), tbl);
  execute format('create trigger touch_%s before update on %s for each row execute function touch_updated_at()', replace(tbl::text, '.', '_'), tbl);
end;
$$;

select public.apply_trigger('users');
select public.apply_trigger('products');
select public.apply_trigger('product_categories');
select public.apply_trigger('services');
select public.apply_trigger('orders');
select public.apply_trigger('service_requests');
select public.apply_trigger('carts');
select public.apply_trigger('homepage_sections');
select public.apply_trigger('pages');
select public.apply_trigger('website_settings');
select public.apply_trigger('announcements');
select public.apply_trigger('testimonials');

drop function if exists public.apply_trigger;