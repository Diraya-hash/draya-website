# Draaya Career Navigator

AI-powered career intelligence platform. Professionals answer a short
assessment and receive a personalised **Career Readiness Index**, skill-gap
analysis, **Career DNA** archetype, prioritised certification recommendations,
a salary projection, and a phased roadmap.

Arabic-first with full English support (RTL/LTR), light & dark mode.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** with the shared Draya teal design tokens
- **next-themes** (light/dark), **Framer Motion**, **lucide-react**
- Hand-rolled shadcn-style UI primitives (no external UI dependency)

## Project layout

```
navigator/
├── app/[locale]/            # ar (default) + en routes, RTL/LTR
│   ├── page.tsx             # landing
│   └── assessment/          # the flagship wizard + results
├── components/
│   ├── assessment/          # multi-step wizard + form controls
│   ├── results/             # readiness gauge, skill radar, report
│   └── ui/                  # button, card, badge, input
└── lib/
    ├── assessment/          # engine, mock catalog, archetypes, questions
    ├── dictionaries/        # en / ar strings
    └── i18n.ts
```

### The AI seam

All assessment intelligence flows through a single function:
[`lib/assessment/engine.ts`](lib/assessment/engine.ts) → `generateAssessment()`.
It currently runs a deterministic mock model over a typed sample catalog.
To go live, replace the body of that one function with a Claude API call —
nothing else in the app changes.

## Local development

```bash
cd navigator
npm install
npm run dev        # http://localhost:3000
```

> Don't run `npm run build` while `npm run dev` is running against the same
> checkout — they share `.next` and will corrupt each other. Stop dev first,
> or build in a separate clone.

## Database (Supabase)

The catalog (certifications, providers, archetypes, industries) and all per-user
data live in Postgres via Supabase. The app reads through a data-access layer
([`lib/data/`](lib/data)) that **falls back to the bundled sample data** whenever
Supabase env isn't set — so the app runs with zero setup, and switches to live
data automatically once configured.

### Run locally (requires Docker Desktop running)

```bash
cd navigator
npm install
npm run db:start          # starts local Supabase in Docker, applies migrations
                          # → copy the printed API URL + anon + service_role keys

cp .env.local.example .env.local
# paste NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY

npm run seed              # loads the sample catalog into Postgres
npm run db:types          # (optional) regenerate lib/supabase/database.types.ts
npm run dev
```

Other scripts: `npm run db:reset` (drop + re-apply migrations + reseed),
`npm run db:stop`.

Schema lives in [`supabase/migrations/`](supabase/migrations). Row-Level Security
is on for every table: catalog tables are public-read; per-user tables
(`profiles`, `assessments`, `saved_certifications`, `career_paths`, `cv_*`) are
restricted to `auth.uid()`.

> No Docker? Use a free hosted project at [supabase.com](https://supabase.com):
> create a project, run the migration SQL in the SQL editor (or `supabase db
> push` with a linked project), then put its URL + keys in `.env.local`.

## Deploying to Vercel

This app lives in the `navigator/` subfolder of the repository, so Vercel must
be told to build from that directory.

1. Go to **[vercel.com/new](https://vercel.com/new)** and import
   `Diraya-hash/draya-website`.
2. Set **Root Directory** to `navigator`.
3. Framework preset auto-detects as **Next.js** — leave build & output settings
   at their defaults.
4. Click **Deploy**.

No environment variables are required to deploy (it runs on sample data). To
serve live data on Vercel, add `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` (from a hosted Supabase project) in the Vercel
project's Environment Variables.
