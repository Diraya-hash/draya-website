-- Draaya Career Navigator — initial schema
-- Catalog (public read) + per-user data (RLS-protected).

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type difficulty as enum ('beginner', 'intermediate', 'advanced', 'expert');
create type budget_band as enum ('low', 'medium', 'high', 'flexible');
create type rec_priority as enum ('now', 'next', 'later');
create type saved_status as enum ('wishlist', 'in_progress', 'completed');
create type cv_status as enum ('uploaded', 'processing', 'completed', 'failed');

-- ---------------------------------------------------------------------------
-- Reference / catalog tables
-- ---------------------------------------------------------------------------
create table providers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  logo_url text,
  website text,
  created_at timestamptz not null default now()
);

create table industries (
  slug text primary key,
  label_en text not null,
  label_ar text not null,
  icon text
);

create table competencies (
  key text primary key,
  label_en text not null,
  label_ar text not null,
  description_en text,
  description_ar text,
  icon text,
  sort_order int not null default 0
);

create table career_archetypes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_ar text not null,
  tagline_en text,
  tagline_ar text,
  description_en text,
  description_ar text,
  strengths jsonb not null default '[]',      -- [{en, ar}]
  watchouts jsonb not null default '[]',       -- [{en, ar}]
  future_roles jsonb not null default '[]',    -- [{en, ar}]
  icon text,
  gradient text,
  signature jsonb not null default '{}',       -- {competencyKey: 0..100}
  sort_order int not null default 0
);

create table certifications (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  abbr text not null,
  provider_id uuid references providers(id) on delete set null,
  industry text references industries(slug),
  difficulty difficulty not null,
  duration_weeks int not null,
  exam_cost int not null,
  budget_band budget_band not null,
  salary_impact int not null,
  saudi_relevance int not null,
  global_relevance int not null,
  rating numeric(2, 1) not null default 0,
  reviews int not null default 0,
  summary_en text,
  summary_ar text,
  outcomes jsonb not null default '[]',        -- [{en, ar}]
  tags text[] not null default '{}',
  official_url text,
  created_at timestamptz not null default now()
);
create index certifications_industry_idx on certifications(industry);

create table certification_competencies (
  certification_id uuid references certifications(id) on delete cascade,
  competency_key text references competencies(key),
  weight numeric(3, 2) not null,               -- 0..1
  primary key (certification_id, competency_key)
);

-- ---------------------------------------------------------------------------
-- User / auth tables
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  locale text not null default 'ar',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  answers jsonb not null,
  readiness_index int not null,
  readiness_band text not null,
  archetype_slug text,
  skill_gaps jsonb not null default '[]',
  strengths jsonb not null default '[]',
  weaknesses jsonb not null default '[]',
  salary_growth int not null default 0,
  estimated_months int not null default 0,
  weekly_hours int not null default 0,
  roadmap jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create index assessments_user_idx on assessments(user_id, created_at desc);

create table assessment_recommendations (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id) on delete cascade,
  certification_id uuid references certifications(id) on delete set null,
  rank int not null,
  match int not null,
  priority rec_priority not null,
  reason_en text,
  reason_ar text
);
create index assessment_recs_assessment_idx on assessment_recommendations(assessment_id);

create table saved_certifications (
  user_id uuid references auth.users(id) on delete cascade,
  certification_id uuid references certifications(id) on delete cascade,
  status saved_status not null default 'wishlist',
  progress_percent int not null default 0,
  hours_logged int not null default 0,
  target_exam_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, certification_id)
);

create table career_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  from_role text,
  to_role text,
  milestones jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cv_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  file_name text not null,
  file_type text not null,                     -- 'pdf' | 'docx'
  storage_path text,
  status cv_status not null default 'uploaded',
  created_at timestamptz not null default now()
);

create table cv_analyses (
  id uuid primary key default gen_random_uuid(),
  cv_upload_id uuid references cv_uploads(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  extracted jsonb not null default '{}',       -- {skills, experience, education, certifications, languages, achievements}
  recommendations jsonb not null default '[]', -- [{certificationSlug, compatibility, reason}]
  created_at timestamptz not null default now()
);
create index cv_analyses_user_idx on cv_analyses(user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at touch trigger
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on profiles
  for each row execute function public.touch_updated_at();
create trigger saved_certifications_touch before update on saved_certifications
  for each row execute function public.touch_updated_at();
create trigger career_paths_touch before update on career_paths
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create a profile row when a new auth user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
-- Catalog tables: public read, no public writes (seeded by service role).
alter table providers enable row level security;
alter table industries enable row level security;
alter table competencies enable row level security;
alter table career_archetypes enable row level security;
alter table certifications enable row level security;
alter table certification_competencies enable row level security;

create policy "catalog read" on providers for select using (true);
create policy "catalog read" on industries for select using (true);
create policy "catalog read" on competencies for select using (true);
create policy "catalog read" on career_archetypes for select using (true);
create policy "catalog read" on certifications for select using (true);
create policy "catalog read" on certification_competencies for select using (true);

-- profiles: owner-only.
alter table profiles enable row level security;
create policy "own profile read" on profiles for select using (auth.uid() = id);
create policy "own profile insert" on profiles for insert with check (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);

-- assessments: owner-only.
alter table assessments enable row level security;
create policy "own assessments read" on assessments for select using (auth.uid() = user_id);
create policy "own assessments insert" on assessments for insert with check (auth.uid() = user_id);
create policy "own assessments delete" on assessments for delete using (auth.uid() = user_id);

-- assessment_recommendations: tied to an owned assessment.
alter table assessment_recommendations enable row level security;
create policy "own recs read" on assessment_recommendations for select
  using (assessment_id in (select id from assessments where user_id = auth.uid()));
create policy "own recs insert" on assessment_recommendations for insert
  with check (assessment_id in (select id from assessments where user_id = auth.uid()));

-- saved_certifications: owner-only, all ops.
alter table saved_certifications enable row level security;
create policy "own saved all" on saved_certifications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- career_paths: owner-only, all ops.
alter table career_paths enable row level security;
create policy "own paths all" on career_paths for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- cv_uploads / cv_analyses: owner-only, all ops.
alter table cv_uploads enable row level security;
create policy "own cv uploads all" on cv_uploads for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table cv_analyses enable row level security;
create policy "own cv analyses all" on cv_analyses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
