/**
 * Seeds the Supabase database from the bundled sample catalog.
 *
 *   npm run seed
 *
 * Requires (in navigator/.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL      (or SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY     (bypasses RLS for writes)
 *
 * Idempotent — upserts on natural keys, safe to re-run.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

import { CERTIFICATIONS } from "../lib/assessment/certifications";
import { ARCHETYPES } from "../lib/assessment/archetypes";
import { COMPETENCY_LIST } from "../lib/assessment/competencies";
import { INDUSTRIES } from "../lib/assessment/questions";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function check(label: string, error: { message: string } | null) {
  if (error) {
    console.error(`✗ ${label}:`, error.message);
    process.exit(1);
  }
  console.log(`✓ ${label}`);
}

async function main() {
  console.log(`Seeding ${url} …\n`);

  // Industries
  await check(
    "industries",
    (
      await db.from("industries").upsert(
        INDUSTRIES.map((i) => ({
          slug: i.value,
          label_en: i.label.en,
          label_ar: i.label.ar,
          icon: i.icon ?? null,
        })),
        { onConflict: "slug" }
      )
    ).error
  );

  // Competencies
  await check(
    "competencies",
    (
      await db.from("competencies").upsert(
        COMPETENCY_LIST.map((c, idx) => ({
          key: c.key,
          label_en: c.label.en,
          label_ar: c.label.ar,
          description_en: c.description.en,
          description_ar: c.description.ar,
          icon: c.icon,
          sort_order: idx,
        })),
        { onConflict: "key" }
      )
    ).error
  );

  // Career archetypes
  await check(
    "career_archetypes",
    (
      await db.from("career_archetypes").upsert(
        ARCHETYPES.map((a, idx) => ({
          slug: a.id,
          name_en: a.name.en,
          name_ar: a.name.ar,
          tagline_en: a.tagline.en,
          tagline_ar: a.tagline.ar,
          description_en: a.description.en,
          description_ar: a.description.ar,
          strengths: a.strengths,
          watchouts: a.watchouts,
          future_roles: a.futureRoles,
          icon: a.icon,
          gradient: a.gradient,
          signature: a.signature,
          sort_order: idx,
        })),
        { onConflict: "slug" }
      )
    ).error
  );

  // Providers (derived from certifications)
  const providerNames = [...new Set(CERTIFICATIONS.map((c) => c.provider))];
  await check(
    "providers",
    (
      await db.from("providers").upsert(
        providerNames.map((name) => ({ slug: slugify(name), name })),
        { onConflict: "slug" }
      )
    ).error
  );

  const { data: providerRows, error: provErr } = await db
    .from("providers")
    .select("id, slug");
  await check("providers fetched", provErr);
  const providerIdBySlug = new Map(
    (providerRows ?? []).map((p) => [p.slug, p.id as string])
  );

  // Certifications
  await check(
    "certifications",
    (
      await db.from("certifications").upsert(
        CERTIFICATIONS.map((c) => ({
          slug: c.id,
          name: c.name,
          abbr: c.abbr,
          provider_id: providerIdBySlug.get(slugify(c.provider)) ?? null,
          industry: c.industry,
          difficulty: c.difficulty,
          duration_weeks: c.durationWeeks,
          exam_cost: c.examCost,
          budget_band: c.budgetBand,
          salary_impact: c.salaryImpact,
          saudi_relevance: c.saudiRelevance,
          global_relevance: c.globalRelevance,
          rating: c.rating,
          reviews: c.reviews,
          summary_en: c.summary.en,
          summary_ar: c.summary.ar,
          outcomes: c.outcomes,
          tags: c.tags,
        })),
        { onConflict: "slug" }
      )
    ).error
  );

  const { data: certRows, error: certErr } = await db
    .from("certifications")
    .select("id, slug");
  await check("certifications fetched", certErr);
  const certIdBySlug = new Map(
    (certRows ?? []).map((c) => [c.slug, c.id as string])
  );

  // Certification ↔ competency weights
  const compRows = CERTIFICATIONS.flatMap((c) =>
    Object.entries(c.builds).map(([competency_key, weight]) => ({
      certification_id: certIdBySlug.get(c.id)!,
      competency_key,
      weight,
    }))
  );
  await check(
    "certification_competencies",
    (
      await db
        .from("certification_competencies")
        .upsert(compRows, { onConflict: "certification_id,competency_key" })
    ).error
  );

  console.log(
    `\nDone: ${INDUSTRIES.length} industries, ${COMPETENCY_LIST.length} competencies, ` +
      `${ARCHETYPES.length} archetypes, ${providerNames.length} providers, ` +
      `${CERTIFICATIONS.length} certifications.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
