# PRD 0001 — Infrastructure First

**Status:** Approved — in progress (hosted Supabase; guarded fallback retained)
**Author:** Draaya engineering
**Related TDD:** [tdd/0001-infrastructure.md](../tdd/0001-infrastructure.md)

## Problem

The platform's data and intelligence currently run on bundled sample data via a
fallback layer. Auth, dashboard, saved certifications, and assessment history
are built but have **never been exercised against a live database**, because no
Supabase instance is provisioned. Before we build data-heavy and AI features, we
need a **verified production data backbone**: live Postgres + Auth + Storage,
applied migrations, RLS, storage buckets, environment configuration, and a
small **real** dataset — so every later module is developed and verified against
live data, never stubs.

This also sets the data-integrity foundation the product strategy demands: **no
invented certifications, prices, or requirements.** Seeded data is a small,
curated set of real, well-known certifications, and each record carries a
provenance flag (`source`, `verified`) so trusted data can grow later through
the Admin CMS and Import System.

## User stories

- **As the product team**, I can run the entire app against a live Supabase, so
  every feature is verifiable end-to-end (not just type-checked).
- **As a user**, I sign in with a magic link and my dashboard, saved
  certifications, and assessment history read/write from the real database.
- **As a user**, when I later upload a CV or download a report, it is stored
  securely in a private bucket that only I can access.
- **As an administrator (future)**, the storage buckets and provenance model
  already exist, so the Admin CMS can manage trusted data without schema churn.

## Acceptance criteria

1. A Supabase project (hosted or local) is connected via environment variables.
2. **All** migrations (0001 base, 0002 intelligence, 0003 storage/provenance)
   apply cleanly from scratch (`supabase db reset` / `db push`).
3. Magic-link **authentication** works end-to-end against the live project
   (sign in → callback → session → dashboard).
4. Three **storage buckets** exist — `cv-uploads`, `pdf-reports`, `user-files`
   — all private, with RLS so a user can only access files under their own
   `{user_id}/…` prefix.
5. **RLS is verified**: catalog tables are publicly readable; every per-user
   table denies cross-user access. A short verification script proves this.
6. **Environment variables** are documented and set for local dev and Vercel
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`).
7. A **small, real** dataset is seeded: **~20 providers, ~100 certifications,
   ~50 skills, ~20 career roles**, plus the skill/role links. Certifications use
   real names/providers; any approximate field (price, duration) is marked
   `verified = false`. **No fabricated providers or hallucinated requirements.**
8. **All existing features are verified against the live DB**: home stats,
   assessment → live catalog → persisted result, dashboard readiness/stats,
   saved-cert save/status/progress, history re-view.
9. The app **no longer depends on bundled mock data** as its runtime source once
   Supabase is configured (see TDD for the fallback decision).
10. `tsc --noEmit` passes.
11. `next build` passes.
12. Changes committed.
13. Pushed to GitHub; Vercel redeploys green.

## UX flow

Infrastructure is mostly invisible to end users; the observable flow:

1. User visits `/[locale]/sign-in` → enters email → receives magic link.
2. Clicks link → `/auth/callback` exchanges code → session set → `/dashboard`.
3. Dashboard renders **from live Supabase** (latest assessment, saved certs,
   stats, history).
4. Assessment completes → result persisted to `assessments` → visible in history.
5. (Future modules) CV upload / PDF download read & write private buckets.

## Out of scope (separate modules, each with its own PRD/TDD)

- Admin CMS and Import System (module 0002) — the mechanism for growing trusted
  data.
- Large dataset (thousands of certs) — deferred until trusted sources/connectors.
- Career Intelligence Engine, Career DNA, adaptive assessment, CV analyzer,
  executive PDF — modules 0003+.

## Open decision (blocks implementation)

**Where does Supabase run?** Local Docker vs. hosted free-tier. This changes the
provisioning steps and whether the mock fallback can be fully removed (a hosted
project gives Vercel a real DB, so production never needs the fallback). See the
TDD "Provisioning" section. **Recommendation: hosted.**
