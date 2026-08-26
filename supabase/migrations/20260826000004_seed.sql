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
