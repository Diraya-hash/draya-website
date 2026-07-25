import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { COMPETENCY_KEYS } from "@/lib/assessment/competencies";
import type { Locale } from "@/lib/i18n";
import {
  ALL_ROLES, FAMILIES, ALL_PROGRESSIONS, getSampleRole, getSampleSkill,
  deriveRoleCerts, certRefBySlug, ALL_SKILLS,
} from "./sample";
import type {
  JobFamily, RoleCard, RoleGraph, RoleRef, SkillNode, SkillWithLevel, CertRef,
} from "./types";

const LEVEL_ORDER: Record<string, number> = { entry: 0, mid: 1, senior: 2, lead: 3, executive: 4 };
const pick = (en: string, ar: string, l: Locale) => (l === "ar" ? ar : en);

// --- Families + roles (Career Explorer index) ------------------------------
export async function getFamiliesWithRoles(
  locale: Locale
): Promise<{ family: JobFamily; roles: RoleCard[] }[]> {
  const build = () =>
    FAMILIES.map((f) => ({
      family: { slug: f.slug, name: pick(f.name_en, f.name_ar, locale), industry: f.industry },
      roles: ALL_ROLES.filter((r) => r.family === f.slug)
        .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] || a.typical_experience_years - b.typical_experience_years)
        .map((r) => ({
          slug: r.slug, title: pick(r.title_en, r.title_ar, locale), level: r.level,
          summary: pick(r.summary_en, r.summary_ar, locale), experienceYears: r.typical_experience_years,
        })),
    })).filter((g) => g.roles.length > 0);

  if (!isSupabaseConfigured()) return build();
  try {
    const supabase = await createClient();
    const { data: fams, error } = await supabase
      .from("job_families")
      .select("slug, name_en, name_ar, industry, id")
      .order("sort_order");
    if (error || !fams?.length) return build();
    const { data: roles } = await supabase
      .from("career_roles")
      .select("slug, title_en, title_ar, level, summary_en, summary_ar, typical_experience_years, job_family_id");
    const rows = roles ?? [];
    return fams
      .map((f) => ({
        family: { slug: f.slug as string, name: pick(f.name_en, f.name_ar, locale), industry: (f.industry as string) ?? null },
        roles: rows
          .filter((r) => r.job_family_id === f.id)
          .sort((a, b) => LEVEL_ORDER[a.level as string] - LEVEL_ORDER[b.level as string])
          .map((r) => ({
            slug: r.slug as string, title: pick(r.title_en as string, r.title_ar as string, locale),
            level: r.level as string, summary: pick((r.summary_en as string) ?? "", (r.summary_ar as string) ?? "", locale),
            experienceYears: (r.typical_experience_years as number) ?? 0,
          })),
      }))
      .filter((g) => g.roles.length > 0);
  } catch {
    return build();
  }
}

export function getAllRoleSlugs(): string[] {
  return ALL_ROLES.filter((r) => r.family).map((r) => r.slug);
}

// --- Role graph (role detail) ----------------------------------------------
function buildRoleGraphSample(slug: string, locale: Locale): RoleGraph | null {
  const r = getSampleRole(slug);
  if (!r) return null;
  const fam = FAMILIES.find((f) => f.slug === r.family);

  // Group skills by competency.
  const byComp = new Map<string, SkillWithLevel[]>();
  for (const s of r.skills) {
    const sk = getSampleSkill(s);
    if (!sk) continue;
    const list = byComp.get(sk.competency) ?? [];
    list.push({ slug: sk.slug, name: pick(sk.name_en, sk.name_ar, locale), competency: sk.competency });
    byComp.set(sk.competency, list);
  }
  const skillsByCompetency = [...byComp.entries()]
    .sort((a, b) => COMPETENCY_KEYS.indexOf(a[0] as never) - COMPETENCY_KEYS.indexOf(b[0] as never))
    .map(([competency, skills]) => ({ competency, skills }));

  const recommendedCerts: CertRef[] = deriveRoleCerts(r.skills).flatMap(({ slug: cs, strength }) => {
    const c = certRefBySlug(cs);
    return c ? [{ ...c, strength }] : [];
  });

  const promotions: RoleRef[] = ALL_PROGRESSIONS.filter((p) => p.from === slug).flatMap((p) => {
    const to = getSampleRole(p.to);
    return to ? [{ slug: to.slug, title: pick(to.title_en, to.title_ar, locale), level: to.level }] : [];
  });

  return {
    slug: r.slug, title: pick(r.title_en, r.title_ar, locale), level: r.level,
    summary: pick(r.summary_en, r.summary_ar, locale), experienceYears: r.typical_experience_years,
    family: fam ? { slug: fam.slug, name: pick(fam.name_en, fam.name_ar, locale) } : null,
    responsibilities: r.responsibilities.map((x) => pick(x.en, x.ar, locale)),
    skillsByCompetency, recommendedCerts, promotions,
    salary: { median: r.median_salary_usd, currency: "USD" },
    demand: { saudi: r.saudi_demand, global: r.global_demand, future: r.future_demand },
  };
}

export async function getRoleGraph(slug: string, locale: Locale): Promise<RoleGraph | null> {
  // Live enrichment lands during post-provision verification; the sample model
  // is the seed source, so the graph is accurate offline. (Guard kept for the
  // configured path.)
  if (!isSupabaseConfigured()) return buildRoleGraphSample(slug, locale);
  try {
    return buildRoleGraphSample(slug, locale);
  } catch {
    return buildRoleGraphSample(slug, locale);
  }
}

// --- Skill tree ------------------------------------------------------------
export function getSkillTree(locale: Locale): SkillNode[] {
  const nodes = new Map<string, SkillNode>(
    ALL_SKILLS.map((s) => [s.slug, { slug: s.slug, name: pick(s.name_en, s.name_ar, locale), competency: s.competency, children: [] }])
  );
  const roots: SkillNode[] = [];
  for (const s of ALL_SKILLS) {
    const node = nodes.get(s.slug)!;
    if (s.parent && nodes.has(s.parent)) nodes.get(s.parent)!.children.push(node);
    else roots.push(node);
  }
  // Only surface roots that actually have children (the ontology clusters).
  return roots
    .filter((r) => r.children.length > 0)
    .sort((a, b) => b.children.length - a.children.length);
}
