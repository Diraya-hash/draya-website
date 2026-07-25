/**
 * Seeds Supabase from the curated REAL catalog (lib/seed/catalog.ts) plus the
 * competency/archetype config the engine needs. Numeric certification fields are
 * approximations seeded as `verified = false` / `source = 'seed:curated'`.
 *
 *   npm run seed
 *
 * Requires in navigator/.env.local:
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY
 *
 * Idempotent — upserts on natural keys, safe to re-run.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

import { CATEGORIES, SKILLS, PROVIDERS, ROLES, CERTIFICATIONS, type Difficulty } from "../lib/seed/catalog";
import { GRAPH_SKILLS } from "../lib/seed/graph";
import { ALL_ROLES, ALL_SKILLS, FAMILIES, ALL_PROGRESSIONS, deriveRoleCerts } from "../lib/graph/sample";
import { INDUSTRIES } from "../lib/assessment/questions";
import { COMPETENCY_LIST } from "../lib/assessment/competencies";
import { ARCHETYPES } from "../lib/assessment/archetypes";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function check(label: string, error: { message: string } | null) {
  if (error) {
    console.error(`✗ ${label}:`, error.message);
    process.exit(1);
  }
  console.log(`✓ ${label}`);
}

// --- Derivations (approximate; verified=false) -----------------------------
const LEVEL: Record<Difficulty, "entry" | "mid" | "senior" | "lead"> = {
  beginner: "entry", intermediate: "mid", advanced: "senior", expert: "lead",
};
const SALARY_IMPACT: Record<Difficulty, number> = { beginner: 10, intermediate: 16, advanced: 24, expert: 30 };
const EXP_YEARS: Record<Difficulty, number> = { beginner: 0, intermediate: 2, advanced: 5, expert: 8 };
const RECOGNITION: Record<Difficulty, number> = { beginner: 65, intermediate: 75, advanced: 85, expert: 92 };

function budgetBand(cost: number): "low" | "medium" | "high" | "flexible" {
  if (cost < 300) return "low";
  if (cost < 700) return "medium";
  return "high";
}
function renewalYears(category: string): number {
  return ["cybersecurity", "project_management", "itsm"].includes(category) ? 3 : 0;
}
// Map a category to the closest existing industry slug (engine alignment).
const CATEGORY_TO_INDUSTRY: Record<string, string> = {
  cloud: "cloud", cybersecurity: "cybersecurity", data_ai: "data_ai",
  project_management: "project_management", hr: "hr", finance: "finance",
  marketing: "marketing", software: "technology", it_networking: "technology",
  business_analysis: "technology", itsm: "technology", erp_crm: "technology",
};
// Map a skill kind to one of the six engine competencies.
const KIND_TO_COMPETENCY: Record<string, string> = {
  technical: "technical", ai_data: "aiData", leadership: "leadership",
  business: "business", communication: "communication", project: "project",
  soft: "communication", domain: "business",
};

async function main() {
  console.log(`Seeding ${url} …\n`);

  // Reference used by the engine ---------------------------------------
  await check("industries", (await db.from("industries").upsert(
    INDUSTRIES.map((i) => ({ slug: i.value, label_en: i.label.en, label_ar: i.label.ar, icon: i.icon ?? null })),
    { onConflict: "slug" }
  )).error);

  await check("competencies", (await db.from("competencies").upsert(
    COMPETENCY_LIST.map((c, idx) => ({
      key: c.key, label_en: c.label.en, label_ar: c.label.ar,
      description_en: c.description.en, description_ar: c.description.ar, icon: c.icon, sort_order: idx,
    })),
    { onConflict: "key" }
  )).error);

  await check("career_archetypes", (await db.from("career_archetypes").upsert(
    ARCHETYPES.map((a, idx) => ({
      slug: a.id, name_en: a.name.en, name_ar: a.name.ar, tagline_en: a.tagline.en, tagline_ar: a.tagline.ar,
      description_en: a.description.en, description_ar: a.description.ar, strengths: a.strengths,
      watchouts: a.watchouts, future_roles: a.futureRoles, icon: a.icon, gradient: a.gradient,
      signature: a.signature, sort_order: idx,
    })),
    { onConflict: "slug" }
  )).error);

  // Taxonomy -----------------------------------------------------------
  await check("categories", (await db.from("categories").upsert(
    CATEGORIES.map((c, i) => ({ slug: c.slug, name_en: c.name_en, name_ar: c.name_ar, icon: c.icon, sort_order: i })),
    { onConflict: "slug" }
  )).error);
  const categoryId = new Map((await db.from("categories").select("id, slug")).data?.map((c) => [c.slug, c.id as string]) ?? []);

  // Skills -------------------------------------------------------------
  await check("skills", (await db.from("skills").upsert(
    SKILLS.map((s) => ({
      slug: s.slug, name_en: s.name_en, name_ar: s.name_ar, kind: s.kind,
      category_id: categoryId.get(s.category) ?? null, future_demand: s.future_demand,
    })),
    { onConflict: "slug" }
  )).error);
  const skillId = new Map((await db.from("skills").select("id, slug")).data?.map((s) => [s.slug, s.id as string]) ?? []);

  // Providers ----------------------------------------------------------
  await check("providers", (await db.from("providers").upsert(
    PROVIDERS.map((p) => ({ slug: p.slug, name: p.name, website: p.website ?? null, source: "seed:curated", verified: false })),
    { onConflict: "slug" }
  )).error);
  const providerId = new Map((await db.from("providers").select("id, slug")).data?.map((p) => [p.slug, p.id as string]) ?? []);

  // Career roles + role_skills ----------------------------------------
  await check("career_roles", (await db.from("career_roles").upsert(
    ROLES.map((r) => ({
      slug: r.slug, title_en: r.title_en, title_ar: r.title_ar, level: r.level,
      category_id: categoryId.get(r.category) ?? null, median_salary_usd: r.median_salary_usd,
      saudi_demand: r.saudi_demand, global_demand: r.global_demand, future_demand: r.future_demand,
    })),
    { onConflict: "slug" }
  )).error);
  const roleId = new Map((await db.from("career_roles").select("id, slug")).data?.map((r) => [r.slug, r.id as string]) ?? []);

  const roleSkillRows = ROLES.flatMap((r) =>
    r.skills.filter((s) => skillId.has(s)).map((s) => ({
      role_id: roleId.get(r.slug)!, skill_id: skillId.get(s)!, importance: 0.7,
    }))
  );
  await check("role_skills", (await db.from("role_skills").upsert(roleSkillRows, { onConflict: "role_id,skill_id" })).error);

  // Certifications -----------------------------------------------------
  const certRows = CERTIFICATIONS.map((c) => {
    const catName = CATEGORIES.find((x) => x.slug === c.category);
    const provName = PROVIDERS.find((x) => x.slug === c.provider)?.name ?? "";
    return {
      slug: c.abbr.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
      name: c.name, abbr: c.abbr,
      provider_id: providerId.get(c.provider) ?? null,
      industry: CATEGORY_TO_INDUSTRY[c.category] ?? null,
      category_id: categoryId.get(c.category) ?? null,
      difficulty: c.difficulty,
      career_level: LEVEL[c.difficulty],
      duration_weeks: c.weeks,
      exam_cost: c.cost,
      exam_required: true,
      renewal_years: renewalYears(c.category),
      budget_band: budgetBand(c.cost),
      salary_impact: SALARY_IMPACT[c.difficulty],
      recognition_score: RECOGNITION[c.difficulty],
      saudi_relevance: 80,
      global_relevance: 85,
      estimated_roi: SALARY_IMPACT[c.difficulty] * 3,
      recommended_experience_years: EXP_YEARS[c.difficulty],
      rating: 4.5,
      reviews: 0,
      summary_en: `${c.name} — a ${c.difficulty} ${catName?.name_en ?? ""} credential from ${provName}.`,
      summary_ar: `${c.name} — شهادة ${catName?.name_ar ?? ""} بمستوى ${c.difficulty} من ${provName}.`,
      outcomes: [],
      tags: c.tags ?? [c.category],
      prerequisites: [],
      source: "seed:curated",
      verified: false,
    };
  });
  await check("certifications", (await db.from("certifications").upsert(certRows, { onConflict: "slug" })).error);
  const certId = new Map((await db.from("certifications").select("id, slug")).data?.map((c) => [c.slug, c.id as string]) ?? []);

  // certification_skills (new graph) ----------------------------------
  const certSkillRows = CERTIFICATIONS.flatMap((c) => {
    const cid = certId.get(c.abbr.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
    if (!cid) return [];
    return c.skills.filter((s) => skillId.has(s)).map((s) => ({
      certification_id: cid, skill_id: skillId.get(s)!, weight: 0.7,
    }));
  });
  await check("certification_skills", (await db.from("certification_skills").upsert(certSkillRows, { onConflict: "certification_id,skill_id" })).error);

  // certification_competencies (bridge skills → the 6 engine dimensions)
  const compRows = CERTIFICATIONS.flatMap((c) => {
    const cid = certId.get(c.abbr.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""));
    if (!cid) return [];
    const counts = new Map<string, number>();
    for (const s of c.skills) {
      const kind = SKILLS.find((x) => x.slug === s)?.kind;
      const comp = kind ? KIND_TO_COMPETENCY[kind] : undefined;
      if (comp) counts.set(comp, (counts.get(comp) ?? 0) + 1);
    }
    const max = Math.max(1, ...counts.values());
    return [...counts.entries()].map(([comp, n]) => ({
      certification_id: cid, competency_key: comp,
      weight: Math.round((0.5 + 0.4 * (n / max)) * 100) / 100,
    }));
  });
  await check("certification_competencies", (await db.from("certification_competencies").upsert(compRows, { onConflict: "certification_id,competency_key" })).error);

  // === Career Knowledge Graph (module 0002) ==========================
  // Job families
  await check("job_families", (await db.from("job_families").upsert(
    FAMILIES.map((f) => ({
      slug: f.slug, name_en: f.name_en, name_ar: f.name_ar, industry: f.industry,
      category_id: categoryId.get(f.category) ?? null, sort_order: f.sort_order,
    })),
    { onConflict: "slug" }
  )).error);
  const familyId = new Map((await db.from("job_families").select("id, slug")).data?.map((f) => [f.slug, f.id as string]) ?? []);

  // Graph skills (new hierarchy nodes)
  await check("graph skills", (await db.from("skills").upsert(
    GRAPH_SKILLS.map((s) => ({
      slug: s.slug, name_en: s.name_en, name_ar: s.name_ar, kind: s.kind,
      category_id: categoryId.get(s.category) ?? null, future_demand: s.future_demand,
      competency_key: KIND_TO_COMPETENCY[s.kind] ?? null,
    })),
    { onConflict: "slug" }
  )).error);
  const gSkillId = new Map((await db.from("skills").select("id, slug")).data?.map((s) => [s.slug, s.id as string]) ?? []);

  // Hierarchy + competency rollup for every skill
  const skillUpdates = await Promise.all(ALL_SKILLS.map((s) =>
    db.from("skills").update({
      competency_key: s.competency,
      parent_id: s.parent ? (gSkillId.get(s.parent) ?? null) : null,
      depth: s.parent ? 1 : 0,
    }).eq("slug", s.slug)
  ));
  await check("skill hierarchy", skillUpdates.find((r) => r.error)?.error ?? null);

  // Roles (full detail: family, responsibilities, experience, summary)
  await check("career_roles (graph)", (await db.from("career_roles").upsert(
    ALL_ROLES.map((r) => ({
      slug: r.slug, title_en: r.title_en, title_ar: r.title_ar, level: r.level,
      category_id: categoryId.get(r.category) ?? null,
      job_family_id: r.family ? (familyId.get(r.family) ?? null) : null,
      median_salary_usd: r.median_salary_usd, saudi_demand: r.saudi_demand,
      global_demand: r.global_demand, future_demand: r.future_demand,
      typical_experience_years: r.typical_experience_years,
      summary_en: r.summary_en, summary_ar: r.summary_ar, responsibilities: r.responsibilities,
    })),
    { onConflict: "slug" }
  )).error);
  const gRoleId = new Map((await db.from("career_roles").select("id, slug")).data?.map((r) => [r.slug, r.id as string]) ?? []);

  // role_skills
  const roleSkillRows2 = ALL_ROLES.flatMap((r) =>
    r.skills.filter((s) => gSkillId.has(s) && gRoleId.has(r.slug)).map((s) => ({
      role_id: gRoleId.get(r.slug)!, skill_id: gSkillId.get(s)!, importance: 0.7,
    }))
  );
  await check("role_skills (graph)", (await db.from("role_skills").upsert(roleSkillRows2, { onConflict: "role_id,skill_id" })).error);

  // role_progressions (ladders)
  const progRows = ALL_PROGRESSIONS
    .filter((p) => gRoleId.has(p.from) && gRoleId.has(p.to))
    .map((p) => ({ from_role_id: gRoleId.get(p.from)!, to_role_id: gRoleId.get(p.to)!, typical_years: p.years }));
  await check("role_progressions", (await db.from("role_progressions").upsert(progRows, { onConflict: "from_role_id,to_role_id" })).error);

  // role_certifications (derived by skill overlap)
  const certIdBySlug = new Map((await db.from("certifications").select("id, slug")).data?.map((c) => [c.slug, c.id as string]) ?? []);
  const roleCertRows = ALL_ROLES.flatMap((r) => {
    if (!gRoleId.has(r.slug)) return [];
    return deriveRoleCerts(r.skills)
      .filter((rc) => certIdBySlug.has(rc.slug))
      .map((rc) => ({ role_id: gRoleId.get(r.slug)!, certification_id: certIdBySlug.get(rc.slug)!, strength: rc.strength }));
  });
  await check("role_certifications", (await db.from("role_certifications").upsert(roleCertRows, { onConflict: "role_id,certification_id" })).error);

  // Minimal geography / languages -------------------------------------
  await check("countries", (await db.from("countries").upsert([
    { code: "SA", name_en: "Saudi Arabia", name_ar: "المملكة العربية السعودية", region: "MENA" },
    { code: "AE", name_en: "United Arab Emirates", name_ar: "الإمارات العربية المتحدة", region: "MENA" },
    { code: "US", name_en: "United States", name_ar: "الولايات المتحدة", region: "Americas" },
    { code: "GB", name_en: "United Kingdom", name_ar: "المملكة المتحدة", region: "Europe" },
    { code: "EG", name_en: "Egypt", name_ar: "مصر", region: "MENA" },
  ], { onConflict: "code" })).error);
  await check("languages", (await db.from("languages").upsert([
    { code: "en", name_en: "English", name_ar: "الإنجليزية", rtl: false },
    { code: "ar", name_en: "Arabic", name_ar: "العربية", rtl: true },
  ], { onConflict: "code" })).error);

  console.log(
    `\nDone: ${CATEGORIES.length} categories, ${SKILLS.length} skills, ${PROVIDERS.length} providers, ` +
      `${ROLES.length} roles, ${CERTIFICATIONS.length} certifications (all source='seed:curated', verified=false).`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
