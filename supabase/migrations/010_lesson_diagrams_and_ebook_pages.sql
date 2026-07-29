-- Store the public-readiness fields used by the LMS completeness checks.
-- Apply after 009_launch_ready_public_catalog.sql.

alter table public.lessons
  add column if not exists circuit_diagram_url text;

alter table public.ebooks
  add column if not exists pages integer default 0;

alter table public.ebooks
  drop constraint if exists ebooks_pages_nonnegative;

alter table public.ebooks
  add constraint ebooks_pages_nonnegative check (pages >= 0);

