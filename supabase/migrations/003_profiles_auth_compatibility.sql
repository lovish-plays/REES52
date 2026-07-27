-- Align the LMS profiles table with the fields used by the Next.js app.
-- This migration is additive and safe to run on an existing Supabase project.

alter table public.profiles
  add column if not exists name text,
  add column if not exists enrolled_videos text[] default '{}'::text[],
  add column if not exists purchased_ebooks text[] default '{}'::text[],
  add column if not exists provider text default 'email',
  add column if not exists progress jsonb default '{}'::jsonb,
  add column if not exists badges jsonb default '[]'::jsonb,
  add column if not exists certificates jsonb default '[]'::jsonb,
  add column if not exists streak jsonb default '{"current": 0, "longest": 0, "lastActivityDate": ""}'::jsonb,
  add column if not exists recently_viewed text[] default '{}'::text[];

update public.profiles
set
  name = coalesce(name, full_name, split_part(email, '@', 1), 'Learner'),
  provider = coalesce(provider, 'email'),
  enrolled_videos = coalesce(enrolled_videos, '{}'::text[]),
  purchased_ebooks = coalesce(purchased_ebooks, '{}'::text[]),
  progress = coalesce(progress, '{}'::jsonb),
  badges = coalesce(badges, '[]'::jsonb),
  certificates = coalesce(certificates, '[]'::jsonb),
  streak = coalesce(streak, '{"current": 0, "longest": 0, "lastActivityDate": ""}'::jsonb),
  recently_viewed = coalesce(recently_viewed, '{}'::text[])
where
  name is null
  or provider is null
  or enrolled_videos is null
  or purchased_ebooks is null
  or progress is null
  or badges is null
  or certificates is null
  or streak is null
  or recently_viewed is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.raw_app_meta_data->>'provider', 'email') = 'email' then
    insert into public.profiles (
      id,
      name,
      full_name,
      email,
      role,
      enrolled_videos,
      purchased_ebooks,
      provider
    )
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Learner'),
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Learner'),
      new.email,
      coalesce(new.raw_user_meta_data->>'role', 'Student'),
      '{}'::text[],
      '{}'::text[],
      'email'
    )
    on conflict (id) do update
    set
      name = coalesce(public.profiles.name, excluded.name),
      full_name = coalesce(public.profiles.full_name, excluded.full_name),
      email = coalesce(public.profiles.email, excluded.email),
      provider = coalesce(public.profiles.provider, excluded.provider);
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
