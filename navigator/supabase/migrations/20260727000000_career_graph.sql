-- Draaya — Career Knowledge Graph (module 0002). Additive migration.
-- Skill hierarchy + competency rollup, job families, richer roles, promotion
-- ladders, and role→certification recommendations.

-- ---------------------------------------------------------------------------
-- Skills: hierarchy + competency mapping
-- ---------------------------------------------------------------------------
alter table skills
  add column if not exists parent_id uuid references skills(id) on delete set null,
  add column if not exists competency_key text references competencies(key) on delete set null,
  add column if not exists depth int not null default 0;
create index if not exists skills_parent_idx on skills(parent_id);
create index if not exists skills_competency_idx on skills(competency_key);

-- ---------------------------------------------------------------------------
-- Job families (industry → family → role)
-- ---------------------------------------------------------------------------
create table job_families (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null,
  name_ar text not null,
  industry text references industries(slug) on delete set null,
  category_id uuid references categories(id) on delete set null,
  description_en text,
  description_ar text,
  sort_order int not null default 0
);
create index job_families_industry_idx on job_families(industry);

-- ---------------------------------------------------------------------------
-- Roles: family, responsibilities, experience, summary
-- ---------------------------------------------------------------------------
alter table career_roles
  add column if not exists job_family_id uuid references job_families(id) on delete set null,
  add column if not exists responsibilities jsonb not null default '[]',  -- [{en,ar}]
  add column if not exists typical_experience_years int,
  add column if not exists summary_en text,
  add column if not exists summary_ar text;
create index if not exists career_roles_family_idx on career_roles(job_family_id);

-- ---------------------------------------------------------------------------
-- Promotion ladder (role → role)
-- ---------------------------------------------------------------------------
create table role_progressions (
  from_role_id uuid references career_roles(id) on delete cascade,
  to_role_id uuid references career_roles(id) on delete cascade,
  typical_years numeric(3, 1),
  note_en text,
  note_ar text,
  primary key (from_role_id, to_role_id),
  check (from_role_id <> to_role_id)
);
create index role_progressions_to_idx on role_progressions(to_role_id);

-- ---------------------------------------------------------------------------
-- Recommended certifications per role
-- ---------------------------------------------------------------------------
create table role_certifications (
  role_id uuid references career_roles(id) on delete cascade,
  certification_id uuid references certifications(id) on delete cascade,
  strength numeric(3, 2) not null default 0.7,
  primary key (role_id, certification_id)
);
create index role_certifications_cert_idx on role_certifications(certification_id);

-- ---------------------------------------------------------------------------
-- Row-Level Security (catalog: public read)
-- ---------------------------------------------------------------------------
alter table job_families enable row level security;
alter table role_progressions enable row level security;
alter table role_certifications enable row level security;

create policy "catalog read" on job_families for select using (true);
create policy "catalog read" on role_progressions for select using (true);
create policy "catalog read" on role_certifications for select using (true);
