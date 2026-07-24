import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { CERTIFICATIONS } from "@/lib/assessment/certifications";
import type { Certification } from "@/lib/assessment/types";
import type { CompetencyKey } from "@/lib/assessment/competencies";

export interface RawCert {
  slug: string;
  name: string;
  abbr: string;
  industry: string;
  difficulty: Certification["difficulty"];
  duration_weeks: number;
  exam_cost: number;
  budget_band: Certification["budgetBand"];
  salary_impact: number;
  saudi_relevance: number;
  global_relevance: number;
  rating: number | string;
  reviews: number;
  summary_en: string | null;
  summary_ar: string | null;
  outcomes: { en: string; ar: string }[] | null;
  tags: string[] | null;
  provider: { name: string } | null;
  builds: { competency_key: CompetencyKey; weight: number | string }[] | null;
}

export const CERT_SELECT = `
  slug, name, abbr, industry, difficulty, duration_weeks, exam_cost, budget_band,
  salary_impact, saudi_relevance, global_relevance, rating, reviews,
  summary_en, summary_ar, outcomes, tags,
  provider:providers(name),
  builds:certification_competencies(competency_key, weight)
`;

export function mapCertRow(row: RawCert): Certification {
  const builds: Certification["builds"] = {};
  for (const b of row.builds ?? []) builds[b.competency_key] = Number(b.weight);
  return {
    id: row.slug,
    name: row.name,
    provider: row.provider?.name ?? "",
    abbr: row.abbr,
    industry: row.industry as Certification["industry"],
    difficulty: row.difficulty,
    builds,
    durationWeeks: row.duration_weeks,
    examCost: row.exam_cost,
    budgetBand: row.budget_band,
    salaryImpact: row.salary_impact,
    saudiRelevance: row.saudi_relevance,
    globalRelevance: row.global_relevance,
    rating: Number(row.rating),
    reviews: row.reviews,
    summary: { en: row.summary_en ?? "", ar: row.summary_ar ?? "" },
    outcomes: row.outcomes ?? [],
    tags: row.tags ?? [],
  };
}

/**
 * Live certification catalog. Falls back to the bundled sample data when
 * Supabase isn't configured or a query fails, so the UI never breaks.
 */
export async function getCertifications(): Promise<Certification[]> {
  if (!isSupabaseConfigured()) return CERTIFICATIONS;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("certifications").select(CERT_SELECT);
    if (error) throw error;
    if (!data || data.length === 0) return CERTIFICATIONS;
    return (data as unknown as RawCert[]).map(mapCertRow);
  } catch (err) {
    console.error("[data/certifications] falling back to sample data:", err);
    return CERTIFICATIONS;
  }
}

export async function getCertificationCount(): Promise<number> {
  if (!isSupabaseConfigured()) return CERTIFICATIONS.length;
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("certifications")
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? CERTIFICATIONS.length;
  } catch {
    return CERTIFICATIONS.length;
  }
}

export async function getCertificationBySlug(slug: string): Promise<Certification | null> {
  if (!isSupabaseConfigured()) {
    return CERTIFICATIONS.find((c) => c.id === slug) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("certifications")
      .select(CERT_SELECT)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapCertRow(data as unknown as RawCert) : null;
  } catch (err) {
    console.error("[data/certifications] bySlug fallback:", err);
    return CERTIFICATIONS.find((c) => c.id === slug) ?? null;
  }
}
