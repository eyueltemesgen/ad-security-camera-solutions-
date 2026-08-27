-- Functional RLS smoke test for the addresses feature (owner-only CRUD)
-- Simulates an authenticated Supabase user via request.jwt.claim.sub.

-- Supabase grants table privileges to the authenticated role by default.
grant all on public.addresses to authenticated;
grant usage on schema public to authenticated;

-- add shim column the handle_new_user trigger reads (absent in bare postgres shim)
alter table auth.users add column if not exists raw_user_meta_data jsonb;

-- create users -> profiles rows (addresses.user_id -> profiles.id -> users.id)
insert into auth.users (id, email) values
 ('11111111-1111-1111-1111-111111111111','abebe@example.com'),
 ('99999999-9999-9999-9999-999999999999','other@example.com')
on conflict (id) do nothing;
insert into public.profiles (id, email)
values ('11111111-1111-1111-1111-111111111111','abebe@example.com'),
       ('99999999-9999-9999-9999-999999999999','other@example.com')
on conflict (id) do nothing;

set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);

-- user1 insert (must succeed)
insert into public.addresses (user_id, label, full_name, phone, address, city, notes, is_default)
values ('11111111-1111-1111-1111-111111111111','Home','Abebe','+251911','Bole Road','Addis Ababa','',true);

-- user1 must see exactly their own row
select 'owned_rows' as check1, count(*) from public.addresses where user_id = '11111111-1111-1111-1111-111111111111';
select 'home_found' as check2, label, city, is_default from public.addresses where label='Home';

-- insert by a different uid (must be blocked by with check) -> expect 0 rows affected
insert into public.addresses (user_id, label, address, city)
values ('99999999-9999-9999-9999-999999999999','Office','Kirkos','Addis Ababa');
select 'ins_other_rowcount' as check3; -- should be INSERT 0 0

-- user1 update own (must succeed)
update public.addresses set is_default = false where user_id = '11111111-1111-1111-1111-111111111111' and label='Home';
select 'updated' as check4, is_default from public.addresses where label='Home';

-- user1 delete own
delete from public.addresses where user_id='11111111-1111-1111-1111-111111111111' and label='Home';
select 'rows_after_delete' as check5, count(*) from public.addresses where user_id='11111111-1111-1111-1111-111111111111';