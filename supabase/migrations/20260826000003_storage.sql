-- ============================================================================
-- AD SECURITY CAMERA SOLUTIONS — Supabase Storage buckets & policies
-- ============================================================================

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('avatars', 'avatars', true),
  ('company-assets', 'company-assets', true)
on conflict (id) do nothing;

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
