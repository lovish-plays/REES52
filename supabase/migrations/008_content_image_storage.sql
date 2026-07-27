-- Durable public image storage for teacher/admin-managed LMS content.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-images',
  'content-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "REES52 staff upload content images" on storage.objects;
create policy "REES52 staff upload content images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'content-images'
  and public.is_lms_admin()
);

drop policy if exists "REES52 staff update content images" on storage.objects;
create policy "REES52 staff update content images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'content-images'
  and public.is_lms_admin()
)
with check (
  bucket_id = 'content-images'
  and public.is_lms_admin()
);

drop policy if exists "REES52 staff delete content images" on storage.objects;
create policy "REES52 staff delete content images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'content-images'
  and public.is_lms_admin()
);
