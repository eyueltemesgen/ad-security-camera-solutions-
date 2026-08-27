-- Functional RLS smoke test for the avatars storage bucket (own-folder write).
-- Simulates an authenticated user; verifies they can write to avt/<own>/ and
-- are denied writing to avt/<other>/.

grant usage on schema storage to authenticated;
grant all on storage.objects to authenticated;
grant select on storage.buckets to authenticated;

set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

-- uploadAvatar() uses path = `${userId}/${uuid}.${ext}` (first folder == uid)
-- own-folder insert: must succeed (foldername[1] == auth.uid())
insert into storage.objects (bucket_id, name, owner)
values ('avatars', '11111111-1111-1111-1111-111111111111/pic.png',
        '11111111-1111-1111-1111-111111111111');

-- insert into another user's folder: must be blocked (foldername[1] is other uid)
insert into storage.objects (bucket_id, name, owner)
values ('avatars', '99999999-9999-9999-9999-999999999999/evil.png',
        '99999999-9999-9999-9999-999999999999');

select 'own_write_ok' as av1, count(*) from storage.objects where name like '11111111-1111-1111-1111-111111111111%';