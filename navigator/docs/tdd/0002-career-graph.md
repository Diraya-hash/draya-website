# TDD 0002 — Career Knowledge Graph & Skills Ontology

**Status:** Draft — awaiting approval
**Related PRD:** [prd/0002-career-graph.md](../prd/0002-career-graph.md)

## 1. Architecture

We model the graph **in Postgres** (nodes = existing/new tables, edges = FK +
join tables) rather than a separate graph DB — it keeps one source of truth,
RLS, and Supabase tooling, and our traversals are shallow (1–3 hops). A thin
**graph query layer** (`lib/graph/*`) composes Supabase joins into typed graph
objects; the future engines depend only on this layer, never on raw SQL.

```
UI (Career Explorer, RSC)
      │  reads
lib/graph/*  (roles, skills, families)      ← 0003+ engines also read here
      │  Supabase joins (RLS: public-read catalog)
Postgres:  industries · job_families · career_roles · role_skills ·
           role_certifications · role_progressions · competencies ·
           skills(hierarchy) · certification_skills · learning_resources ·
           salary_benchmarks
```

Guarded-fallback discipline (as `lib/data/*`): when Supabase is unconfigured,
graph functions return an in-code sample slice so the explorer still renders.

## 2. Database changes — migration `20260727_career_graph.sql` (additive)

### 2a. Skills → hierarchy + competency mapping
```sql
alter table skills
  add column if not exists parent_id uuid references skills(id) on delete set null,
  add column if not exists competency_key text references competencies(key) on delete set null,
  add column if not exists depth int not null default 0;   -- 0 = cluster root
create index if not exists skills_parent_idx on skills(parent_id);
create index if not exists skills_competency_idx on skills(competency_key);
```
Rollup: a skill's `competency_key` (or its root ancestor's) determines which of
the readiness competencies it feeds. `depth` speeds tree rendering.

### 2b. Job families
```sql
create table job_families (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_en text not null, name_ar text not null,
  industry text references industries(slug) on delete set null,
  category_id uuid references categories(id) on delete set null,
  description_en text, description_ar text,
  sort_order int not null default 0
);
```

### 2c. Roles → responsibilities, family, experience
```sql
alter table career_roles
  add column if not exists job_family_id uuid references job_families(id) on delete set null,
  add column if not exists responsibilities jsonb not null default '[]',  -- [{en,ar}]
  add column if not exists typical_experience_years int,
  add column if not exists summary_en text, add column if not exists summary_ar text;
create index if not exists career_roles_family_idx on career_roles(job_family_id);
```

### 2d. Promotion ladder (role → role edges)
```sql
create table role_progressions (
  from_role_id uuid references career_roles(id) on delete cascade,
  to_role_id   uuid references career_roles(id) on delete cascade,
  typical_years numeric(3,1),
  note_en text, note_ar text,
  primary key (from_role_id, to_role_id),
  check (from_role_id <> to_role_id)
);
create index role_progressions_to_idx on role_progressions(to_role_id);
```

### 2e. Recommended certifications per role
```sql
create table role_certifications (
  role_id uuid references career_roles(id) on delete cascade,
  certification_id uuid references certifications(id) on delete cascade,
  strength numeric(3,2) not null default 0.7,   -- 0..1 recommendation weight
  primary key (role_id, certification_id)
);
create index role_certifications_cert_idx on role_certifications(certification_id);
```

`role_skills` (required skills, exists from 0002-intelligence), `salary_benchmarks`
(exists), `certification_skills` (exists) complete the graph. **All new tables
get RLS `catalog read` (public select).** No columns dropped/renamed.

## 3. Graph query layer (`lib/graph/`)

Typed, server-only, composable. Illustrative surface:

```ts
// lib/graph/roles.ts
getJobFamilies(): Promise<JobFamily[]>                       // grouped by industry
getRolesByFamily(familySlug): Promise<RoleCard[]>            // ladder order
getRoleGraph(roleSlug): Promise<RoleGraph | null>            // the full node:
  // { role, family, industry, responsibilities,
  //   requiredSkills: SkillWithLevel[] (grouped by competency),
  //   recommendedCerts: CertRef[], promotions: RoleRef[],
  //   salary: SalaryBand | null }
getPromotionTargets(roleSlug): Promise<RoleRef[]>

// lib/graph/skills.ts
getSkillTree(rootSlug?): Promise<SkillNode[]>                // nested children
getCertsTeachingSkill(skillSlug): Promise<CertRef[]>
getRolesRequiringSkill(skillSlug): Promise<RoleRef[]>
```

Domain types live in `lib/graph/types.ts`. Each function mirrors `lib/data/*`:
`isSupabaseConfigured()` guard → live joins → typed map → sample fallback on
error. These are the primitives 0003 (path engine) and 0005 (recommendations)
consume — **no engine chooses raw SQL.**

## 4. Seed additions

Extend `lib/seed/catalog.ts` + `scripts/seed.ts` (idempotent upserts) with:

- **Skill hierarchy**: add `parent` (slug) + `competency` to skills; expand
  ≥3 clusters (Leadership, AI, Data) to match the brief's examples. Seed sets
  `parent_id`, `competency_key`, `depth`.
- **Job families** (~8 real): e.g., Learning & Development, Talent Management,
  Cloud & Infrastructure, Data & AI, Cybersecurity, Software Engineering,
  Project Delivery, Finance.
- **Roles**: attach `job_family_id`, `responsibilities`, `typical_experience`,
  `summary`; extend the existing ~20 roles into **3 full ladders (≥4 levels)**:
  HR/L&D (Learning Specialist → Senior → Manager → Head → Director → CLO),
  Data/AI (Data Analyst → Data Scientist → ML Engineer → AI Strategist), Security
  (Security Engineer → … → CISO).
- **`role_progressions`**: the ladder edges + `typical_years`.
- **`role_certifications`**: recommended certs per role (mapped from role skills →
  certs teaching them).
- All new rows keep `verified=false` where numeric/approximate.

## 5. UI — Career Explorer (read-only, existing design system)

- `app/[locale]/careers/page.tsx` — families grouped by industry (Card grid,
  same tokens/components as home). Nav gains a "Careers" link.
- `app/[locale]/careers/[role]/page.tsx` — role detail: header, summary,
  responsibilities list, **required-skills** grouped by competency with level
  chips and an expandable skill-tree, **recommended certifications** (reusing the
  existing cert card styling + `SaveButton`), **promotion targets** (clickable
  role chips), salary band. Server Components; bilingual + RTL.
- `components/careers/*` for the skill-tree and role-graph pieces. **No new
  design language** — Card/Badge/Button/Icon/Reveal only.
- Static params for the seeded roles; dynamic fallback for the rest.

## 6. Security

- All new tables are **catalog/public-read** (RLS `using (true)`); no user data
  in this module → no owner policies needed.
- No writes from the app (seed uses service role). Admin edits come in 0008.
- Explorer requires no auth; `SaveButton` reuses existing owner-scoped action.

## 7. Performance

- Traversals are 1–3 hops with FK indexes (added above) → fast.
- Explorer pages are Server Components with static generation for seeded roles;
  Next caching applies. Skill tree built in one query (self-join by `parent_id`)
  and assembled in memory.
- No N+1: `getRoleGraph` uses nested Supabase selects (role → skills, certs,
  progressions) in a small number of round-trips. Pagination not needed at this
  scale (deferred to 0010).

## 8. Testing & rollout (lifecycle: Implementation → Testing → …)

1. Write migration + seed + graph layer + explorer.
2. **Testing**: after `db push` + `npm run seed`, `npm run verify:db` (extend to
   assert `job_families`, `role_progressions`, `role_certifications`, hierarchical
   skills present); walk the 3 ladders in the Explorer against the live DB;
   confirm no dead links and fallback works unconfigured.
3. `npm run typecheck` → `npm run build` → fix → commit → push.

## 9. Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Skill hierarchy vs. flat competencies drift | `competency_key` on skills gives a deterministic rollup used by 0004 |
| Graph query N+1 / slowness | nested selects + FK indexes; measured before shipping |
| Scope creep into scoring | hard boundary — 0002 has **zero** scoring; engines are 0003+ |
| Seed depth vs. breadth | go **deep on 3 real ladders**, not shallow-wide; more via Admin CMS (0008) |
| Live verify needs provisioning | same as 0001 — you provision, I verify |

## 10. Definition of done

All PRD acceptance criteria met, three real ladders fully traversable in the
Explorer against the live DB, `lib/graph/*` stable for 0003, `main` green.
