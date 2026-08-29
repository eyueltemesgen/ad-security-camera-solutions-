-- ============================================================================
-- AD SECURITY CAMERA SOLUTION — Seed data
-- All content is editable/deletable by the Admin from the dashboard.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Admin user (password: Admin@123 — change immediately after first login)
-- ----------------------------------------------------------------------------
insert into users (full_name, email, phone, password_hash, role, is_active)
values (
  'System Administrator',
  'admin@adsecurity.com',
  '+251 985 959 697',
  '$2b$10$oP2PlBioKuCnX9dLiDTa.uVXtBVYD5mGRyDSl8BGBNA3nGW8iw6re', -- bcrypt of "Admin@123"
  'admin',
  true
)
on conflict (email) do nothing;

-- ----------------------------------------------------------------------------
-- Product categories
-- ----------------------------------------------------------------------------
insert into product_categories (name, slug, description, sort_order) values
  ('CCTV Cameras', 'cctv-cameras', 'Professional surveillance cameras for home and business.', 1),
  ('IP Cameras', 'ip-cameras', 'Network IP cameras with remote viewing and smart features.', 2),
  ('Analog Cameras', 'analog-cameras', 'Reliable analog / HD-TVI camera systems.', 3),
  ('DVR', 'dvr', 'Digital video recorders for analog camera systems.', 4),
  ('NVR', 'nvr', 'Network video recorders for IP camera systems.', 5),
  ('Hard Drives', 'hard-drives', 'Surveillance-grade hard drives for recording.', 6),
  ('Network Equipment', 'network-equipment', 'Switches, routers, access points and cabling.', 7),
  ('Access Control', 'access-control', 'Electronic locks, keypads and biometric access.', 8),
  ('Time Attendance', 'time-attendance', 'Biometric and face-recognition attendance systems.', 9),
  ('Video Intercom', 'video-intercom', 'Video intercom and door entry systems.', 10),
  ('Cables & Accessories', 'cables-accessories', 'Cables, connectors, brackets and mounting accessories.', 11),
  ('Power Supplies', 'power-supplies', 'Power adapters, UPS and surge protection.', 12),
  ('Security Accessories', 'security-accessories', 'Additional security equipment and accessories.', 13)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Products (demo catalog — fully editable)
-- ----------------------------------------------------------------------------
insert into products
  (name, sku, slug, category_id, brand, short_description, description, price, sale_price, stock, image_url, is_featured, is_active, warranty_info, rating, meta_title, meta_description)
select p.name, p.sku, p.slug, c.id, p.brand, p.short, p.long, p.price, p.sale, p.stock, '', p.featured::boolean, true, p.warranty, p.rating, p.name, p.short
from (values
  ('4MP IP Bullet Camera', 'AD-IP-001', '4mp-ip-bullet-camera', 'ip-cameras', 'Hikvision', 'High-resolution 4MP IP bullet camera with IR night vision up to 30m and IP67 weatherproof housing.',
   'The 4MP IP Bullet Camera delivers crisp 2560x1440 resolution day and night. Built with a durable IP67-rated housing, it is ideal for outdoor perimeter surveillance. Supports H.265+ compression, motion detection, and remote viewing via mobile app.',
   2450, 2100, 40, true, '1 Year Warranty', 4.8),
  ('8MP IP Dome Camera', 'AD-IP-002', '8mp-ip-dome-camera', 'ip-cameras', 'Dahua', 'Ultra-clear 8MP IP dome camera with wide dynamic range and 20m IR night vision.',
   'The 8MP IP Dome Camera offers stunning 4K clarity with WDR for challenging lighting. Its vandal-resistant dome housing makes it perfect for indoor retail, office and lobby environments.',
   3200, null, 25, true, '1 Year Warranty', 4.7),
  ('HD-TVI Analog Camera 2MP', 'AD-AN-001', 'hdtvi-analog-camera-2mp', 'analog-cameras', 'Hikvision', 'Cost-effective 2MP HD-TVI analog camera compatible with existing coax infrastructure.',
   'Upgrade your legacy analog system with 2MP HD-TVI quality over existing coaxial cabling. Features 20m IR night vision and true day/night switching.',
   950, 850, 60, true, '6 Months Warranty', 4.5),
  ('8-Channel DVR 1080p', 'AD-DVR-001', '8-channel-dvr-1080p', 'dvr', 'Hikvision', '8-channel DVR supporting 1080p recording with H.264/H.265 compression and remote access.',
   'This 8-channel DVR records up to 1080p per channel, supports up to 6TB of storage, and offers mobile remote viewing through the official app. Perfect for small to medium businesses.',
   1800, 1600, 30, true, '1 Year Warranty', 4.6),
  ('16-Channel NVR 4K', 'AD-NVR-001', '16-channel-nvr-4k', 'nvr', 'Dahua', '16-channel NVR with 4K recording capability, PoE ports and H.265+ compression.',
   'Powerful 16-channel NVR for IP camera systems. Supports 4K resolution, built-in PoE switch for simplified cabling, and dual HDD bays for extended storage.',
   5200, null, 15, true, '1 Year Warranty', 4.9),
  ('Surveillance HDD 4TB', 'AD-HDD-001', 'surveillance-hdd-4tb', 'hard-drives', 'WD Purple', 'Surveillance-grade 4TB hard drive engineered for 24/7 recording workloads.',
   'Western Digital Purple 4TB drive designed for always-on surveillance recording with high endurance and low power consumption.',
   2400, 2200, 50, true, '2 Year Warranty', 4.7),
  ('24-Port PoE Switch', 'AD-NET-001', '24-port-poe-switch', 'network-equipment', 'TP-Link', '24-port Gigabit PoE+ managed switch for powering IP cameras and access points.',
   'Enterprise-grade 24-port PoE+ switch delivering up to 30W per port. Ideal for powering IP cameras, VoIP phones and wireless access points from a single unit.',
   4800, null, 20, true, '1 Year Warranty', 4.6),
  ('WiFi 6 Access Point', 'AD-NET-002', 'wifi-6-access-point', 'network-equipment', 'TP-Link', 'Dual-band WiFi 6 access point with 3000Mbps throughput and seamless roaming.',
   'High-performance WiFi 6 access point supporting 2.4GHz and 5GHz bands. Delivers fast, reliable wireless coverage for offices, shops and homes.',
   1600, 1400, 45, true, '1 Year Warranty', 4.5),
  ('Biometric Time Attendance', 'AD-ATT-001', 'biometric-time-attendance', 'time-attendance', 'ZKTeco', 'Fingerprint time attendance terminal with 1,000-user capacity and USB reporting.',
   'Reliable fingerprint-based time attendance system. Supports 1,000 users and 100,000 transactions, with USB and TCP/IP connectivity for easy report export.',
   2900, null, 35, true, '1 Year Warranty', 4.8),
  ('Face Recognition Attendance', 'AD-ATT-002', 'face-recognition-attendance', 'time-attendance', 'ZKTeco', 'Touchless face recognition attendance with mask detection and 2,000-user capacity.',
   'Modern face-recognition attendance terminal with touchless operation, mask detection and anti-spoofing. Holds up to 2,000 users with fast recognition.',
   3800, 3500, 20, true, '1 Year Warranty', 4.9),
  ('7" Video Intercom Kit', 'AD-VIP-001', '7-video-intercom-kit', 'video-intercom', 'Hikvision', 'Complete video intercom kit with 7-inch monitor, door camera and two-way audio.',
   'Complete video intercom solution featuring a 7-inch touchscreen monitor, weatherproof door station, night vision camera and two-way audio communication.',
   2100, 1900, 25, true, '1 Year Warranty', 4.6),
  ('Magnetic Door Lock', 'AD-AC-001', 'magnetic-door-lock', 'access-control', 'ZKTeco', '600kg electromagnetic door lock with fail-safe operation for access control systems.',
   'Heavy-duty 600kg magnetic lock suitable for glass and metal doors. Includes mounting brackets and operates fail-safe for emergency exit compliance.',
   750, null, 40, false, '6 Months Warranty', 4.4),
  ('Cat6 Network Cable 305m', 'AD-CAB-001', 'cat6-network-cable-305m', 'cables-accessories', 'Generic', 'High-quality Cat6 UTP network cable, 305m box, for structured cabling and camera runs.',
   'Premium Cat6 UTP cable in a 305m box. Supports gigabit speeds and PoE for IP cameras and access points. Ideal for structured cabling projects.',
   1200, null, 30, false, 'No Warranty', 4.3),
  ('12V 5A Power Supply', 'AD-PWR-001', '12v-5a-power-supply', 'power-supplies', 'Generic', '12V 5A regulated power supply for cameras, locks and access control devices.',
   'Regulated 12V 5A power supply delivering clean, stable power for cameras, electronic locks and intercom systems. Includes overload protection.',
   180, 150, 100, false, '3 Months Warranty', 4.2),
  ('DVR/NVR Wall Mount Bracket', 'AD-ACC-001', 'dvrnvr-wall-mount-bracket', 'security-accessories', 'Generic', 'Heavy-duty wall mounting bracket for DVR/NVR units with ventilation.',
   'Sturdy wall mount bracket for DVR/NVR units, designed with ventilation gaps for heat dissipation and cable management.',
   95, null, 80, false, 'No Warranty', 4.0)
) as p (name, sku, slug, category_slug, brand, short, long, price, sale, stock, featured, warranty, rating)
join product_categories c on c.slug = p.category_slug
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Service categories
-- ----------------------------------------------------------------------------
insert into service_categories (name, slug, description, sort_order) values
  ('Installation', 'installation', 'Professional installation of security and technology systems.', 1),
  ('Maintenance', 'maintenance', 'Scheduled maintenance and preventive care for your systems.', 2),
  ('Repair', 'repair', 'Expert diagnosis and repair of faulty security equipment.', 3),
  ('Consultation', 'consultation', 'Security consultation and system design services.', 4),
  ('IT & Web', 'it-web', 'Networking, IT and web solutions for businesses.', 5)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Services
-- ----------------------------------------------------------------------------
insert into services (name, slug, category_id, icon, short_description, description, features, is_featured, is_active, sort_order)
select s.name, s.slug, c.id, s.icon, s.short, s.long, s.features::jsonb, s.featured, true, s.ord
from (values
  ('CCTV Systems', 'cctv-systems', 'installation', 'video',
   'Professional surveillance systems for homes, offices, shops and businesses.',
   'We design, supply and install complete CCTV surveillance systems tailored to your property. From site inspection and camera selection to cabling, configuration and remote-viewing setup, our certified technicians handle everything.',
   '[{"label":"Site Inspection"},{"label":"System Design"},{"label":"Installation"},{"label":"Configuration"},{"label":"Testing"}]'::text, true, 1),
  ('Network Solutions', 'network-solutions', 'it-web', 'network',
   'Networking infrastructure and connectivity solutions.',
   'Structured cabling, switching, Wi-Fi deployment and network optimization for offices, shops and homes. We build reliable networks that keep your business connected and your security systems online.',
   '[{"label":"Structured Cabling"},{"label":"Switching"},{"label":"Wi-Fi Deployment"},{"label":"Network Optimization"}]'::text, true, 2),
  ('Time Attendance', 'time-attendance', 'installation', 'clock',
   'Biometric attendance and employee management systems.',
   'Fingerprint and face-recognition time attendance systems that eliminate buddy punching and deliver accurate, exportable reports. Perfect for schools, offices and organizations of any size.',
   '[{"label":"Biometric"},{"label":"Face Recognition"},{"label":"Report Export"},{"label":"Staff Training"}]'::text, true, 3),
  ('Video Intercom', 'video-intercom', 'installation', 'door-open',
   'Video communication and entrance monitoring systems.',
   'Video intercom systems for apartments, offices and gated communities. See and speak to visitors before granting access, with optional smartphone integration.',
   '[{"label":"Visitor Verification"},{"label":"Two-Way Audio"},{"label":"Night Vision"},{"label":"Smartphone Integration"}]'::text, true, 4),
  ('Web & IT Solutions', 'web-it-solutions', 'it-web', 'code',
   'Professional websites, IT services and technology solutions.',
   'From business websites and e-commerce platforms to IT consulting and support, we help your business run on reliable technology.',
   '[{"label":"Websites"},{"label":"E-commerce"},{"label":"IT Consulting"},{"label":"Technical Support"}]'::text, true, 5),
  ('Access Control', 'access-control', 'installation', 'shield-check',
   'Door access, biometric access and secure entry systems.',
   'Electronic locks, keypads, card readers and biometric access control that let you manage exactly who enters your premises, and when.',
   '[{"label":"Electronic Locks"},{"label":"Keypad Entry"},{"label":"Card Readers"},{"label":"Biometric Access"}]'::text, true, 6),
  ('CCTV Maintenance', 'cctv-maintenance', 'maintenance', 'wrench',
   'Scheduled maintenance and preventive care for CCTV systems.',
   'Regular cleaning, firmware updates, storage checks and system health reports that keep your surveillance running reliably year-round.',
   '[{"label":"Scheduled Visits"},{"label":"Cleaning & Inspection"},{"label":"Firmware Updates"},{"label":"Health Reports"}]'::text, false, 7),
  ('CCTV Repair', 'cctv-repair', 'repair', 'tool',
   'Expert diagnosis and repair of faulty CCTV equipment.',
   'Fast, reliable repair service for cameras, recorders, power supplies and cabling. We diagnose faults and restore your system quickly.',
   '[{"label":"Diagnosis"},{"label":"Component Repair"},{"label":"Replacement"},{"label":"System Testing"}]'::text, false, 8),
  ('Security Consultation', 'security-consultation', 'consultation', 'shield',
   'Professional security consultation and system design.',
   'Independent advice on the right security for your property. We assess risks, recommend the right equipment and design a system that fits your budget.',
   '[{"label":"Risk Assessment"},{"label":"System Design"},{"label":"Equipment Selection"},{"label":"Budget Planning"}]'::text, false, 9),
  ('System Inspection', 'system-inspection', 'consultation', 'search',
   'On-site inspection and audit of existing security systems.',
   'We audit your existing security setup, identify vulnerabilities and recommend improvements to close the gaps.',
   '[{"label":"On-site Audit"},{"label":"Vulnerability Report"},{"label":"Recommendations"},{"label":"Upgrade Plan"}]'::text, false, 10),
  ('Security System Upgrade', 'security-system-upgrade', 'consultation', 'refresh-cw',
   'Upgrade your existing security system to modern technology.',
   'Migrate from analog to IP, add remote viewing, or expand coverage. We plan and execute smooth upgrades with minimal downtime.',
   '[{"label":"Analog to IP"},{"label":"Remote Viewing"},{"label":"Expansion"},{"label":"Migration Support"}]'::text, false, 11)
) as s (name, slug, category_slug, icon, short, long, features, featured, ord)
join service_categories c on c.slug = s.category_slug
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Testimonials
-- ----------------------------------------------------------------------------
insert into testimonials (name, company, rating, content, is_active, sort_order) values
  ('Abebe Tesfaye', 'Bole Hotel', 5, 'The team installed a full CCTV system for our hotel in two days. The picture quality is excellent and the remote viewing lets me check everything from my phone. Highly professional.', true, 1),
  ('Sara Mohammed', 'Addis Retail Shop', 5, 'We had a break-in last year. After installing AD Security''s cameras and alarm system, our shop has been safe. Their maintenance service is also very responsive.', true, 2),
  ('Daniel Kebede', 'Kebede Import & Export', 5, 'They designed a complete access control and time attendance system for our warehouse. The biometric attendance reports save us hours every month.', true, 3),
  ('Hanna Girma', 'Sunrise School', 4, 'Professional installation and great support. The video intercom system at our school entrance gives us peace of mind.', true, 4),
  ('Michael Tadesse', 'Tadesse Real Estate', 5, 'From consultation to installation, everything was handled professionally. Their team is knowledgeable and the pricing is fair.', true, 5),
  ('Liya Bekele', 'Café Central', 5, 'Fast response, clean installation, and the cameras look great. We can monitor our café from home now. Highly recommended.', true, 6)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- FAQs
-- ----------------------------------------------------------------------------
insert into faqs (category, question, answer, is_active, sort_order) values
  ('Products', 'What CCTV system should I choose?', 'It depends on your property and needs. For homes we usually recommend 4MP IP cameras with an NVR; for larger businesses we may suggest more channels, higher resolution and access control integration. Contact us for a free consultation.', true, 1),
  ('Services', 'Do you provide installation?', 'Yes. Every system we sell can be professionally installed by our certified technicians, including cabling, configuration and remote-viewing setup.', true, 2),
  ('Services', 'Do you provide maintenance?', 'Absolutely. We offer scheduled maintenance plans covering cleaning, firmware updates, storage checks and system health reports.', true, 3),
  ('Services', 'Can you install systems for businesses?', 'Yes, we specialize in commercial installations for offices, shops, hotels, warehouses and schools, including multi-site systems.', true, 4),
  ('Products', 'Do you provide access control?', 'Yes. We supply and install electronic locks, keypads, card readers and biometric access control systems.', true, 5),
  ('Services', 'Do you provide networking services?', 'Yes. We design and install structured cabling, switching, Wi-Fi networks and network optimization for businesses and homes.', true, 6),
  ('Orders', 'How do I track my order?', 'Once you place an order, you can track its status in your customer account under "My Orders". We also send notifications when your order status changes.', true, 7),
  ('Orders', 'What payment methods do you accept?', 'We accept Telebirr, CBE Birr, Chapa and Cash on Delivery. Payment details are confirmed when your order is processed.', true, 8),
  ('Services', 'How do I request a service?', 'You can request a service from the Services page, or contact us directly by phone or the contact form. We will review your request and contact you to schedule.', true, 9)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Gallery (demo images use remote placeholders; admin can replace)
-- ----------------------------------------------------------------------------
insert into gallery (image_url, title, description, category, is_featured, is_active, sort_order) values
  ('https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800&q=60', 'Warehouse CCTV Installation', 'Complete 32-camera CCTV system for a distribution warehouse.', 'CCTV Installation', true, true, 1),
  ('https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=60', 'Office Access Control', 'Biometric access control at a corporate office entrance.', 'Access Control', true, true, 2),
  ('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=60', 'Server & Network Rack', 'Structured networking for a mid-size business.', 'Networking', true, true, 3),
  ('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=60', 'Time Attendance Deployment', 'Face-recognition attendance system for a school.', 'Time Attendance', true, true, 4),
  ('https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=60', 'Video Intercom Setup', 'Video intercom for a residential apartment block.', 'Video Intercom', false, true, 5),
  ('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=60', 'Retail Security Project', 'Surveillance and alarm system for a retail store.', 'Security Projects', true, true, 6),
  ('https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=60', 'Hotel Surveillance', 'Multi-floor CCTV coverage for a boutique hotel.', 'CCTV Installation', false, true, 7),
  ('https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=60', 'Office Network Deployment', 'Full office network and Wi-Fi deployment.', 'Networking', false, true, 8)
on conflict do nothing;

-- ----------------------------------------------------------------------------
-- Navigation (default)
-- ----------------------------------------------------------------------------
insert into navigation_items (label, url, sort_order, is_active) values
  ('Home', '/', 1, true),
  ('Products', '/products', 2, true),
  ('Services', '/services', 3, true),
  ('About', '/about', 4, true),
  ('Gallery', '/gallery', 5, true),
  ('Contact', '/contact', 6, true)
on conflict (label) do nothing;

-- ----------------------------------------------------------------------------
-- Footer sections
-- ----------------------------------------------------------------------------
insert into footer_sections (title, links, sort_order, is_active) values
  ('Quick Links', '[{"label":"Home","url":"/"},{"label":"Products","url":"/products"},{"label":"Services","url":"/services"},{"label":"About Us","url":"/about"},{"label":"Gallery","url":"/gallery"},{"label":"Contact","url":"/contact"}]'::jsonb, 1, true),
  ('Products', '[{"label":"CCTV Cameras","url":"/products?category=cctv-cameras"},{"label":"IP Cameras","url":"/products?category=ip-cameras"},{"label":"DVR & NVR","url":"/products?category=nvr"},{"label":"Time Attendance","url":"/products?category=time-attendance"},{"label":"Video Intercom","url":"/products?category=video-intercom"}]'::jsonb, 2, true),
  ('Services', '[{"label":"CCTV Systems","url":"/services/cctv-systems"},{"label":"Network Solutions","url":"/services/network-solutions"},{"label":"Time Attendance","url":"/services/time-attendance"},{"label":"Video Intercom","url":"/services/video-intercom"},{"label":"Access Control","url":"/services/access-control"}]'::jsonb, 3, true)
on conflict (title) do nothing;

-- ----------------------------------------------------------------------------
-- Social links
-- ----------------------------------------------------------------------------
insert into social_links (platform, username, url, icon, is_active, sort_order) values
  ('Instagram', '@adsecuritycamera', 'https://instagram.com/adsecuritycamera', 'instagram', true, 1),
  ('Telegram', '@adsecuritycamera', 'https://t.me/adsecuritycamera', 'telegram', true, 2),
  ('TikTok', '@adsecuritycamera', 'https://tiktok.com/@adsecuritycamera', 'tiktok', true, 3),
  ('Facebook', '', '', 'facebook', false, 4),
  ('YouTube', '', '', 'youtube', false, 5),
  ('WhatsApp', '', '', 'whatsapp', false, 6),
  ('LinkedIn', '', '', 'linkedin', false, 7)
on conflict (platform) do nothing;

-- ----------------------------------------------------------------------------
-- Website settings (branding, contact, SEO, appearance)
-- ----------------------------------------------------------------------------
insert into website_settings (section, key, value) values
  ('branding', 'company_name', '"AD Security Camera Solution"'),
  ('branding', 'tagline', '"Professional Security & Technology Solutions"'),
  ('branding', 'description', '"AD Security Camera Solution is a professional security and technology company providing CCTV systems, networking, access control, time attendance, video intercom and IT/web solutions with professional installation and reliable support."'),
  ('branding', 'logo_url', '""'),
  ('branding', 'favicon_url', '""'),
  ('branding', 'site_title', '"AD Security Camera Solution"'),
  ('contact', 'email', '"adsecuritycamerasolution@gmail.com"'),
  ('contact', 'phone', '"+251 985 959 697"'),
  ('contact', 'secondary_phone', '"+251 918 109 779"'),
  ('contact', 'address', '"Addis Ababa, Ethiopia"'),
  ('contact', 'working_hours', '"Monday – Saturday: 8:30 AM – 6:30 PM"'),
  ('contact', 'website', '"www.adsecuritycamera.com"'),
  ('seo', 'meta_title', '"AD Security Camera Solution | CCTV, Access Control & Security Systems"'),
  ('seo', 'meta_description', '"Professional security camera installation, CCTV systems, access control, time attendance, video intercom, networking and IT solutions in Ethiopia. Shop security equipment and request professional installation."'),
  ('seo', 'og_title', '"AD Security Camera Solution — Complete Security Solutions"'),
  ('seo', 'og_description', '"Security systems, professional installation and technology solutions for your home and business."'),
  ('seo', 'default_image', '""'),
  ('appearance', 'primary_color', '"#0f766e"'),
  ('appearance', 'secondary_color', '"#1f2937"'),
  ('appearance', 'accent_color', '"#f59e0b"'),
  ('appearance', 'background_color', '"#ffffff"'),
  ('appearance', 'text_color', '"#111827"'),
  ('appearance', 'border_radius', '"12"'),
  ('appearance', 'button_style', '"rounded"')
on conflict (section, key) do nothing;

-- ----------------------------------------------------------------------------
-- Homepage sections
-- ----------------------------------------------------------------------------
insert into homepage_sections (slug, title, content, is_active, sort_order) values
  ('hero', 'Hero',
   '{"heading":"Complete Security Solutions for Your Home & Business","subtitle":"AD Security Camera Solution provides security systems, professional installation and technology solutions you can trust. CCTV, access control, time attendance, video intercom, networking and IT services.","image":"","cta1_label":"Explore Products","cta1_url":"/products","cta2_label":"Request a Service","cta2_url":"/services","badge":"Trusted Security Partner","visible":true}'::jsonb, true, 1),
  ('trust', 'Trust Bar',
   '{"items":[{"label":"Professional Installation","icon":"shield"},{"label":"Quality Equipment","icon":"award"},{"label":"Technical Support","icon":"headphones"},{"label":"Reliable Service","icon":"clock"},{"label":"Security Expertise","icon":"badge-check"}],"visible":true}'::jsonb, true, 2),
  ('services', 'Services',
   '{"title":"Our Services","subtitle":"End-to-end security and technology solutions","visible":true,"show_all":true}'::jsonb, true, 3),
  ('featured_products', 'Featured Products',
   '{"title":"Featured Products","subtitle":"Genuine security equipment with warranty","visible":true,"limit":8}'::jsonb, true, 4),
  ('installation', 'Installation Section',
   '{"heading":"Professional CCTV Installation","subtitle":"From site inspection to system design, installation, configuration, testing and ongoing maintenance — our certified technicians handle your entire security project.","image":"","cta_label":"Book Installation","cta_url":"/services","steps":["Site Inspection","System Design","Installation","Configuration","Testing","Maintenance","Support"],"visible":true}'::jsonb, true, 5),
  ('why_choose_us', 'Why Choose Us',
   '{"title":"Why Choose Us","subtitle":"The trusted choice for security and technology","items":[{"title":"Professional Installation","body":"Certified technicians install every system to the highest standard.","icon":"shield"},{"title":"Quality Security Equipment","body":"We supply genuine equipment from trusted brands with warranty.","icon":"award"},{"title":"Experienced Technical Support","body":"Friendly, knowledgeable support whenever you need it.","icon":"headphones"},{"title":"Reliable Maintenance","body":"Scheduled maintenance keeps your systems running year-round.","icon":"clock"},{"title":"Customized Security Solutions","body":"Every property is different — we design systems around your needs.","icon":"settings"},{"title":"Customer-focused Service","body":"We treat every client like a long-term partner.","icon":"heart"}],"visible":true}'::jsonb, true, 6),
  ('how_it_works', 'How It Works',
   '{"title":"How It Works","subtitle":"Getting protected is simple","steps":[{"title":"Contact Us","body":"Reach out by phone, form or in person."},{"title":"Discuss Your Security Needs","body":"We listen and understand what you need to protect."},{"title":"Site Assessment","body":"We visit your property and assess the risks."},{"title":"Solution & Quote","body":"You receive a clear proposal and fair quote."},{"title":"Installation","body":"Our technicians install and configure your system."},{"title":"Support & Maintenance","body":"We stay with you for the long run."}],"visible":true}'::jsonb, true, 7),
  ('testimonials', 'Testimonials',
   '{"title":"What Our Clients Say","subtitle":"Trusted by homes and businesses across Ethiopia","visible":true,"limit":6}'::jsonb, true, 8),
  ('gallery', 'Gallery Preview',
   '{"title":"Our Recent Projects","subtitle":"Real installations by our team","visible":true,"limit":6,"cta_label":"View Full Gallery","cta_url":"/gallery"}'::jsonb, true, 9),
  ('faq', 'FAQ Preview',
   '{"title":"Frequently Asked Questions","subtitle":"Answers to common questions","visible":true,"limit":5}'::jsonb, true, 10),
  ('final_cta', 'Final CTA',
   '{"heading":"Protect What Matters Most","subtitle":"Get professional security solutions designed for your home or business. Contact us today for a free consultation.","cta1_label":"Request Service","cta1_url":"/services","cta2_label":"Shop Products","cta2_url":"/products","image":"","visible":true}'::jsonb, true, 11)
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- Pages (About, Gallery, FAQ, Contact)
-- ----------------------------------------------------------------------------
insert into pages (slug, title, subtitle, content, meta_title, meta_description, is_active, published_at) values
  ('about', 'About Us', 'A professional security and technology company you can trust.',
   '{"story":"AD Security Camera Solution is a professional security and technology company based in Addis Ababa, Ethiopia. We help homes and businesses protect what matters most through CCTV systems, access control, time attendance, video intercom, networking and IT solutions.","mission":"To provide reliable, high-quality security and technology solutions with professional installation and honest, customer-focused service.","vision":"To be Ethiopia''s most trusted security technology partner, protecting homes and businesses with modern, dependable systems.","values":[{"title":"Integrity","body":"We do what we say and stand behind our work."},{"title":"Quality","body":"We supply genuine equipment and install to the highest standard."},{"title":"Reliability","body":"We are there when you need us — before, during and after installation."},{"title":"Expertise","body":"Our team stays current with the latest security technology."}],"image":"","stats":[{"value":"6+","label":"Years Experience"},{"value":"1200+","label":"Happy Clients"},{"value":"500+","label":"Systems Installed"},{"value":"24/7","label":"Support"}]}'::jsonb,
   'About AD Security Camera Solution', 'Learn about AD Security Camera Solution — a professional security and technology company in Ethiopia.', true, now()),
  ('gallery', 'Gallery', 'Recent projects installed by our team.',
   '{}'::jsonb, 'Project Gallery', 'Browse recent security installation projects by AD Security Camera Solution.', true, now()),
  ('faq', 'FAQ', 'Frequently asked questions about our products and services.',
   '{}'::jsonb, 'Frequently Asked Questions', 'Answers to common questions about CCTV, access control, time attendance and our services.', true, now()),
  ('contact', 'Contact', 'We would love to hear from you.',
   '{}'::jsonb, 'Contact Us', 'Contact AD Security Camera Solution for quotes, service requests and support.', true, now())
on conflict (slug) do nothing;