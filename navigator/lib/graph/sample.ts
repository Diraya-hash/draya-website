/**
 * In-memory assembly of the Career Graph from the seed modules. Used as the
 * query-layer fallback (Supabase unconfigured) and as the source for the seed
 * script's role→certification derivation — one source, no drift.
 */
import {
  SKILLS as CATALOG_SKILLS,
  ROLES as CATALOG_ROLES,
  CERTIFICATIONS as CATALOG_CERTS,
  type RoleLevel,
} from "../seed/catalog";
import {
  JOB_FAMILIES,
  GRAPH_SKILLS,
  SKILL_PARENTS,
  GRAPH_ROLES,
  ROLE_DETAILS,
  PROGRESSIONS,
} from "../seed/graph";

export const KIND_TO_COMPETENCY: Record<string, string> = {
  technical: "technical", ai_data: "aiData", leadership: "leadership",
  business: "business", communication: "communication", project: "project",
  soft: "communication", domain: "business",
};

const CATEGORY_TO_FAMILY: Record<string, string> = {
  cloud: "cloud-infrastructure", cybersecurity: "cybersecurity", data_ai: "data-ai",
  project_management: "project-delivery", hr: "talent-management", finance: "finance",
  software: "software-engineering", business_analysis: "project-delivery",
  it_networking: "cloud-infrastructure", itsm: "project-delivery", erp_crm: "software-engineering",
};

const EXP_BY_LEVEL: Record<RoleLevel, number> = { entry: 1, mid: 3, senior: 6, lead: 10, executive: 15 };

export function certSlug(abbr: string): string {
  return abbr.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export interface GSkill {
  slug: string;
  name_en: string;
  name_ar: string;
  kind: string;
  competency: string;
  parent: string | null;
}

export interface GRole {
  slug: string;
  title_en: string;
  title_ar: string;
  level: RoleLevel;
  category: string;
  family: string | null;
  median_salary_usd: number;
  saudi_demand: number;
  global_demand: number;
  future_demand: number;
  typical_experience_years: number;
  summary_en: string;
  summary_ar: string;
  responsibilities: { en: string; ar: string }[];
  skills: string[];
}

// --- Skills ----------------------------------------------------------------
export const ALL_SKILLS: GSkill[] = [
  ...CATALOG_SKILLS.map((s) => ({
    slug: s.slug, name_en: s.name_en, name_ar: s.name_ar, kind: s.kind,
    competency: KIND_TO_COMPETENCY[s.kind] ?? "business",
    parent: SKILL_PARENTS[s.slug] ?? null,
  })),
  ...GRAPH_SKILLS.map((s) => ({
    slug: s.slug, name_en: s.name_en, name_ar: s.name_ar, kind: s.kind,
    competency: KIND_TO_COMPETENCY[s.kind] ?? "business",
    parent: s.parent ?? SKILL_PARENTS[s.slug] ?? null,
  })),
];

const SKILL_BY_SLUG = new Map(ALL_SKILLS.map((s) => [s.slug, s]));
export const getSampleSkill = (slug: string) => SKILL_BY_SLUG.get(slug);

// --- Roles -----------------------------------------------------------------
export const ALL_ROLES: GRole[] = [
  ...CATALOG_ROLES.map((r) => {
    const d = ROLE_DETAILS[r.slug];
    return {
      slug: r.slug, title_en: r.title_en, title_ar: r.title_ar, level: r.level, category: r.category,
      family: d?.family ?? CATEGORY_TO_FAMILY[r.category] ?? null,
      median_salary_usd: r.median_salary_usd, saudi_demand: r.saudi_demand,
      global_demand: r.global_demand, future_demand: r.future_demand,
      typical_experience_years: d?.typical_experience_years ?? EXP_BY_LEVEL[r.level],
      summary_en: d?.summary_en ?? `${r.title_en} role.`,
      summary_ar: d?.summary_ar ?? `دور ${r.title_ar}.`,
      responsibilities: d?.responsibilities ?? [],
      skills: r.skills,
    };
  }),
  ...GRAPH_ROLES.map((r) => ({
    slug: r.slug, title_en: r.title_en, title_ar: r.title_ar, level: r.level, category: r.category,
    family: r.family, median_salary_usd: r.median_salary_usd, saudi_demand: r.saudi_demand,
    global_demand: r.global_demand, future_demand: r.future_demand,
    typical_experience_years: r.typical_experience_years,
    summary_en: r.summary_en, summary_ar: r.summary_ar,
    responsibilities: r.responsibilities, skills: r.skills,
  })),
];

const ROLE_BY_SLUG = new Map(ALL_ROLES.map((r) => [r.slug, r]));
export const getSampleRole = (slug: string) => ROLE_BY_SLUG.get(slug);

export const FAMILIES = JOB_FAMILIES;
export const ALL_PROGRESSIONS = PROGRESSIONS;

// --- Role → recommended certifications (by skill overlap) ------------------
export function deriveRoleCerts(roleSkills: string[]): { slug: string; strength: number }[] {
  const wanted = new Set(roleSkills);
  const scored = CATALOG_CERTS.map((c) => {
    const overlap = c.skills.filter((s) => wanted.has(s)).length;
    return { slug: certSlug(c.abbr), overlap };
  })
    .filter((c) => c.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 5);
  return scored.map((c) => ({ slug: c.slug, strength: Math.min(0.9, 0.5 + 0.2 * c.overlap) }));
}

export function certRefBySlug(slug: string) {
  const c = CATALOG_CERTS.find((x) => certSlug(x.abbr) === slug);
  if (!c) return null;
  return { slug, name: c.name, abbr: c.abbr, difficulty: c.difficulty, weeks: c.weeks, cost: c.cost };
}
