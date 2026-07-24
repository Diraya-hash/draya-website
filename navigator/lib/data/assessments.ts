import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getUser } from "@/lib/auth";
import { getArchetypes } from "./archetypes";
import { CERT_SELECT, mapCertRow, type RawCert } from "./certifications";
import type {
  AssessmentAnswers,
  AssessmentResult,
  SkillGap,
  RoadmapMilestone,
  ScoredCertification,
} from "@/lib/assessment/types";

export interface AssessmentSummary {
  id: string;
  created_at: string;
  readiness_index: number;
  readiness_band: string;
  archetype_slug: string | null;
  target_role: string;
}

/**
 * Persists a completed assessment (+ its recommendations) for the signed-in
 * user. No-op returning null when unauthenticated or Supabase is unconfigured.
 */
export async function saveAssessment(
  answers: AssessmentAnswers,
  result: AssessmentResult
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const user = await getUser();
  if (!user) return null;

  try {
    const supabase = await createClient();

    const { data: inserted, error } = await supabase
      .from("assessments")
      .insert({
        user_id: user.id,
        answers,
        readiness_index: result.readinessIndex,
        readiness_band: result.readinessBand,
        archetype_slug: result.archetype.id,
        skill_gaps: result.skillGaps,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        salary_growth: result.salaryGrowth,
        estimated_months: result.estimatedMonths,
        weekly_hours: result.weeklyHours,
        roadmap: result.roadmap,
      })
      .select("id")
      .single();
    if (error) throw error;
    const assessmentId = inserted.id as string;

    // Resolve recommendation cert slugs → uuids for the FK.
    const slugs = result.recommendations.map((r) => r.cert.id);
    const { data: certRows } = await supabase
      .from("certifications")
      .select("id, slug")
      .in("slug", slugs);
    const idBySlug = new Map((certRows ?? []).map((c) => [c.slug as string, c.id as string]));

    const recRows = result.recommendations.map((r, i) => ({
      assessment_id: assessmentId,
      certification_id: idBySlug.get(r.cert.id) ?? null,
      rank: i,
      match: r.match,
      priority: r.priority,
      reason_en: r.reason.en,
      reason_ar: r.reason.ar,
    }));
    if (recRows.length) {
      const { error: recErr } = await supabase.from("assessment_recommendations").insert(recRows);
      if (recErr) throw recErr;
    }

    return assessmentId;
  } catch (err) {
    console.error("[data/assessments] saveAssessment failed:", err);
    return null;
  }
}

export async function getLatestAssessment(): Promise<AssessmentSummary | null> {
  const list = await getAssessmentHistory(1);
  return list[0] ?? null;
}

/** Reconstruct a stored assessment into a full result for re-viewing. */
export async function getAssessmentById(
  id: string
): Promise<{ result: AssessmentResult; answers: AssessmentAnswers } | null> {
  if (!isSupabaseConfigured()) return null;
  const user = await getUser();
  if (!user) return null;
  try {
    const supabase = await createClient();
    const { data: row, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (!row) return null;

    const { data: recRows } = await supabase
      .from("assessment_recommendations")
      .select(
        `rank, match, priority, reason_en, reason_ar, certification:certifications(${CERT_SELECT})`
      )
      .eq("assessment_id", id)
      .order("rank");

    const archetypes = await getArchetypes();
    const archetype =
      archetypes.find((a) => a.id === row.archetype_slug) ?? archetypes[0];

    const recommendations: ScoredCertification[] = (recRows ?? [])
      .filter((r) => r.certification)
      .map((r) => ({
        cert: mapCertRow(r.certification as unknown as RawCert),
        match: r.match as number,
        priority: r.priority as ScoredCertification["priority"],
        reason: { en: (r.reason_en as string) ?? "", ar: (r.reason_ar as string) ?? "" },
      }));

    const result: AssessmentResult = {
      readinessIndex: row.readiness_index,
      readinessBand: row.readiness_band as AssessmentResult["readinessBand"],
      skillGaps: (row.skill_gaps as SkillGap[]) ?? [],
      strengths: (row.strengths as SkillGap[]) ?? [],
      weaknesses: (row.weaknesses as SkillGap[]) ?? [],
      archetype,
      recommendations,
      salaryGrowth: row.salary_growth,
      estimatedMonths: row.estimated_months,
      weeklyHours: row.weekly_hours,
      roadmap: (row.roadmap as RoadmapMilestone[]) ?? [],
    };

    return { result, answers: row.answers as AssessmentAnswers };
  } catch (err) {
    console.error("[data/assessments] getById failed:", err);
    return null;
  }
}

export async function getAssessmentHistory(limit = 20): Promise<AssessmentSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const user = await getUser();
  if (!user) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assessments")
      .select("id, created_at, readiness_index, readiness_band, archetype_slug, answers")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      created_at: row.created_at as string,
      readiness_index: row.readiness_index as number,
      readiness_band: row.readiness_band as string,
      archetype_slug: row.archetype_slug as string | null,
      target_role: ((row.answers as AssessmentAnswers)?.targetRole as string) ?? "",
    }));
  } catch (err) {
    console.error("[data/assessments] history failed:", err);
    return [];
  }
}
