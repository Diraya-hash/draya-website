# TDD 0001 — Infrastructure First

**Status:** Approved — in progress. Decisions: **hosted** Supabase; **keep
guarded fallback** (live DB authoritative when configured).
**Related PRD:** [prd/0001-infrastructure.md](../prd/0001-infrastructure.md)

## 1. Architecture

```
Next.js 15 (App Router)  ──@supabase/ssr──►  Supabase
  ├─ Server Components / Actions (RLS as the user)         ├─ Postgres (migrations)
  ├─ middleware: locale + session refresh                  ├─ Auth (magic link)
  └─ lib/data/* data layer (single read surface)           └─ Storage (3 buckets)
seed script (service role, bypasses RLS) ──────────────────►
```

No new runtime services. We reuse the existing `@supabase/ssr` browser/server
clients and the `lib/data/*` layer. Storage is accessed server-side via the same
authenticated client so RLS applies. The **only** privileged path is the seed
script, which uses the service-role key and never ships to the browser.

## 2. Provisioning (the load-bearing decision)

I **cannot** create a Supabase account, sign in, or run Docker on your machine
(account creation/auth is off-limits for me, and Docker isn't installed). So
provisioning is a short collaboration: **you create the project and run 3–4
commands I provide; I own all code and verification.**

| | **Hosted (recommended)** | **Local Docker** |
|---|---|---|
| Setup | Create free project at supabase.com | Install Docker Desktop |
| Apply migrations | `supabase link` + `supabase db push` | `supabase db reset` |
| Works on Vercel (prod) | ✅ yes | ❌ no (local only) |
| Lets us fully remove mock fallback | ✅ yes | ⚠️ prod would break without a DB |
| Secrets you handle | project keys in `.env.local` + Vercel | local keys (fixed demo values) |

**Recommendation: Hosted.** It makes production real, so we can honor "remove
mock data" cleanly (Vercel gets a live DB). Local Docker only covers dev and
would force us to keep a fallback for production.

Either way, **you** run the provisioning commands (I provide exact copy-paste);
**I** author migrations/seed/config and verify the app. I will not ask you to
paste secret keys into chat — they go into `.env.local` and Vercel's env UI.

## 3. Database changes

New additive migration **`20260726_storage_and_provenance.sql`**:

### 3a. Storage buckets (via SQL, so it's reproducible & versioned)
```sql
insert into storage.buckets (id, name, public) values
  ('cv-uploads','cv-uploads', false),
  ('pdf-reports','pdf-reports', false),
  ('user-files','user-files',  false)
on conflict (id) do nothing;
```

### 3b. Storage RLS (owner-by-folder on storage.objects)
Files are stored under `{auth.uid()}/…`. Policies (per bucket, all four ops):
```sql
create policy "cv own" on storage.objects for all
  using ( bucket_id = 'cv-uploads'
          and (storage.foldername(name))[1] = auth.uid()::text )
  with check ( bucket_id = 'cv-uploads'
          and (storage.foldername(name))[1] = auth.uid()::text );
-- repeat for pdf-reports, user-files
```

### 3c. Provenance (data-integrity strategy)
```sql
alter table certifications
  add column if not exists source text,          -- 'seed:curated' | 'microsoft-learn' | ...
  add column if not exists source_url text,
  add column if not exists verified boolean not null default false,
  add column if not exists last_verified_at timestamptz;
alter table providers
  add column if not exists source text,
  add column if not exists verified boolean not null default false;
```
Curated seed rows are inserted with `source='seed:curated'`, `verified=false`.
The Admin CMS / Import System (module 0002) flips `verified=true` and sets a real
source. The UI can surface an "unverified" hint where appropriate.

No existing columns are dropped or renamed.

## 4. API / actions / code changes

- **`lib/storage.ts`** (new): typed helpers `uploadUserFile(bucket, path, file)`,
  `createSignedUrl(bucket, path, ttl)`, `removeUserFile(...)` — thin wrappers over
  the server client, always writing under the `{user_id}/` prefix. (Consumed by
  CV/PDF modules later; defined now so buckets are exercised by a smoke test.)
- **Seed rewrite** (`scripts/seed.ts`): replace the 21-item sample with the
  curated ~100 real certs / ~20 providers / ~50 skills / ~20 roles, plus
  `certification_skills` and `role_skills` links, categories, and a few salary
  benchmarks. Data is a hand-checked TS module `lib/seed/catalog.ts` (real names;
  approximate numeric fields flagged `verified:false`).
- **Mock-fallback decision (AC #9):** keep the `isSupabaseConfigured()` guard but
  invert the default: when configured, the data layer is **authoritative** (no
  silent fallback on non-empty DB). Retain fallback **only** for the unconfigured
  case (local first-run / CI). With hosted Supabase set on Vercel, production
  always uses the live DB. The bundled sample arrays remain **only** as the seed
  input, not a runtime source. → This satisfies "remove remaining mock data"
  without breaking builds. *If you prefer a hard removal (no fallback at all),
  say so and I'll delete the guard entirely.*
- **`db:types`**: generate `lib/supabase/database.types.ts` from the live schema
  and thread the `Database` generic through the clients for end-to-end typing
  (removes the current `as unknown as` casts in the data layer).

## 5. Security

- **RLS everywhere** (already in 0001/0002; 0003 adds storage). Catalog =
  public-read; user tables + storage = owner-only. A verification script
  (`scripts/verify-db.ts`) asserts: anon can read catalog, anon **cannot** read
  `assessments`/`saved_certifications`, and storage objects are folder-scoped.
- **Service-role key** used only by `seed`/`verify` scripts (Node), never in
  client or shipped bundles. Documented in `.env.local.example`.
- **Buckets are private**; downloads use short-lived **signed URLs**.
- **Auth**: magic link (PKCE) via `@supabase/ssr`; session in httpOnly cookies,
  refreshed in middleware.

## 6. Performance

- Indexes already defined on all FKs/hot columns (0001/0002).
- Seed is intentionally small (~100 certs) → fast queries, no pagination needed
  yet (pagination is module 0009 when the catalog grows).
- Reads stay in Server Components; Next caching applies. `db:types` adds no
  runtime cost.

## 7. Rollout & verification (maps to PRD AC 1–13)

```bash
# You (once): create hosted project, then in navigator/
supabase link --project-ref <ref>      # you run; needs your db password
supabase db push                       # applies 0001+0002+0003
cp .env.local.example .env.local       # add URL + anon + service_role keys
npm run seed                           # curated real dataset
npm run db:types                       # generate typed schema
# Me: verify
npm run verify:db                      # RLS + catalog/user access assertions
npm run dev                            # walk sign-in → dashboard → assessment
npm run typecheck && npm run build     # AC 10–11
# Me: git commit + push  (AC 12–13); Vercel redeploys with env set
```

Set the same three env vars in the **Vercel** project so production uses the
live DB.

## 8. Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| I can't provision cloud/Docker | You run 3–4 commands; I provide exact steps + all code |
| Seed field accuracy (prices/durations) | `verified=false` + provenance; Admin CMS corrects later |
| Removing fallback breaks prod | Only remove for the *configured* path; hosted Vercel always has a DB |
| Storage policy mistakes | `verify-db.ts` smoke test + private buckets + signed URLs |

## 9. Definition of done

All 13 PRD acceptance criteria met and demonstrated against the **live**
database, `main` green on Vercel.
