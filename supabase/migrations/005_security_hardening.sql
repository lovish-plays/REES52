-- Security hardening for installations that previously ran the legacy root
-- schema scripts. Run this migration before the next production deployment.

alter table public.profiles drop column if exists password_hash;

create or replace function public.is_lms_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and lower(coalesce(profiles.role, 'student')) in ('teacher', 'admin')
  );
$$;

create or replace function public.enforce_profile_role_boundary()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and auth.uid() = new.id then
    if tg_op = 'INSERT' then
      new.role := 'student';
    -- Teachers can manage catalog content, but only an existing admin (or a
    -- service-role migration where auth.uid() is null) may change roles.
    elsif new.role is distinct from old.role
      and lower(coalesce(old.role, 'student')) <> 'admin' then
      new.role := old.role;
    end if;
  end if;
  new.role := lower(coalesce(new.role, 'student'));
  return new;
end;
$$;

drop trigger if exists profiles_enforce_role_boundary on public.profiles;
create trigger profiles_enforce_role_boundary
before insert or update of role on public.profiles
for each row execute function public.enforce_profile_role_boundary();

drop policy if exists "Allow public read profiles" on public.profiles;
drop policy if exists "Allow individual insert profiles" on public.profiles;
drop policy if exists "Allow individual update profiles" on public.profiles;
drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can read matching profiles" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can read their own profile"
on public.profiles for select
using (auth.uid() = id or public.is_lms_admin());

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id or public.is_lms_admin())
with check (auth.uid() = id or public.is_lms_admin());

revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;

-- Remove the public-write policies created by the legacy development script.
drop policy if exists "Allow public write categories" on public.categories;
drop policy if exists "Allow public write products" on public.products;
drop policy if exists "Allow public write ebooks" on public.ebooks;
drop policy if exists "Allow public write videos" on public.videos;
drop policy if exists "Allow public write webinars" on public.webinars;
drop policy if exists "Allow public write notifications" on public.notifications;

drop policy if exists "Admins manage categories" on public.categories;
drop policy if exists "Admins manage products" on public.products;
drop policy if exists "Admins manage ebooks" on public.ebooks;
drop policy if exists "Admins manage videos" on public.videos;
drop policy if exists "Admins manage webinars" on public.webinars;
drop policy if exists "Admins manage notifications" on public.notifications;

create policy "Admins manage categories" on public.categories for all using (public.is_lms_admin()) with check (public.is_lms_admin());
create policy "Admins manage products" on public.products for all using (public.is_lms_admin()) with check (public.is_lms_admin());
create policy "Admins manage ebooks" on public.ebooks for all using (public.is_lms_admin()) with check (public.is_lms_admin());
create policy "Admins manage videos" on public.videos for all using (public.is_lms_admin()) with check (public.is_lms_admin());
create policy "Admins manage webinars" on public.webinars for all using (public.is_lms_admin()) with check (public.is_lms_admin());
create policy "Admins manage notifications" on public.notifications for all using (public.is_lms_admin()) with check (public.is_lms_admin());

grant select on public.categories, public.products, public.ebooks, public.videos, public.webinars, public.notifications to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.ebooks, public.videos, public.webinars, public.notifications to authenticated;
