-- Draaya — storage buckets + data provenance (Infrastructure module 0001)
-- Additive migration. Creates private storage buckets with owner-by-folder RLS
-- and adds provenance flags so seeded/imported data is auditable.

-- ---------------------------------------------------------------------------
-- Storage buckets (private). Objects are stored under `{auth.uid()}/...`.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('cv-uploads', 'cv-uploads', false),
  ('pdf-reports', 'pdf-reports', false),
  ('user-files', 'user-files', false)
on conflict (id) do nothing;

-- Owner-by-folder policies: a user may only touch objects whose first path
-- segment equals their uid. One policy per bucket, covering all operations.
create policy "cv-uploads owner" on storage.objects for all
  using (
    bucket_id = 'cv-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'cv-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "pdf-reports owner" on storage.objects for all
  using (
    bucket_id = 'pdf-reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'pdf-reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "user-files owner" on storage.objects for all
  using (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Provenance / trust model.
-- Curated seed data is inserted unverified; the Admin CMS / Import System
-- (module 0002) promotes records to verified and records a real source.
-- ---------------------------------------------------------------------------
alter table certifications
  add column if not exists source text,
  add column if not exists source_url text,
  add column if not exists verified boolean not null default false,
  add column if not exists last_verified_at timestamptz;

alter table providers
  add column if not exists source text,
  add column if not exists verified boolean not null default false;

create index if not exists certifications_verified_idx on certifications(verified);
