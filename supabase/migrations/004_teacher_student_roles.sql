-- Add the Teacher role while preserving Admin as a legacy privileged role.
-- New public sign-ups remain students. Teacher access must be granted by an
-- existing teacher/admin or through a trusted service-role workflow.

update public.profiles
set role = case
  when lower(coalesce(role, 'student')) = 'admin' then 'admin'
  when lower(coalesce(role, 'student')) = 'teacher' then 'teacher'
  else 'student'
end;

alter table public.profiles
drop constraint if exists profiles_role_check;

alter table public.profiles
add constraint profiles_role_check
check (lower(role) in ('student', 'teacher', 'admin'));

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

-- Prevent a student from granting themselves Teacher through a direct profile
-- insert/update. Service-role operations and current staff remain permitted.
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
    elsif new.role is distinct from old.role and not public.is_lms_admin() then
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

comment on function public.is_lms_admin() is
'Returns true for Teacher and legacy Admin profiles. Used by LMS content RLS policies.';

comment on column public.profiles.role is
'student = read/learn access; teacher/admin = LMS content management access.';
