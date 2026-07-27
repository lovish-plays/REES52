create extension if not exists pgcrypto;

-- REES52 Academy LMS schema.
-- Video hosting note: do not upload large videos to Supabase Storage. Store YouTube
-- unlisted, Vimeo, Bunny Stream, or similar URLs in lessons.video_url and projects.video_url.
-- Recommended storage buckets:
-- course-thumbnails
-- lesson-pdfs
-- ebook-files
-- ebook-covers
-- project-images
-- project-circuit-diagrams
-- profile-avatars

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text default 'student',
  avatar_url text,
  created_at timestamp with time zone default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  short_description text,
  description text,
  category text,
  level text,
  duration text,
  thumbnail_url text,
  is_free boolean default true,
  price numeric default 0,
  is_published boolean default false,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  description text,
  position int default 0,
  is_published boolean default true,
  created_at timestamp with time zone default now()
);

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
  position int default 0,
  is_preview boolean default false,
  is_published boolean default true,
  created_at timestamp with time zone default now()
);

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  enrolled_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  progress_percentage int default 0,
  unique(user_id, course_id)
);

create table if not exists public.student_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  is_completed boolean default false,
  completed_at timestamp with time zone default now(),
  unique(user_id, lesson_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  short_description text,
  description text,
  category text,
  level text,
  estimated_time text,
  thumbnail_url text,
  video_url text,
  circuit_diagram_url text,
  source_code text,
  steps text,
  troubleshooting text,
  is_published boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.project_components (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  component_name text not null,
  quantity int default 1,
  product_url text,
  price numeric,
  created_at timestamp with time zone default now()
);

create table if not exists public.ebooks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  category text,
  level text,
  cover_url text,
  file_url text,
  is_free boolean default true,
  is_published boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  module_id uuid references public.course_modules(id) on delete cascade,
  title text not null,
  passing_score int default 60,
  created_at timestamp with time zone default now()
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
  attempted_at timestamp with time zone default now()
);

create table if not exists public.saved_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  saved_at timestamp with time zone default now(),
  unique(user_id, project_id)
);

create index if not exists courses_slug_idx on public.courses(slug);
create index if not exists course_modules_course_position_idx on public.course_modules(course_id, position);
create index if not exists lessons_course_position_idx on public.lessons(course_id, position);
create index if not exists projects_slug_idx on public.projects(slug);
create index if not exists ebooks_slug_idx on public.ebooks(slug);
create index if not exists enrollments_user_course_idx on public.course_enrollments(user_id, course_id);
create index if not exists progress_user_lesson_idx on public.student_progress(user_id, lesson_id);

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
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.student_progress enable row level security;
alter table public.projects enable row level security;
alter table public.project_components enable row level security;
alter table public.ebooks enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.saved_projects enable row level security;

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

create policy "Admins can delete profiles"
on public.profiles for delete
using (public.is_lms_admin());

create policy "Published courses can be read publicly"
on public.courses for select
using (is_published = true or public.is_lms_admin());

create policy "Admins can manage courses"
on public.courses for all
using (public.is_lms_admin())
with check (public.is_lms_admin());

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

create policy "Admins can manage modules"
on public.course_modules for all
using (public.is_lms_admin())
with check (public.is_lms_admin());

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

create policy "Admins can manage lessons"
on public.lessons for all
using (public.is_lms_admin())
with check (public.is_lms_admin());

create policy "Users can read their own enrollments"
on public.course_enrollments for select
using (auth.uid() = user_id or public.is_lms_admin());

create policy "Users can create their own enrollments"
on public.course_enrollments for insert
with check (auth.uid() = user_id);

create policy "Users can update their own enrollments"
on public.course_enrollments for update
using (auth.uid() = user_id or public.is_lms_admin())
with check (auth.uid() = user_id or public.is_lms_admin());

create policy "Users can delete their own enrollments"
on public.course_enrollments for delete
using (auth.uid() = user_id or public.is_lms_admin());

create policy "Users can read their own progress"
on public.student_progress for select
using (auth.uid() = user_id or public.is_lms_admin());

create policy "Users can create their own progress"
on public.student_progress for insert
with check (auth.uid() = user_id);

create policy "Users can update their own progress"
on public.student_progress for update
using (auth.uid() = user_id or public.is_lms_admin())
with check (auth.uid() = user_id or public.is_lms_admin());

create policy "Users can delete their own progress"
on public.student_progress for delete
using (auth.uid() = user_id or public.is_lms_admin());

create policy "Published projects can be read publicly"
on public.projects for select
using (is_published = true or public.is_lms_admin());

create policy "Admins can manage projects"
on public.projects for all
using (public.is_lms_admin())
with check (public.is_lms_admin());

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

create policy "Admins can manage project components"
on public.project_components for all
using (public.is_lms_admin())
with check (public.is_lms_admin());

create policy "Published ebooks can be read publicly"
on public.ebooks for select
using (is_published = true or public.is_lms_admin());

create policy "Admins can manage ebooks"
on public.ebooks for all
using (public.is_lms_admin())
with check (public.is_lms_admin());

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

create policy "Admins can manage quizzes"
on public.quizzes for all
using (public.is_lms_admin())
with check (public.is_lms_admin());

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

create policy "Admins can manage quiz questions"
on public.quiz_questions for all
using (public.is_lms_admin())
with check (public.is_lms_admin());

create policy "Users can read their own quiz attempts"
on public.quiz_attempts for select
using (auth.uid() = user_id or public.is_lms_admin());

create policy "Users can create their own quiz attempts"
on public.quiz_attempts for insert
with check (auth.uid() = user_id);

create policy "Users can update their own quiz attempts"
on public.quiz_attempts for update
using (auth.uid() = user_id or public.is_lms_admin())
with check (auth.uid() = user_id or public.is_lms_admin());

create policy "Users can delete their own quiz attempts"
on public.quiz_attempts for delete
using (auth.uid() = user_id or public.is_lms_admin());

create policy "Users can read their own saved projects"
on public.saved_projects for select
using (auth.uid() = user_id or public.is_lms_admin());

create policy "Users can create their own saved projects"
on public.saved_projects for insert
with check (auth.uid() = user_id);

create policy "Users can update their own saved projects"
on public.saved_projects for update
using (auth.uid() = user_id or public.is_lms_admin())
with check (auth.uid() = user_id or public.is_lms_admin());

create policy "Users can delete their own saved projects"
on public.saved_projects for delete
using (auth.uid() = user_id or public.is_lms_admin());
