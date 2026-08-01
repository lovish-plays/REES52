-- Cross-platform article storage used by the public newsroom and Teacher Studio.

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  excerpt text not null,
  content text not null,
  category text not null,
  cover_image_url text,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists articles_slug_unique on public.articles(slug);
create index if not exists articles_status_published_idx on public.articles(status, published_at desc);
create index if not exists articles_author_idx on public.articles(author_id);

drop trigger if exists touch_articles_updated_at on public.articles;
create trigger touch_articles_updated_at
  before update on public.articles
  for each row execute function public.touch_updated_at();

alter table public.articles enable row level security;

drop policy if exists "Published articles can be read publicly" on public.articles;
drop policy if exists "Teachers can read all articles" on public.articles;
drop policy if exists "Teachers can create articles" on public.articles;
drop policy if exists "Teachers can update articles" on public.articles;
drop policy if exists "Teachers can delete articles" on public.articles;

create policy "Published articles can be read publicly"
on public.articles for select
using (status = 'published' and published_at is not null);

create policy "Teachers can read all articles"
on public.articles for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and lower(coalesce(profiles.role, 'student')) in ('teacher', 'admin')
  )
);

create policy "Teachers can create articles"
on public.articles for insert
to authenticated
with check (
  auth.uid() = author_id
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and lower(coalesce(profiles.role, 'student')) in ('teacher', 'admin')
  )
);

create policy "Teachers can update articles"
on public.articles for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and lower(coalesce(profiles.role, 'student')) in ('teacher', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and lower(coalesce(profiles.role, 'student')) in ('teacher', 'admin')
  )
);

create policy "Teachers can delete articles"
on public.articles for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and lower(coalesce(profiles.role, 'student')) in ('teacher', 'admin')
  )
);
