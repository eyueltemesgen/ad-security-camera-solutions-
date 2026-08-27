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