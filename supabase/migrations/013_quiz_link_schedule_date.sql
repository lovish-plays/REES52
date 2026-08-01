-- Quiz links reuse the legacy webinars table without a scheduled event.
-- Allow a null date for those link-only records while retaining dated webinars.

alter table public.webinars
  alter column schedule_date drop not null;
