-- REES52 Academy complete Supabase setup.
-- Paste this whole file into Supabase SQL Editor and run it once.
-- It is idempotent: it creates/updates tables, policies, triggers, buckets, and starter data without truncating existing data.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.slugify(input_text text)
returns text
language sql
immutable
as $$
  select nullif(
    trim(both '-' from regexp_replace(lower(coalesce(input_text, '')), '[^a-z0-9]+', '-', 'g')),
    ''
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Auth/profile tables used by AuthContext, onboarding, OAuth callback, dashboard
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  full_name text,
  email text,
  phone text,
  role text default 'student',
  avatar_url text,
  class_level text,
  enrolled_courses text[] default '{}'::text[],
  enrolled_videos text[] default '{}'::text[],
  purchased_ebooks text[] default '{}'::text[],
  provider text default 'email',
  progress jsonb default '{}'::jsonb,
  badges jsonb default '[]'::jsonb,
  certificates jsonb default '[]'::jsonb,
  streak jsonb default '{"current": 0, "longest": 0, "lastActivityDate": ""}'::jsonb,
  recently_viewed text[] default '{}'::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles
  add column if not exists name text,
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists role text default 'student',
  add column if not exists avatar_url text,
  add column if not exists class_level text,
  add column if not exists enrolled_courses text[] default '{}'::text[],
  add column if not exists enrolled_videos text[] default '{}'::text[],
  add column if not exists purchased_ebooks text[] default '{}'::text[],
  add column if not exists provider text default 'email',
  add column if not exists progress jsonb default '{}'::jsonb,
  add column if not exists badges jsonb default '[]'::jsonb,
  add column if not exists certificates jsonb default '[]'::jsonb,
  add column if not exists streak jsonb default '{"current": 0, "longest": 0, "lastActivityDate": ""}'::jsonb,
  add column if not exists recently_viewed text[] default '{}'::text[],
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.profiles
set
  name = coalesce(name, full_name, split_part(email, '@', 1), 'Learner'),
  full_name = coalesce(full_name, name, split_part(email, '@', 1), 'Learner'),
  provider = coalesce(provider, 'email'),
  enrolled_videos = coalesce(enrolled_videos, '{}'::text[]),
  purchased_ebooks = coalesce(purchased_ebooks, '{}'::text[]),
  enrolled_courses = coalesce(enrolled_courses, '{}'::text[]),
  progress = coalesce(progress, '{}'::jsonb),
  badges = coalesce(badges, '[]'::jsonb),
  certificates = coalesce(certificates, '[]'::jsonb),
  streak = coalesce(streak, '{"current": 0, "longest": 0, "lastActivityDate": ""}'::jsonb),
  recently_viewed = coalesce(recently_viewed, '{}'::text[])
where true;

create index if not exists profiles_email_idx on public.profiles(lower(email));
create index if not exists profiles_role_idx on public.profiles(lower(role));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_name text;
  profile_provider text;
begin
  profile_name := coalesce(
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1),
    'Learner'
  );
  profile_provider := coalesce(new.raw_app_meta_data->>'provider', 'email');

  if profile_provider = 'email' then
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
      profile_name,
      profile_name,
      lower(new.email),
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
      provider = coalesce(public.profiles.provider, excluded.provider),
      updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Store/content tables used by src/app/actions/content.ts and admin.ts
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.categories
  add column if not exists slug text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.categories
set slug = coalesce(slug, public.slugify(name), 'category-' || substr(id::text, 1, 8))
where slug is null or slug = '';

drop index if exists public.categories_slug_idx;
create unique index categories_slug_idx on public.categories(slug);

create or replace function public.set_category_defaults()
returns trigger
language plpgsql
as $$
begin
  new.slug := coalesce(nullif(new.slug, ''), public.slugify(new.name), 'category-' || substr(new.id::text, 1, 8));
  return new;
end;
$$;

drop trigger if exists set_category_defaults on public.categories;
create trigger set_category_defaults
  before insert or update on public.categories
  for each row execute function public.set_category_defaults();

drop trigger if exists touch_categories_updated_at on public.categories;
create trigger touch_categories_updated_at
  before update on public.categories
  for each row execute function public.touch_updated_at();

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  external_url text not null,
  image_url text,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products
  add column if not exists external_url text,
  add column if not exists image_url text,
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create index if not exists products_category_idx on public.products(category_id);

drop trigger if exists touch_products_updated_at on public.products;
create trigger touch_products_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  youtube_url text not null,
  category_id uuid references public.categories(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.videos
  add column if not exists youtube_url text,
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists product_id uuid references public.products(id) on delete set null,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create index if not exists videos_category_idx on public.videos(category_id);
create index if not exists videos_product_idx on public.videos(product_id);
create index if not exists videos_created_at_idx on public.videos(created_at desc);

drop trigger if exists touch_videos_updated_at on public.videos;
create trigger touch_videos_updated_at
  before update on public.videos
  for each row execute function public.touch_updated_at();

create table if not exists public.webinars (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  meeting_url text,
  schedule_date timestamptz,
  is_live boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.webinars
  add column if not exists description text,
  add column if not exists meeting_url text,
  add column if not exists schedule_date timestamptz,
  add column if not exists is_live boolean default false,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create index if not exists webinars_schedule_date_idx on public.webinars(schedule_date desc);

drop trigger if exists touch_webinars_updated_at on public.webinars;
create trigger touch_webinars_updated_at
  before update on public.webinars
  for each row execute function public.touch_updated_at();

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  link text,
  created_at timestamptz default now()
);

create index if not exists notifications_created_at_idx on public.notifications(created_at desc);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null default 'anonymous@rees52.tech',
  rating int not null check (rating >= 1 and rating <= 5),
  review text not null,
  created_at timestamptz default now()
);

create index if not exists reviews_created_at_idx on public.reviews(created_at desc);

-- ---------------------------------------------------------------------------
-- LMS tables used by src/lib/lms/data.ts and src/app/actions/lms.ts
-- ---------------------------------------------------------------------------

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  short_description text,
  description text,
  category text,
  class_level text,
  level text,
  duration text,
  thumbnail_url text,
  is_free boolean default true,
  price numeric default 0,
  is_published boolean default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.courses
  add column if not exists slug text,
  add column if not exists short_description text,
  add column if not exists description text,
  add column if not exists category text,
  add column if not exists class_level text,
  add column if not exists level text,
  add column if not exists duration text,
  add column if not exists thumbnail_url text,
  add column if not exists is_free boolean default true,
  add column if not exists price numeric default 0,
  add column if not exists is_published boolean default false,
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.courses
set slug = coalesce(slug, public.slugify(title), 'course-' || substr(id::text, 1, 8))
where slug is null or slug = '';

drop index if exists public.courses_slug_idx;
create unique index courses_slug_idx on public.courses(slug);
create index if not exists courses_published_created_idx on public.courses(is_published, created_at desc);

create or replace function public.set_course_defaults()
returns trigger
language plpgsql
as $$
begin
  new.slug := coalesce(nullif(new.slug, ''), public.slugify(new.title), 'course-' || substr(new.id::text, 1, 8));
  new.level := coalesce(nullif(new.level, ''), 'Beginner');
  new.duration := coalesce(nullif(new.duration, ''), 'Self-paced');
  return new;
end;
$$;

drop trigger if exists set_course_defaults on public.courses;
create trigger set_course_defaults
  before insert or update on public.courses
  for each row execute function public.set_course_defaults();

drop trigger if exists touch_courses_updated_at on public.courses;
create trigger touch_courses_updated_at
  before update on public.courses
  for each row execute function public.touch_updated_at();

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  description text,
  position int default 0,
  is_published boolean default true,
  created_at timestamptz default now()
);

create unique index if not exists course_modules_course_title_idx on public.course_modules(course_id, title);
create index if not exists course_modules_course_position_idx on public.course_modules(course_id, position);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.course_modules(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  slug text,
  lesson_type text default 'video',
  video_url text,
  content text,
  code text,
  pdf_url text,
  duration text,
  position int default 0,
  is_preview boolean default false,
  is_published boolean default true,
  created_at timestamptz default now()
);

alter table public.lessons
  add column if not exists slug text,
  add column if not exists lesson_type text default 'video',
  add column if not exists video_url text,
  add column if not exists content text,
  add column if not exists code text,
  add column if not exists pdf_url text,
  add column if not exists duration text,
  add column if not exists position int default 0,
  add column if not exists is_preview boolean default false,
  add column if not exists is_published boolean default true,
  add column if not exists created_at timestamptz default now();

update public.lessons
set slug = coalesce(slug, public.slugify(title), 'lesson-' || substr(id::text, 1, 8))
where slug is null or slug = '';

drop index if exists public.lessons_course_slug_idx;
create unique index lessons_course_slug_idx on public.lessons(course_id, slug);
create index if not exists lessons_course_position_idx on public.lessons(course_id, position);
create index if not exists lessons_module_position_idx on public.lessons(module_id, position);

create or replace function public.set_lesson_defaults()
returns trigger
language plpgsql
as $$
begin
  new.slug := coalesce(nullif(new.slug, ''), public.slugify(new.title), 'lesson-' || substr(new.id::text, 1, 8));
  new.lesson_type := coalesce(nullif(new.lesson_type, ''), 'video');
  new.duration := coalesce(nullif(new.duration, ''), 'Self-paced');
  return new;
end;
$$;

drop trigger if exists set_lesson_defaults on public.lessons;
create trigger set_lesson_defaults
  before insert or update on public.lessons
  for each row execute function public.set_lesson_defaults();

create table if not exists public.course_outcomes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  outcome text not null,
  position int default 0,
  created_at timestamptz default now()
);

create table if not exists public.course_components (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  component_name text not null,
  quantity int default 1,
  product_url text,
  price numeric,
  component_role text default 'required',
  position int default 0,
  created_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'course_components_role_check'
  ) then
    alter table public.course_components
      add constraint course_components_role_check
      check (component_role in ('required', 'related'));
  end if;
end $$;

create table if not exists public.course_projects (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  project_title text not null,
  position int default 0,
  created_at timestamptz default now()
);

create table if not exists public.course_pdfs (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  file_url text,
  position int default 0,
  created_at timestamptz default now()
);

create table if not exists public.course_faqs (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  question text not null,
  answer text not null,
  position int default 0,
  created_at timestamptz default now()
);

create unique index if not exists course_outcomes_course_position_idx on public.course_outcomes(course_id, position);
create unique index if not exists course_components_course_role_position_idx on public.course_components(course_id, component_role, position);
create unique index if not exists course_projects_course_position_idx on public.course_projects(course_id, position);
create unique index if not exists course_pdfs_course_position_idx on public.course_pdfs(course_id, position);
create unique index if not exists course_faqs_course_position_idx on public.course_faqs(course_id, position);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  short_description text,
  description text,
  category text,
  class_level text,
  level text,
  estimated_time text,
  thumbnail_url text,
  video_url text,
  circuit_diagram_url text,
  source_code text,
  steps text,
  troubleshooting text,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.projects
  add column if not exists slug text,
  add column if not exists short_description text,
  add column if not exists description text,
  add column if not exists category text,
  add column if not exists class_level text,
  add column if not exists level text,
  add column if not exists estimated_time text,
  add column if not exists thumbnail_url text,
  add column if not exists video_url text,
  add column if not exists circuit_diagram_url text,
  add column if not exists source_code text,
  add column if not exists steps text,
  add column if not exists troubleshooting text,
  add column if not exists is_published boolean default false,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.projects
set slug = coalesce(slug, public.slugify(title), 'project-' || substr(id::text, 1, 8))
where slug is null or slug = '';

drop index if exists public.projects_slug_idx;
create unique index projects_slug_idx on public.projects(slug);
create index if not exists projects_published_created_idx on public.projects(is_published, created_at desc);

create or replace function public.set_project_defaults()
returns trigger
language plpgsql
as $$
begin
  new.slug := coalesce(nullif(new.slug, ''), public.slugify(new.title), 'project-' || substr(new.id::text, 1, 8));
  new.level := coalesce(nullif(new.level, ''), 'Beginner');
  new.estimated_time := coalesce(nullif(new.estimated_time, ''), 'Self-paced');
  return new;
end;
$$;

drop trigger if exists set_project_defaults on public.projects;
create trigger set_project_defaults
  before insert or update on public.projects
  for each row execute function public.set_project_defaults();

drop trigger if exists touch_projects_updated_at on public.projects;
create trigger touch_projects_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

create table if not exists public.project_components (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  component_name text not null,
  quantity int default 1,
  product_url text,
  price numeric,
  created_at timestamptz default now()
);

create unique index if not exists project_components_project_component_idx on public.project_components(project_id, component_name);
create index if not exists project_components_project_idx on public.project_components(project_id);

-- Shared table: store pages use pdf_url/category_id/product_id; LMS pages use slug/description/category/cover_url/file_url/is_published.
create table if not exists public.ebooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  description text,
  category text,
  level text,
  cover_url text,
  file_url text,
  pdf_url text,
  category_id uuid references public.categories(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  is_free boolean default true,
  is_published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.ebooks
  add column if not exists slug text,
  add column if not exists description text,
  add column if not exists category text,
  add column if not exists level text,
  add column if not exists cover_url text,
  add column if not exists file_url text,
  add column if not exists pdf_url text,
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists product_id uuid references public.products(id) on delete set null,
  add column if not exists is_free boolean default true,
  add column if not exists is_published boolean default true,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.ebooks e
set
  slug = coalesce(e.slug, public.slugify(e.title), 'ebook-' || substr(e.id::text, 1, 8)),
  file_url = coalesce(e.file_url, e.pdf_url, '#'),
  pdf_url = coalesce(e.pdf_url, e.file_url, '#'),
  category = coalesce(e.category, (select c.name from public.categories c where c.id = e.category_id), 'Arduino Guides'),
  level = coalesce(e.level, 'Beginner'),
  description = coalesce(e.description, 'Downloadable REES52 Academy study material.'),
  cover_url = coalesce(e.cover_url, 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=700&auto=format&fit=crop&q=70'),
  is_free = coalesce(e.is_free, true),
  is_published = coalesce(e.is_published, true)
where true;

drop index if exists public.ebooks_slug_idx;
create unique index ebooks_slug_idx on public.ebooks(slug);
create index if not exists ebooks_category_idx on public.ebooks(category_id);
create index if not exists ebooks_product_idx on public.ebooks(product_id);
create index if not exists ebooks_published_created_idx on public.ebooks(is_published, created_at desc);

create or replace function public.set_ebook_defaults()
returns trigger
language plpgsql
as $$
begin
  new.slug := coalesce(nullif(new.slug, ''), public.slugify(new.title), 'ebook-' || substr(new.id::text, 1, 8));
  new.file_url := coalesce(nullif(new.file_url, ''), nullif(new.pdf_url, ''), '#');
  new.pdf_url := coalesce(nullif(new.pdf_url, ''), nullif(new.file_url, ''), '#');
  new.category := coalesce(
    nullif(new.category, ''),
    (select c.name from public.categories c where c.id = new.category_id),
    'Arduino Guides'
  );
  new.level := coalesce(nullif(new.level, ''), 'Beginner');
  new.description := coalesce(nullif(new.description, ''), 'Downloadable REES52 Academy study material.');
  new.cover_url := coalesce(nullif(new.cover_url, ''), 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=700&auto=format&fit=crop&q=70');
  new.is_free := coalesce(new.is_free, true);
  new.is_published := coalesce(new.is_published, true);
  return new;
end;
$$;

drop trigger if exists set_ebook_defaults on public.ebooks;
create trigger set_ebook_defaults
  before insert or update on public.ebooks
  for each row execute function public.set_ebook_defaults();

drop trigger if exists touch_ebooks_updated_at on public.ebooks;
create trigger touch_ebooks_updated_at
  before update on public.ebooks
  for each row execute function public.touch_updated_at();

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  module_id uuid references public.course_modules(id) on delete cascade,
  title text not null,
  passing_score int default 60,
  created_at timestamptz default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade,
  question text not null,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  correct_option text,
  explanation text,
  position int default 0
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  score int,
  total_questions int,
  passed boolean default false,
  attempted_at timestamptz default now()
);

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  progress_percentage int default 0,
  unique(user_id, course_id)
);

create table if not exists public.student_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  is_completed boolean default false,
  completed_at timestamptz default now(),
  unique(user_id, lesson_id)
);

create table if not exists public.saved_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  saved_at timestamptz default now(),
  unique(user_id, project_id)
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  anonymous_id text,
  event_type text not null,
  event_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create unique index if not exists quizzes_course_title_idx on public.quizzes(course_id, title);
create unique index if not exists quiz_questions_quiz_position_idx on public.quiz_questions(quiz_id, position);
create index if not exists quiz_attempts_user_attempted_idx on public.quiz_attempts(user_id, attempted_at desc);
create index if not exists enrollments_user_course_idx on public.course_enrollments(user_id, course_id);
create index if not exists progress_user_lesson_idx on public.student_progress(user_id, lesson_id);
create index if not exists saved_projects_user_saved_idx on public.saved_projects(user_id, saved_at desc);
create index if not exists analytics_events_type_created_idx on public.analytics_events(event_type, created_at desc);

-- ---------------------------------------------------------------------------
-- Admin helper and RLS
-- ---------------------------------------------------------------------------

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
      and lower(coalesce(profiles.role, 'student')) = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.videos enable row level security;
alter table public.webinars enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.course_outcomes enable row level security;
alter table public.course_components enable row level security;
alter table public.course_projects enable row level security;
alter table public.course_pdfs enable row level security;
alter table public.course_faqs enable row level security;
alter table public.projects enable row level security;
alter table public.project_components enable row level security;
alter table public.ebooks enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.student_progress enable row level security;
alter table public.saved_projects enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists "Users can read matching profiles" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can delete duplicate profiles by email" on public.profiles;

create policy "Users can read matching profiles"
on public.profiles for select
using (
  auth.uid() = id
  or public.is_lms_admin()
  or lower(coalesce(email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id or public.is_lms_admin())
with check (auth.uid() = id or public.is_lms_admin());

create policy "Users can delete duplicate profiles by email"
on public.profiles for delete
using (
  public.is_lms_admin()
  or lower(coalesce(email, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

drop policy if exists "Public read categories" on public.categories;
drop policy if exists "Admins manage categories" on public.categories;
create policy "Public read categories" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Public read products" on public.products;
drop policy if exists "Admins manage products" on public.products;
create policy "Public read products" on public.products for select using (true);
create policy "Admins manage products" on public.products for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Public read videos" on public.videos;
drop policy if exists "Admins manage videos" on public.videos;
create policy "Public read videos" on public.videos for select using (true);
create policy "Admins manage videos" on public.videos for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Public read webinars" on public.webinars;
drop policy if exists "Admins manage webinars" on public.webinars;
create policy "Public read webinars" on public.webinars for select using (true);
create policy "Admins manage webinars" on public.webinars for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Public read notifications" on public.notifications;
drop policy if exists "Admins manage notifications" on public.notifications;
create policy "Public read notifications" on public.notifications for select using (true);
create policy "Admins manage notifications" on public.notifications for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Public read reviews" on public.reviews;
drop policy if exists "Public insert reviews" on public.reviews;
drop policy if exists "Admins manage reviews" on public.reviews;
create policy "Public read reviews" on public.reviews for select using (true);
create policy "Public insert reviews" on public.reviews for insert with check (true);
create policy "Admins manage reviews" on public.reviews for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Published courses can be read publicly" on public.courses;
drop policy if exists "Admins can manage courses" on public.courses;
create policy "Published courses can be read publicly" on public.courses for select using (is_published = true or public.is_lms_admin());
create policy "Admins can manage courses" on public.courses for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Published modules can be read publicly" on public.course_modules;
drop policy if exists "Admins can manage modules" on public.course_modules;
create policy "Published modules can be read publicly"
on public.course_modules for select
using (
  public.is_lms_admin()
  or (
    is_published = true
    and exists (
      select 1 from public.courses
      where courses.id = course_modules.course_id
        and courses.is_published = true
    )
  )
);
create policy "Admins can manage modules" on public.course_modules for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Published lessons can be read publicly" on public.lessons;
drop policy if exists "Admins can manage lessons" on public.lessons;
create policy "Published lessons can be read publicly"
on public.lessons for select
using (
  public.is_lms_admin()
  or (
    is_published = true
    and exists (
      select 1 from public.courses
      where courses.id = lessons.course_id
        and courses.is_published = true
    )
  )
);
create policy "Admins can manage lessons" on public.lessons for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Published course outcomes can be read publicly" on public.course_outcomes;
drop policy if exists "Admins can manage course outcomes" on public.course_outcomes;
create policy "Published course outcomes can be read publicly"
on public.course_outcomes for select
using (
  public.is_lms_admin()
  or exists (
    select 1 from public.courses
    where courses.id = course_outcomes.course_id
      and courses.is_published = true
  )
);
create policy "Admins can manage course outcomes" on public.course_outcomes for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Published course components can be read publicly" on public.course_components;
drop policy if exists "Admins can manage course components" on public.course_components;
create policy "Published course components can be read publicly"
on public.course_components for select
using (
  public.is_lms_admin()
  or exists (
    select 1 from public.courses
    where courses.id = course_components.course_id
      and courses.is_published = true
  )
);
create policy "Admins can manage course components" on public.course_components for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Published course projects can be read publicly" on public.course_projects;
drop policy if exists "Admins can manage course projects" on public.course_projects;
create policy "Published course projects can be read publicly"
on public.course_projects for select
using (
  public.is_lms_admin()
  or exists (
    select 1 from public.courses
    where courses.id = course_projects.course_id
      and courses.is_published = true
  )
);
create policy "Admins can manage course projects" on public.course_projects for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Published course PDFs can be read publicly" on public.course_pdfs;
drop policy if exists "Admins can manage course PDFs" on public.course_pdfs;
create policy "Published course PDFs can be read publicly"
on public.course_pdfs for select
using (
  public.is_lms_admin()
  or exists (
    select 1 from public.courses
    where courses.id = course_pdfs.course_id
      and courses.is_published = true
  )
);
create policy "Admins can manage course PDFs" on public.course_pdfs for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Published course FAQs can be read publicly" on public.course_faqs;
drop policy if exists "Admins can manage course FAQs" on public.course_faqs;
create policy "Published course FAQs can be read publicly"
on public.course_faqs for select
using (
  public.is_lms_admin()
  or exists (
    select 1 from public.courses
    where courses.id = course_faqs.course_id
      and courses.is_published = true
  )
);
create policy "Admins can manage course FAQs" on public.course_faqs for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Published projects can be read publicly" on public.projects;
drop policy if exists "Admins can manage projects" on public.projects;
create policy "Published projects can be read publicly" on public.projects for select using (is_published = true or public.is_lms_admin());
create policy "Admins can manage projects" on public.projects for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Published project components can be read publicly" on public.project_components;
drop policy if exists "Admins can manage project components" on public.project_components;
create policy "Published project components can be read publicly"
on public.project_components for select
using (
  public.is_lms_admin()
  or exists (
    select 1 from public.projects
    where projects.id = project_components.project_id
      and projects.is_published = true
  )
);
create policy "Admins can manage project components" on public.project_components for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Published ebooks can be read publicly" on public.ebooks;
drop policy if exists "Admins can manage ebooks" on public.ebooks;
create policy "Published ebooks can be read publicly" on public.ebooks for select using (coalesce(is_published, true) = true or public.is_lms_admin());
create policy "Admins can manage ebooks" on public.ebooks for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Published course quizzes can be read publicly" on public.quizzes;
drop policy if exists "Admins can manage quizzes" on public.quizzes;
create policy "Published course quizzes can be read publicly"
on public.quizzes for select
using (
  public.is_lms_admin()
  or exists (
    select 1 from public.courses
    where courses.id = quizzes.course_id
      and courses.is_published = true
  )
);
create policy "Admins can manage quizzes" on public.quizzes for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Published quiz questions can be read publicly" on public.quiz_questions;
drop policy if exists "Admins can manage quiz questions" on public.quiz_questions;
create policy "Published quiz questions can be read publicly"
on public.quiz_questions for select
using (
  public.is_lms_admin()
  or exists (
    select 1
    from public.quizzes
    join public.courses on courses.id = quizzes.course_id
    where quizzes.id = quiz_questions.quiz_id
      and courses.is_published = true
  )
);
create policy "Admins can manage quiz questions" on public.quiz_questions for all using (public.is_lms_admin()) with check (public.is_lms_admin());

drop policy if exists "Users can read their own quiz attempts" on public.quiz_attempts;
drop policy if exists "Users can create their own quiz attempts" on public.quiz_attempts;
drop policy if exists "Users can update their own quiz attempts" on public.quiz_attempts;
drop policy if exists "Users can delete their own quiz attempts" on public.quiz_attempts;
create policy "Users can read their own quiz attempts" on public.quiz_attempts for select using (auth.uid() = user_id or public.is_lms_admin());
create policy "Users can create their own quiz attempts" on public.quiz_attempts for insert with check (auth.uid() = user_id);
create policy "Users can update their own quiz attempts" on public.quiz_attempts for update using (auth.uid() = user_id or public.is_lms_admin()) with check (auth.uid() = user_id or public.is_lms_admin());
create policy "Users can delete their own quiz attempts" on public.quiz_attempts for delete using (auth.uid() = user_id or public.is_lms_admin());

drop policy if exists "Users can read their own enrollments" on public.course_enrollments;
drop policy if exists "Users can create their own enrollments" on public.course_enrollments;
drop policy if exists "Users can update their own enrollments" on public.course_enrollments;
drop policy if exists "Users can delete their own enrollments" on public.course_enrollments;
create policy "Users can read their own enrollments" on public.course_enrollments for select using (auth.uid() = user_id or public.is_lms_admin());
create policy "Users can create their own enrollments" on public.course_enrollments for insert with check (auth.uid() = user_id);
create policy "Users can update their own enrollments" on public.course_enrollments for update using (auth.uid() = user_id or public.is_lms_admin()) with check (auth.uid() = user_id or public.is_lms_admin());
create policy "Users can delete their own enrollments" on public.course_enrollments for delete using (auth.uid() = user_id or public.is_lms_admin());

drop policy if exists "Users can read their own progress" on public.student_progress;
drop policy if exists "Users can create their own progress" on public.student_progress;
drop policy if exists "Users can update their own progress" on public.student_progress;
drop policy if exists "Users can delete their own progress" on public.student_progress;
create policy "Users can read their own progress" on public.student_progress for select using (auth.uid() = user_id or public.is_lms_admin());
create policy "Users can create their own progress" on public.student_progress for insert with check (auth.uid() = user_id);
create policy "Users can update their own progress" on public.student_progress for update using (auth.uid() = user_id or public.is_lms_admin()) with check (auth.uid() = user_id or public.is_lms_admin());
create policy "Users can delete their own progress" on public.student_progress for delete using (auth.uid() = user_id or public.is_lms_admin());

drop policy if exists "Users can read their own saved projects" on public.saved_projects;
drop policy if exists "Users can create their own saved projects" on public.saved_projects;
drop policy if exists "Users can update their own saved projects" on public.saved_projects;
drop policy if exists "Users can delete their own saved projects" on public.saved_projects;
create policy "Users can read their own saved projects" on public.saved_projects for select using (auth.uid() = user_id or public.is_lms_admin());
create policy "Users can create their own saved projects" on public.saved_projects for insert with check (auth.uid() = user_id);
create policy "Users can update their own saved projects" on public.saved_projects for update using (auth.uid() = user_id or public.is_lms_admin()) with check (auth.uid() = user_id or public.is_lms_admin());
create policy "Users can delete their own saved projects" on public.saved_projects for delete using (auth.uid() = user_id or public.is_lms_admin());

drop policy if exists "Users can insert analytics events" on public.analytics_events;
drop policy if exists "Admins can read analytics events" on public.analytics_events;
create policy "Users can insert analytics events" on public.analytics_events for insert with check (auth.uid() = user_id or user_id is null);
create policy "Admins can read analytics events" on public.analytics_events for select using (public.is_lms_admin());

-- Grants for Supabase API roles.
grant usage on schema public to anon, authenticated;
grant select on
  public.categories,
  public.products,
  public.videos,
  public.webinars,
  public.notifications,
  public.reviews,
  public.courses,
  public.course_modules,
  public.lessons,
  public.course_outcomes,
  public.course_components,
  public.course_projects,
  public.course_pdfs,
  public.course_faqs,
  public.projects,
  public.project_components,
  public.ebooks,
  public.quizzes,
  public.quiz_questions
to anon, authenticated;

grant insert on public.reviews to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.is_lms_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage buckets used by thumbnails, PDFs, ebooks, diagrams, and avatars
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('course-thumbnails', 'course-thumbnails', true),
  ('lesson-pdfs', 'lesson-pdfs', true),
  ('ebook-files', 'ebook-files', true),
  ('ebook-covers', 'ebook-covers', true),
  ('project-images', 'project-images', true),
  ('project-circuit-diagrams', 'project-circuit-diagrams', true),
  ('profile-avatars', 'profile-avatars', true)
on conflict (id) do update set
  public = excluded.public;

drop policy if exists "Public read REES52 academy files" on storage.objects;
drop policy if exists "Admins upload REES52 academy files" on storage.objects;
drop policy if exists "Admins update REES52 academy files" on storage.objects;
drop policy if exists "Admins delete REES52 academy files" on storage.objects;

create policy "Public read REES52 academy files"
on storage.objects for select
using (
  bucket_id in (
    'course-thumbnails',
    'lesson-pdfs',
    'ebook-files',
    'ebook-covers',
    'project-images',
    'project-circuit-diagrams',
    'profile-avatars'
  )
);

create policy "Admins upload REES52 academy files"
on storage.objects for insert
with check (
  public.is_lms_admin()
  and bucket_id in (
    'course-thumbnails',
    'lesson-pdfs',
    'ebook-files',
    'ebook-covers',
    'project-images',
    'project-circuit-diagrams',
    'profile-avatars'
  )
);

create policy "Admins update REES52 academy files"
on storage.objects for update
using (public.is_lms_admin())
with check (public.is_lms_admin());

create policy "Admins delete REES52 academy files"
on storage.objects for delete
using (public.is_lms_admin());

-- ---------------------------------------------------------------------------
-- Starter data that matches src/lib/uuidHelper.ts mappings and current pages.
-- ---------------------------------------------------------------------------

insert into public.categories (id, name, slug) values
  ('11111111-1111-1111-1111-111111111111', 'Robotics & Smart Cars', 'robotics-smart-cars'),
  ('11111111-1111-1111-1111-111111111112', 'Arduino & Microcontrollers', 'arduino-microcontrollers'),
  ('11111111-1111-1111-1111-111111111113', 'IoT & Sensors', 'iot-sensors'),
  ('11111111-1111-1111-1111-111111111114', 'Drones & Quadcopters', 'drones-quadcopters')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug;

insert into public.products (id, name, external_url, image_url, category_id) values
  ('22222222-2222-2222-2222-222222222221', 'REES52 Uno R3 Starter Kit', 'https://rees52.com/microcontroller/123-rees52-uno-r3-starter-kit.html', 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=600&auto=format&fit=crop&q=60', '11111111-1111-1111-1111-111111111112'),
  ('22222222-2222-2222-2222-222222222222', 'REES52 4WD Smart Robot Car Kit v2.0', 'https://rees52.com/robotics/456-rees52-4wd-smart-robot-car-kit.html', 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=600&auto=format&fit=crop&q=60', '11111111-1111-1111-1111-111111111111'),
  ('22222222-2222-2222-2222-222222222223', 'REES52 Ultimate Sensor Kit (37 in 1)', 'https://rees52.com/sensors/789-rees52-ultimate-sensor-kit.html', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60', '11111111-1111-1111-1111-111111111113'),
  ('22222222-2222-2222-2222-222222222224', 'REES52 F450 Drone DIY Builder Kit', 'https://rees52.com/drones/101-rees52-f450-drone-diy-kit.html', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=600&auto=format&fit=crop&q=60', '11111111-1111-1111-1111-111111111114')
on conflict (id) do update set
  name = excluded.name,
  external_url = excluded.external_url,
  image_url = excluded.image_url,
  category_id = excluded.category_id;

insert into public.videos (id, title, youtube_url, category_id, product_id, created_at) values
  ('44444444-4444-4444-4444-444444444441', 'Arduino Uno Setup and Blink Tutorial', 'https://www.youtube.com/watch?v=d8_xXNcGYgo', '11111111-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222221', '2026-05-11T09:00:00Z'),
  ('44444444-4444-4444-4444-444444444442', 'Assembling your 4WD Smart Robot Car Step-by-Step', 'https://www.youtube.com/watch?v=hBwslH_Wn4I', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '2026-05-13T14:20:00Z'),
  ('44444444-4444-4444-4444-444444444443', 'Interfacing Temperature Sensor DHT11 with Arduino', 'https://www.youtube.com/watch?v=yG0-nle3rO8', '11111111-1111-1111-1111-111111111113', '22222222-2222-2222-2222-222222222223', '2026-05-16T11:00:00Z')
on conflict (id) do update set
  title = excluded.title,
  youtube_url = excluded.youtube_url,
  category_id = excluded.category_id,
  product_id = excluded.product_id;

insert into public.webinars (id, title, description, meeting_url, schedule_date, is_live) values
  ('55555555-5555-5555-5555-555555555551', 'Live Arduino Starter Workshop', 'A beginner-friendly live session for Arduino setup, wiring, and first sketches.', 'https://meet.google.com/rees52-arduino', '2026-08-10T11:00:00Z', false),
  ('55555555-5555-5555-5555-555555555552', 'Robotics Project Q&A', 'Bring your robot build questions and get guidance from the REES52 Academy team.', 'https://meet.google.com/rees52-robotics', '2026-08-17T11:00:00Z', false)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  meeting_url = excluded.meeting_url,
  schedule_date = excluded.schedule_date,
  is_live = excluded.is_live;

insert into public.ebooks (
  id,
  title,
  slug,
  description,
  category,
  level,
  cover_url,
  file_url,
  pdf_url,
  category_id,
  product_id,
  is_free,
  is_published,
  created_at
) values
  ('33333333-3333-3333-3333-333333333331', 'Getting Started with Arduino Uno R3', 'getting-started-with-arduino-uno-r3', 'A quick PDF guide for Arduino boards, pins, wiring, and first sketches.', 'Arduino Guides', 'Beginner', 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=700&auto=format&fit=crop&q=70', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '11111111-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222221', true, true, '2026-05-10T10:00:00Z'),
  ('33333333-3333-3333-3333-333333333332', 'DIY 4WD Smart Car Building Guide', 'diy-4wd-smart-car-building-guide', 'Classroom-ready notes for robot chassis, motors, sensors, and testing.', 'Robotics Manuals', 'Beginner', 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=700&auto=format&fit=crop&q=70', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', true, true, '2026-05-12T12:00:00Z'),
  ('33333333-3333-3333-3333-333333333333', 'Comprehensive Sensors Handbook 37-in-1', 'comprehensive-sensors-handbook-37-in-1', 'A practical sensor reference for Arduino, ESP32, robotics, and IoT labs.', 'Sensor Guides', 'Beginner', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&auto=format&fit=crop&q=70', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '11111111-1111-1111-1111-111111111113', '22222222-2222-2222-2222-222222222223', true, true, '2026-05-15T08:30:00Z')
on conflict (id) do update set
  title = excluded.title,
  slug = excluded.slug,
  description = excluded.description,
  category = excluded.category,
  level = excluded.level,
  cover_url = excluded.cover_url,
  file_url = excluded.file_url,
  pdf_url = excluded.pdf_url,
  category_id = excluded.category_id,
  product_id = excluded.product_id,
  is_free = excluded.is_free,
  is_published = excluded.is_published;

insert into public.courses (
  title,
  slug,
  short_description,
  description,
  category,
  class_level,
  level,
  duration,
  thumbnail_url,
  is_free,
  price,
  is_published
) values
  ('Arduino Beginner Course', 'arduino-beginner-course', 'Start electronics with Arduino boards, outputs, sensors, and one complete distance alert project.', 'A beginner-friendly course for students and makers who want to learn Arduino through practical circuits, simple code, and real REES52 components.', 'Arduino', 'Class 3', 'Beginner', '6 hours', 'https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=900&auto=format&fit=crop&q=70', true, 0, true),
  ('ESP32 IoT Course', 'esp32-iot-course', 'Learn Wi-Fi enabled electronics with sensor data, web dashboards, and automation basics.', 'A practical IoT course covering ESP32 setup, Wi-Fi, sensor readings, and simple cloud-ready project patterns.', 'IoT', 'Class 8', 'Intermediate', '8 hours', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&auto=format&fit=crop&q=70', false, 999, true),
  ('Robotics Starter Course', 'robotics-starter-course', 'Build wheeled robots with motors, drivers, sensors, and movement logic.', 'A project-based introduction to robot chassis assembly, motor control, and obstacle decisions.', 'Robotics', 'Class 5', 'Beginner', '7 hours', 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=900&auto=format&fit=crop&q=70', true, 0, true)
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  category = excluded.category,
  class_level = excluded.class_level,
  level = excluded.level,
  duration = excluded.duration,
  thumbnail_url = excluded.thumbnail_url,
  is_free = excluded.is_free,
  price = excluded.price,
  is_published = excluded.is_published,
  updated_at = now();

with c as (
  select id from public.courses where slug = 'arduino-beginner-course'
)
insert into public.course_outcomes (course_id, outcome, position)
select c.id, v.outcome, v.position
from c
cross join (
  values
    ('Understand Arduino boards and the Arduino IDE', 1),
    ('Control LEDs, buzzers, and RGB output devices', 2),
    ('Read IR, ultrasonic, and LDR sensors', 3),
    ('Build a smart distance alert system', 4)
) as v(outcome, position)
on conflict (course_id, position) do update set outcome = excluded.outcome;

with c as (
  select id from public.courses where slug = 'arduino-beginner-course'
)
insert into public.course_components (course_id, component_name, quantity, product_url, component_role, position)
select c.id, v.component_name, v.quantity, v.product_url, v.component_role, v.position
from c
cross join (
  values
    ('Arduino Uno R3', 1, 'https://rees52.com/search?s=Arduino+Uno+R3', 'required', 1),
    ('Ultrasonic Sensor HC-SR04', 1, 'https://rees52.com/search?s=HC-SR04', 'required', 2),
    ('LED Pack', 1, 'https://rees52.com/search?s=LED', 'required', 3),
    ('Buzzer', 1, 'https://rees52.com/search?s=Buzzer', 'required', 4),
    ('REES52 Uno R3 Starter Kit', 1, 'https://rees52.com/microcontroller/123-rees52-uno-r3-starter-kit.html', 'related', 1)
) as v(component_name, quantity, product_url, component_role, position)
on conflict (course_id, component_role, position) do update set
  component_name = excluded.component_name,
  quantity = excluded.quantity,
  product_url = excluded.product_url;

with c as (
  select id from public.courses where slug = 'arduino-beginner-course'
)
insert into public.course_projects (course_id, project_title, position)
select c.id, v.project_title, v.position
from c
cross join (
  values
    ('Smart Distance Alert System', 1),
    ('Mini Light Alert', 2)
) as v(project_title, position)
on conflict (course_id, position) do update set project_title = excluded.project_title;

with c as (
  select id from public.courses where slug = 'arduino-beginner-course'
)
insert into public.course_pdfs (course_id, title, file_url, position)
select c.id, v.title, v.file_url, v.position
from c
cross join (
  values
    ('Arduino pinout guide', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 1),
    ('Starter wiring reference', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 2)
) as v(title, file_url, position)
on conflict (course_id, position) do update set
  title = excluded.title,
  file_url = excluded.file_url;

with c as (
  select id from public.courses where slug = 'arduino-beginner-course'
)
insert into public.course_faqs (course_id, question, answer, position)
select c.id, v.question, v.answer, v.position
from c
cross join (
  values
    ('Do I need prior coding experience?', 'No. The course starts from wiring basics and simple Arduino sketches.', 1),
    ('Can schools use this course?', 'Yes. The modules work well for STEM labs, ATL labs, and classroom demonstrations.', 2)
) as v(question, answer, position)
on conflict (course_id, position) do update set
  question = excluded.question,
  answer = excluded.answer;

with c as (
  select id from public.courses where slug = 'arduino-beginner-course'
),
m1 as (
  insert into public.course_modules (course_id, title, description, position, is_published)
  select c.id, 'Module 1: Introduction to Arduino', 'Get comfortable with the board, software, and first upload.', 1, true
  from c
  on conflict (course_id, title) do update set
    description = excluded.description,
    position = excluded.position,
    is_published = excluded.is_published
  returning id, course_id
),
m2 as (
  insert into public.course_modules (course_id, title, description, position, is_published)
  select c.id, 'Module 2: Basic Output Devices', 'Control common output devices used in beginner robotics builds.', 2, true
  from c
  on conflict (course_id, title) do update set
    description = excluded.description,
    position = excluded.position,
    is_published = excluded.is_published
  returning id, course_id
),
m3 as (
  insert into public.course_modules (course_id, title, description, position, is_published)
  select c.id, 'Module 3: Sensors', 'Read real-world inputs and convert them into decisions.', 3, true
  from c
  on conflict (course_id, title) do update set
    description = excluded.description,
    position = excluded.position,
    is_published = excluded.is_published
  returning id, course_id
)
insert into public.lessons (
  module_id,
  course_id,
  title,
  slug,
  lesson_type,
  video_url,
  content,
  code,
  pdf_url,
  duration,
  position,
  is_preview,
  is_published
)
select *
from (
  select m1.id, m1.course_id, 'What is Arduino?', 'what-is-arduino', 'video', 'https://www.youtube.com/embed/d8_xXNcGYgo',
    'Arduino is an open hardware platform used to read sensors and control outputs. In this lesson you will understand where Arduino fits inside robotics, IoT, and classroom STEM projects.',
    null::text, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '18 min', 1, true, true
  from m1
  union all
  select m1.id, m1.course_id, 'Arduino IDE Setup', 'arduino-ide-setup', 'text', null,
    'Install the Arduino IDE, select the board and port, and upload your first sketch. Keep the serial monitor ready for sensor lessons.',
    'void setup() {' || chr(10) || '  Serial.begin(9600);' || chr(10) || '}' || chr(10) || chr(10) || 'void loop() {' || chr(10) || '  Serial.println(''REES52 Academy ready'');' || chr(10) || '  delay(1000);' || chr(10) || '}',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '25 min', 2, false, true
  from m1
  union all
  select m2.id, m2.course_id, 'LED Blinking', 'led-blinking', 'video', null,
    'Wire an LED with a resistor and control it using a digital pin. This is the classic first step into embedded output control.',
    'const int ledPin = 13;' || chr(10) || chr(10) || 'void setup() {' || chr(10) || '  pinMode(ledPin, OUTPUT);' || chr(10) || '}' || chr(10) || chr(10) || 'void loop() {' || chr(10) || '  digitalWrite(ledPin, HIGH);' || chr(10) || '  delay(500);' || chr(10) || '  digitalWrite(ledPin, LOW);' || chr(10) || '  delay(500);' || chr(10) || '}',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '28 min', 1, false, true
  from m2
  union all
  select m3.id, m3.course_id, 'Ultrasonic Sensor', 'ultrasonic-sensor', 'video', null,
    'Measure distance with an ultrasonic sensor and use the result to trigger an LED or buzzer.',
    'const int trigPin = 9;' || chr(10) || 'const int echoPin = 10;' || chr(10) || chr(10) || 'void setup() {' || chr(10) || '  Serial.begin(9600);' || chr(10) || '  pinMode(trigPin, OUTPUT);' || chr(10) || '  pinMode(echoPin, INPUT);' || chr(10) || '}',
    null::text, '32 min', 1, false, true
  from m3
) as lesson_rows(module_id, course_id, title, slug, lesson_type, video_url, content, code, pdf_url, duration, position, is_preview, is_published)
on conflict (course_id, slug) do update set
  module_id = excluded.module_id,
  title = excluded.title,
  lesson_type = excluded.lesson_type,
  video_url = excluded.video_url,
  content = excluded.content,
  code = excluded.code,
  pdf_url = excluded.pdf_url,
  duration = excluded.duration,
  position = excluded.position,
  is_preview = excluded.is_preview,
  is_published = excluded.is_published;

insert into public.projects (
  title,
  slug,
  short_description,
  description,
  category,
  class_level,
  level,
  estimated_time,
  thumbnail_url,
  source_code,
  steps,
  troubleshooting,
  is_published
) values
  ('Line Follower Robot', 'line-follower-robot', 'Build a robot that follows a black line using IR sensors and motor logic.', 'A classic robotics project for learning sensor feedback, motor direction, and calibration.', 'Robotics Projects', 'Class 5', 'Beginner', '3 hours', 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=900&auto=format&fit=crop&q=70', 'if (leftSensor == LOW && rightSensor == HIGH) {' || chr(10) || '  turnLeft();' || chr(10) || '} else if (leftSensor == HIGH && rightSensor == LOW) {' || chr(10) || '  turnRight();' || chr(10) || '} else {' || chr(10) || '  moveForward();' || chr(10) || '}', 'Assemble chassis' || chr(10) || 'Mount IR sensors' || chr(10) || 'Wire motor driver' || chr(10) || 'Upload code' || chr(10) || 'Calibrate sensor height', 'If the robot spins, swap motor wires.' || chr(10) || 'If sensors fail, check line contrast and sensor height.', true),
  ('Obstacle Avoiding Robot', 'obstacle-avoiding-robot', 'Use ultrasonic sensing to detect obstacles and steer away automatically.', 'Combine a chassis, motor driver, ultrasonic sensor, and Arduino logic into a moving robot.', 'Robotics Projects', 'Class 6', 'Beginner', '4 hours', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=900&auto=format&fit=crop&q=70', 'if (distance < 20) {' || chr(10) || '  stopMotors();' || chr(10) || '  turnRight();' || chr(10) || '} else {' || chr(10) || '  moveForward();' || chr(10) || '}', 'Build chassis' || chr(10) || 'Mount ultrasonic sensor' || chr(10) || 'Wire motors' || chr(10) || 'Upload movement code' || chr(10) || 'Test obstacle response', 'Use a stable battery pack.' || chr(10) || 'Keep sensor wires short and firm.', true),
  ('IoT Weather Station', 'iot-weather-station', 'Read temperature and humidity and prepare the data for an IoT dashboard.', 'A practical ESP32 project for collecting environmental data and displaying it online.', 'IoT Projects', 'Class 8', 'Intermediate', '5 hours', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&auto=format&fit=crop&q=70', 'float temperature = dht.readTemperature();' || chr(10) || 'float humidity = dht.readHumidity();' || chr(10) || 'Serial.println(temperature);', 'Wire DHT sensor' || chr(10) || 'Configure ESP32 Wi-Fi' || chr(10) || 'Read sensor data' || chr(10) || 'Send readings to dashboard', 'Use correct DHT library.' || chr(10) || 'Check Wi-Fi SSID and password.', true)
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  category = excluded.category,
  class_level = excluded.class_level,
  level = excluded.level,
  estimated_time = excluded.estimated_time,
  thumbnail_url = excluded.thumbnail_url,
  source_code = excluded.source_code,
  steps = excluded.steps,
  troubleshooting = excluded.troubleshooting,
  is_published = excluded.is_published;

with p as (
  select id from public.projects where slug = 'line-follower-robot'
)
insert into public.project_components (project_id, component_name, quantity, product_url)
select p.id, v.component_name, v.quantity, v.product_url
from p
cross join (
  values
    ('Robot Car Chassis', 1, 'https://rees52.com/search?s=Robot+Car+Chassis'),
    ('IR Sensor Module', 2, 'https://rees52.com/search?s=IR+Sensor'),
    ('L298N Motor Driver', 1, 'https://rees52.com/search?s=L298N')
) as v(component_name, quantity, product_url)
on conflict (project_id, component_name) do update set
  quantity = excluded.quantity,
  product_url = excluded.product_url;

with p as (
  select id from public.projects where slug = 'obstacle-avoiding-robot'
)
insert into public.project_components (project_id, component_name, quantity, product_url)
select p.id, v.component_name, v.quantity, v.product_url
from p
cross join (
  values
    ('Ultrasonic Sensor HC-SR04', 1, 'https://rees52.com/search?s=HC-SR04'),
    ('Arduino Uno R3', 1, 'https://rees52.com/search?s=Arduino+Uno'),
    ('Motor Driver Module', 1, 'https://rees52.com/search?s=Motor+Driver')
) as v(component_name, quantity, product_url)
on conflict (project_id, component_name) do update set
  quantity = excluded.quantity,
  product_url = excluded.product_url;

with c as (
  select id from public.courses where slug = 'arduino-beginner-course'
),
m as (
  select id from public.course_modules
  where course_id = (select id from c)
    and title = 'Module 1: Introduction to Arduino'
),
q as (
  insert into public.quizzes (course_id, module_id, title, passing_score)
  select c.id, m.id, 'Arduino Basics Quiz', 60
  from c, m
  on conflict (course_id, title) do update set
    module_id = excluded.module_id,
    passing_score = excluded.passing_score
  returning id
)
insert into public.quiz_questions (
  quiz_id,
  question,
  option_a,
  option_b,
  option_c,
  option_d,
  correct_option,
  explanation,
  position
)
select q.id, v.question, v.option_a, v.option_b, v.option_c, v.option_d, v.correct_option, v.explanation, v.position
from q
cross join (
  values
    ('What is Arduino commonly used for?', 'Only video editing', 'Reading sensors and controlling outputs', 'Making spreadsheets', 'Charging batteries only', 'B', 'Arduino is commonly used to read sensors and control output devices.', 1),
    ('Which software is used to upload sketches?', 'Arduino IDE', 'Photoshop', 'Excel', 'VLC', 'A', 'Arduino IDE is used to write and upload sketches.', 2),
    ('Which sensor can measure distance?', 'LDR', 'HC-SR04 ultrasonic sensor', 'Buzzer', 'LED', 'B', 'The HC-SR04 ultrasonic sensor measures distance.', 3)
) as v(question, option_a, option_b, option_c, option_d, correct_option, explanation, position)
on conflict (quiz_id, position) do update set
  question = excluded.question,
  option_a = excluded.option_a,
  option_b = excluded.option_b,
  option_c = excluded.option_c,
  option_d = excluded.option_d,
  correct_option = excluded.correct_option,
  explanation = excluded.explanation;

insert into public.notifications (message, link)
select 'Welcome to REES52 Academy. Courses, projects, ebooks, and dashboards are ready.', '/courses'
where not exists (
  select 1 from public.notifications
  where message = 'Welcome to REES52 Academy. Courses, projects, ebooks, and dashboards are ready.'
);

-- Student/course/project school-class categories.
alter table public.profiles drop constraint if exists profiles_class_level_check;
alter table public.profiles add constraint profiles_class_level_check
  check (class_level is null or class_level in ('Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'));
alter table public.courses drop constraint if exists courses_class_level_check;
alter table public.courses add constraint courses_class_level_check
  check (class_level is null or class_level in ('Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'));
alter table public.projects drop constraint if exists projects_class_level_check;
alter table public.projects add constraint projects_class_level_check
  check (class_level is null or class_level in ('Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12'));

-- After your first signup, make yourself admin by running this with your real email:
-- update public.profiles set role = 'admin' where lower(email) = lower('you@example.com');
