-- Draaya Career Intelligence — expanded schema (Phase 3, Step 1)
-- Additive, forward-only migration. Adds the skills graph, career roles/paths,
-- learning resources, market data, social proof, the user skill graph, and
-- richer certification columns. Nothing from Phases 1–2 is dropped.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type role_level as enum ('entry', 'mid', 'senior', 'lead', 'executive');
create type skill_kind as enum (
  'technical', 'leadership', 'business', 'ai_data', 'communication',
  'project', 'soft', 'domain'
);
create type resource_type as enum (
  'book', 'video', 'course', 'practice_exam', 'article', 'community', 'website'
);
create type trend_direction as enum ('rising', 'stable', 'declining');

-- ---------------------------------------------------------------------------
-- Geography & languages
-- ---------------------------------------------------------------------------
create table countries (
  code text primary key,                       -- ISO 3166-1 alpha-2
  name_en text not null,
  name_ar text not null,
  region text
);

create table markets (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_ar text not null,
  country_code text references countries(code) on delete set null
);

create table languages (
  code text primary key,                       -- ISO 639-1
  name_en text not null,
  name_ar text not null,
  rtl boolean not null default false
);

-- ---------------------------------------------------------------------------
-- Taxonomy
-- ---------------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_ar text not null,
  icon text,
  sort_order int not null default 0
);

create table subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete cascade,
  slug text not null,
  name_en text not null,
  name_ar text not null,
  sort_order int not null default 0,
  unique (category_id, slug)
);

-- ---------------------------------------------------------------------------
-- Skills graph
-- ---------------------------------------------------------------------------
create table skills (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_ar text not null,
  kind skill_kind not null default 'technical',
  category_id uuid references categories(id) on delete set null,
  description_en text,
  description_ar text,
  future_demand int not null default 50,       -- 0..100
  created_at timestamptz not null default now()
);
create index skills_kind_idx on skills(kind);
create index skills_category_idx on skills(category_id);

create table certification_skills (
  certification_id uuid references certifications(id) on delete cascade,
  skill_id uuid references skills(id) on delete cascade,
  weight numeric(3, 2) not null default 0.5,   -- how strongly it teaches (0..1)
  level role_level not null default 'mid',
  primary key (certification_id, skill_id)
);
create index certification_skills_skill_idx on certification_skills(skill_id);

-- ---------------------------------------------------------------------------
-- Career roles & paths
-- ---------------------------------------------------------------------------
create table career_roles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null,
  title_ar text not null,
  level role_level not null default 'mid',
  category_id uuid references categories(id) on delete set null,
  description_en text,
  description_ar text,
  median_salary_usd int,
  employer_demand int not null default 50,     -- 0..100
  saudi_demand int not null default 50,
  global_demand int not null default 50,
  future_demand int not null default 50,
  created_at timestamptz not null default now()
);
create index career_roles_level_idx on career_roles(level);
create index career_roles_category_idx on career_roles(category_id);

create table role_skills (
  role_id uuid references career_roles(id) on delete cascade,
  skill_id uuid references skills(id) on delete cascade,
  importance numeric(3, 2) not null default 0.5,  -- 0..1
  min_level role_level not null default 'mid',
  primary key (role_id, skill_id)
);
create index role_skills_skill_idx on role_skills(skill_id);

create table career_path_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null,
  title_ar text not null,
  category_id uuid references categories(id) on delete set null,
  description_en text,
  description_ar text,
  created_at timestamptz not null default now()
);

create table career_path_steps (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references career_path_templates(id) on delete cascade,
  step_order int not null,
  role_id uuid references career_roles(id) on delete set null,
  typical_years numeric(3, 1),
  note_en text,
  note_ar text,
  unique (path_id, step_order)
);

-- ---------------------------------------------------------------------------
-- Multi-provider & related certifications
-- ---------------------------------------------------------------------------
create table certification_providers (
  certification_id uuid references certifications(id) on delete cascade,
  provider_id uuid references providers(id) on delete cascade,
  role text not null default 'primary',        -- 'primary' | 'partner'
  primary key (certification_id, provider_id)
);

create table certification_related (
  certification_id uuid references certifications(id) on delete cascade,
  related_id uuid references certifications(id) on delete cascade,
  relation text not null default 'related',    -- 'related' | 'prerequisite' | 'next'
  primary key (certification_id, related_id),
  check (certification_id <> related_id)
);

-- ---------------------------------------------------------------------------
-- Assessment authoring & normalized responses
-- ---------------------------------------------------------------------------
create table assessment_questions (
  id uuid primary key default gen_random_uuid(),
  section text not null,                       -- 'personal','leadership',...
  qkey text unique not null,
  qtype text not null,                         -- 'single','multi','scale','text','number'
  prompt_en text not null,
  prompt_ar text not null,
  help_en text,
  help_ar text,
  options jsonb not null default '[]',         -- [{value,label_en,label_ar}]
  competency_key text references competencies(key) on delete set null,
  skill_slug text,
  depends_on jsonb,                            -- adaptive: {qkey, op, value}
  weight numeric(3, 2) not null default 1,
  sort_order int not null default 0,
  active boolean not null default true
);
create index assessment_questions_section_idx on assessment_questions(section, sort_order);

create table assessment_responses (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  qkey text not null,
  value jsonb not null,
  created_at timestamptz not null default now(),
  unique (assessment_id, qkey)
);
create index assessment_responses_assessment_idx on assessment_responses(assessment_id);

-- ---------------------------------------------------------------------------
-- Market data
-- ---------------------------------------------------------------------------
create table salary_benchmarks (
  id uuid primary key default gen_random_uuid(),
  role_id uuid references career_roles(id) on delete cascade,
  country_code text references countries(code) on delete set null,
  level role_level,
  currency text not null default 'USD',
  p25 int,
  median int,
  p75 int,
  year int not null default extract(year from now())
);
create index salary_benchmarks_role_idx on salary_benchmarks(role_id);

create table industry_trends (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete cascade,
  market_id uuid references markets(id) on delete set null,
  metric text not null,                        -- 'demand','salary_growth','postings'
  period text not null,                        -- '2026-Q1'
  value numeric,
  direction trend_direction not null default 'stable'
);
create index industry_trends_category_idx on industry_trends(category_id);

-- ---------------------------------------------------------------------------
-- Learning resources (books, videos, courses, practice exams, …)
-- ---------------------------------------------------------------------------
create table learning_resources (
  id uuid primary key default gen_random_uuid(),
  certification_id uuid references certifications(id) on delete cascade,
  skill_id uuid references skills(id) on delete cascade,
  resource_type resource_type not null,
  title text not null,
  url text,
  provider text,
  author text,
  language text not null default 'en',
  rating numeric(2, 1),
  created_at timestamptz not null default now()
);
create index learning_resources_cert_idx on learning_resources(certification_id);
create index learning_resources_skill_idx on learning_resources(skill_id);
create index learning_resources_type_idx on learning_resources(resource_type);

-- ---------------------------------------------------------------------------
-- Social proof
-- ---------------------------------------------------------------------------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  certification_id uuid not null references certifications(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  created_at timestamptz not null default now()
);
create index reviews_cert_idx on reviews(certification_id, created_at desc);

create table success_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  from_role text,
  to_role text,
  certification_slugs jsonb not null default '[]',
  quote_en text,
  quote_ar text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- User skill / certification graph
-- ---------------------------------------------------------------------------
create table user_skills (
  user_id uuid references auth.users(id) on delete cascade,
  skill_id uuid references skills(id) on delete cascade,
  level int not null default 0 check (level between 0 and 5),
  source text not null default 'self',         -- 'self','assessment','cv'
  updated_at timestamptz not null default now(),
  primary key (user_id, skill_id)
);

create table user_certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  certification_id uuid references certifications(id) on delete cascade,
  obtained_on date,
  credential_id text,
  expires_on date,
  created_at timestamptz not null default now(),
  unique (user_id, certification_id)
);

-- ---------------------------------------------------------------------------
-- Richer certification columns
-- ---------------------------------------------------------------------------
alter table certifications
  add column if not exists category_id uuid references categories(id) on delete set null,
  add column if not exists subcategory_id uuid references subcategories(id) on delete set null,
  add column if not exists exam_required boolean not null default true,
  add column if not exists renewal_years int not null default 0,
  add column if not exists recognition_score int not null default 0,
  add column if not exists estimated_roi numeric(6, 2),
  add column if not exists career_level role_level,
  add column if not exists recommended_experience_years int not null default 0,
  add column if not exists prerequisites jsonb not null default '[]';
create index if not exists certifications_category_idx on certifications(category_id);

-- Career DNA lives on the existing archetypes table.
alter table career_archetypes
  add column if not exists recommended_skill_slugs jsonb not null default '[]',
  add column if not exists ideal_role_slugs jsonb not null default '[]',
  add column if not exists growth_path jsonb not null default '[]',
  add column if not exists leadership_style_en text,
  add column if not exists leadership_style_ar text;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create trigger user_skills_touch before update on user_skills
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
-- Public-read reference / catalog tables.
alter table countries enable row level security;
alter table markets enable row level security;
alter table languages enable row level security;
alter table categories enable row level security;
alter table subcategories enable row level security;
alter table skills enable row level security;
alter table certification_skills enable row level security;
alter table career_roles enable row level security;
alter table role_skills enable row level security;
alter table career_path_templates enable row level security;
alter table career_path_steps enable row level security;
alter table certification_providers enable row level security;
alter table certification_related enable row level security;
alter table assessment_questions enable row level security;
alter table salary_benchmarks enable row level security;
alter table industry_trends enable row level security;
alter table learning_resources enable row level security;

create policy "catalog read" on countries for select using (true);
create policy "catalog read" on markets for select using (true);
create policy "catalog read" on languages for select using (true);
create policy "catalog read" on categories for select using (true);
create policy "catalog read" on subcategories for select using (true);
create policy "catalog read" on skills for select using (true);
create policy "catalog read" on certification_skills for select using (true);
create policy "catalog read" on career_roles for select using (true);
create policy "catalog read" on role_skills for select using (true);
create policy "catalog read" on career_path_templates for select using (true);
create policy "catalog read" on career_path_steps for select using (true);
create policy "catalog read" on certification_providers for select using (true);
create policy "catalog read" on certification_related for select using (true);
create policy "catalog read" on assessment_questions for select using (true);
create policy "catalog read" on salary_benchmarks for select using (true);
create policy "catalog read" on industry_trends for select using (true);
create policy "catalog read" on learning_resources for select using (true);

-- reviews: public read, owner writes.
alter table reviews enable row level security;
create policy "reviews read" on reviews for select using (true);
create policy "reviews insert own" on reviews for insert with check (auth.uid() = user_id);
create policy "reviews update own" on reviews for update using (auth.uid() = user_id);
create policy "reviews delete own" on reviews for delete using (auth.uid() = user_id);

-- success_stories: published are public; owner sees & manages own.
alter table success_stories enable row level security;
create policy "stories read" on success_stories for select
  using (published or auth.uid() = user_id);
create policy "stories write own" on success_stories for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user_skills / user_certifications: owner-only.
alter table user_skills enable row level security;
create policy "own skills all" on user_skills for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table user_certifications enable row level security;
create policy "own certs all" on user_certifications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- assessment_responses: tied to an owned assessment.
alter table assessment_responses enable row level security;
create policy "own responses read" on assessment_responses for select
  using (assessment_id in (select id from assessments where user_id = auth.uid()));
create policy "own responses insert" on assessment_responses for insert
  with check (assessment_id in (select id from assessments where user_id = auth.uid()));
