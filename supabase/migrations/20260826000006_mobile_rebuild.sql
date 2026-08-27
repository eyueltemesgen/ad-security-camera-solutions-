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
