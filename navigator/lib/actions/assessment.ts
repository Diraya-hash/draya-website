"use server";

import { getCertifications } from "@/lib/data/certifications";
import { getArchetypes } from "@/lib/data/archetypes";
import { generateAssessment } from "@/lib/assessment/engine";
import type { AssessmentAnswers, AssessmentResult } from "@/lib/assessment/types";
import type { Locale } from "@/lib/i18n";

/**
 * Runs the career assessment server-side against the live catalog. This is the
 * seam where the deterministic engine will later be swapped for a Claude call —
 * the client keeps calling `runAssessment(answers, locale)` unchanged.
 *
 * (Persisting results to `assessments` for logged-in users lands in Phase 2.)
 */
export async function runAssessment(
  answers: AssessmentAnswers,
  locale: Locale
): Promise<AssessmentResult> {
  const [certifications, archetypes] = await Promise.all([
    getCertifications(),
    getArchetypes(),
  ]);

  return generateAssessment(answers, { certifications, archetypes }, locale);
}
