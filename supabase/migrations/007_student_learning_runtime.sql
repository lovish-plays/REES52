-- Student profile and runtime learning fields.
-- Existing installations can apply this migration without resetting content.

alter table public.profiles
  add column if not exists class_level text;

alter table public.profiles
  add column if not exists enrolled_courses text[] not null default '{}';

alter table public.profiles
  drop constraint if exists profiles_class_level_check;

alter table public.profiles
  add constraint profiles_class_level_check
  check (class_level is null or class_level in (
    'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8',
    'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ));

create index if not exists profiles_class_level_idx on public.profiles(class_level);
