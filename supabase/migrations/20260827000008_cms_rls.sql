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