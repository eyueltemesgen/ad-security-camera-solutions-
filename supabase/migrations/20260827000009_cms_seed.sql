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