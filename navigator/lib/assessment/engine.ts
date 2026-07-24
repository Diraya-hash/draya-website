import type { ArchetypeDefinition } from "./archetypes";
import { COMPETENCY_KEYS, type CompetencyKey } from "./competencies";
import type {
  AssessmentAnswers,
  AssessmentResult,
  Certification,
  Industry,
  ScoredCertification,
  SkillGap,
  RoadmapMilestone,
  BudgetBand,
  StudyTimeBand,
  ExperienceLevel,
  Priority,
} from "./types";

/*
  Deterministic "AI" assessment engine.

  This module is intentionally the single seam between the product UI and the
  intelligence layer. Swapping the mock scoring for a Claude API call means
  replacing `generateAssessment` — nothing else in the app changes.
*/

/** What a strong professional in each industry typically needs (0–100). */
const INDUSTRY_DEMAND: Record<Industry, Record<CompetencyKey, number>> = {
  hr: { leadership: 75, technical: 40, business: 70, aiData: 55, communication: 90, project: 65 },
  technology: { leadership: 60, technical: 90, business: 55, aiData: 70, communication: 60, project: 70 },
  finance: { leadership: 65, technical: 55, business: 92, aiData: 65, communication: 70, project: 60 },
  data_ai: { leadership: 55, technical: 80, business: 65, aiData: 92, communication: 60, project: 65 },
  cybersecurity: { leadership: 60, technical: 90, business: 55, aiData: 60, communication: 60, project: 65 },
  project_management: { leadership: 78, technical: 45, business: 70, aiData: 45, communication: 80, project: 92 },
  marketing: { leadership: 60, technical: 45, business: 75, aiData: 70, communication: 85, project: 60 },
  healthcare: { leadership: 65, technical: 60, business: 70, aiData: 55, communication: 75, project: 65 },
  supply_chain: { leadership: 60, technical: 50, business: 80, aiData: 60, communication: 65, project: 80 },
  cloud: { leadership: 55, technical: 92, business: 55, aiData: 70, communication: 55, project: 68 },
};

const SENIORITY: Record<ExperienceLevel, number> = {
  student: 0,
  junior: 1,
  mid: 2,
  senior: 3,
  lead: 4,
  exec: 5,
};

const WEEKLY_HOURS: Record<StudyTimeBand, number> = {
  under5: 4,
  "5to10": 8,
  "10to20": 15,
  over20: 24,
};

const BUDGET_ORDER: Record<BudgetBand, number> = { low: 1, medium: 2, high: 3, flexible: 3 };

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function round(n: number) {
  return Math.round(n);
}

/** Current competency profile in 0–100 (from 0–5 self-ratings). */
function currentProfile(answers: AssessmentAnswers): Record<CompetencyKey, number> {
  const out = {} as Record<CompetencyKey, number>;
  for (const k of COMPETENCY_KEYS) out[k] = clamp((answers.skills[k] ?? 0) * 20);
  return out;
}

/** Target profile = industry demand lifted by seniority ambition. */
function targetProfile(answers: AssessmentAnswers): Record<CompetencyKey, number> {
  const industry = (answers.targetIndustry || answers.industry || "technology") as Industry;
  const demand = INDUSTRY_DEMAND[industry] ?? INDUSTRY_DEMAND.technology;
  const ambition = SENIORITY[(answers.experience || "mid") as ExperienceLevel];
  const out = {} as Record<CompetencyKey, number>;
  for (const k of COMPETENCY_KEYS) {
    // Leadership & business scale most with ambition.
    const lift = (k === "leadership" || k === "business") ? ambition * 3 : ambition * 1.2;
    out[k] = clamp(demand[k] + lift);
  }
  return out;
}

function computeSkillGaps(
  current: Record<CompetencyKey, number>,
  target: Record<CompetencyKey, number>
): SkillGap[] {
  return COMPETENCY_KEYS.map((key) => ({
    key,
    current: round(current[key]),
    target: round(target[key]),
    gap: round(Math.max(0, target[key] - current[key])),
  }));
}

function computeReadiness(
  current: Record<CompetencyKey, number>,
  target: Record<CompetencyKey, number>,
  answers: AssessmentAnswers
): number {
  let weighted = 0;
  let weightSum = 0;
  for (const k of COMPETENCY_KEYS) {
    const w = target[k];
    const ratio = target[k] > 0 ? Math.min(1, current[k] / target[k]) : 1;
    weighted += ratio * w;
    weightSum += w;
  }
  let score = (weighted / weightSum) * 100;
  // Small structural bonuses: education & a defined plan signal readiness.
  if (answers.education === "master" || answers.education === "phd") score += 4;
  if (answers.education === "bachelor") score += 2;
  if (answers.targetRole.trim()) score += 2;
  if (answers.learningMethod) score += 1;
  return clamp(round(score));
}

function readinessBand(index: number): AssessmentResult["readinessBand"] {
  if (index >= 80) return "advanced";
  if (index >= 60) return "proficient";
  if (index >= 40) return "developing";
  return "emerging";
}

function pickArchetype(
  current: Record<CompetencyKey, number>,
  archetypes: ArchetypeDefinition[]
) {
  let best = archetypes[0];
  let bestDist = Infinity;
  for (const a of archetypes) {
    let dist = 0;
    for (const k of COMPETENCY_KEYS) {
      const sig = a.signature[k];
      if (sig == null) continue;
      dist += Math.pow(sig - current[k], 2);
    }
    if (dist < bestDist) {
      bestDist = dist;
      best = a;
    }
  }
  // Return without the internal signature field.
  const { signature: _signature, ...archetype } = best;
  void _signature;
  return archetype;
}

function budgetFits(cert: Certification, budget: BudgetBand | ""): boolean {
  if (!budget || budget === "flexible") return true;
  return BUDGET_ORDER[cert.budgetBand] <= BUDGET_ORDER[budget];
}

function feasibilityForExperience(cert: Certification, exp: ExperienceLevel | ""): number {
  const level = SENIORITY[(exp || "mid") as ExperienceLevel];
  const diff = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }[cert.difficulty];
  // Best fit when difficulty roughly matches or is one step above the learner.
  const delta = diff - level;
  if (delta <= 0) return 1; // comfortably within reach
  if (delta === 1) return 0.9;
  if (delta === 2) return 0.65;
  return 0.4;
}

function scoreCertifications(
  answers: AssessmentAnswers,
  gaps: SkillGap[],
  certs: Certification[]
): ScoredCertification[] {
  const gapByKey = Object.fromEntries(gaps.map((g) => [g.key, g.gap])) as Record<CompetencyKey, number>;
  const totalGap = gaps.reduce((s, g) => s + g.gap, 0) || 1;
  const targetIndustry = answers.targetIndustry || answers.industry;

  const scored = certs.map((cert) => {
    // 1. Gap coverage — how much of what the user lacks this builds (0–45).
    let coverage = 0;
    for (const k of COMPETENCY_KEYS) {
      const build = cert.builds[k] ?? 0;
      coverage += build * gapByKey[k];
    }
    const coverageScore = Math.min(45, (coverage / totalGap) * 90);

    // 2. Industry alignment (0–25).
    let industryScore = 6;
    if (cert.industry === targetIndustry) industryScore = 25;
    else if (cert.industry === answers.industry) industryScore = 14;

    // 3. Feasibility vs experience (0–12).
    const feasibility = feasibilityForExperience(cert, answers.experience) * 12;

    // 4. Budget fit (0–8).
    const budgetScore = budgetFits(cert, answers.budget) ? 8 : 0;

    // 5. Salary ambition alignment (0–6).
    const salaryScore = Math.min(6, (cert.salaryImpact / 35) * 6 * (answers.salaryGoal >= 20 ? 1 : 0.7));

    // 6. Market signal — Saudi relevance & rating (0–4).
    const marketScore = (cert.saudiRelevance / 100) * 2 + (cert.rating / 5) * 2;

    const match = clamp(
      round(coverageScore + industryScore + feasibility + budgetScore + salaryScore + marketScore)
    );

    return { cert, match, rawFeasibility: feasibility / 12, coverage };
  });

  scored.sort((a, b) => b.match - a.match);
  const top = scored.slice(0, 6);

  return top.map((entry, idx) => {
    const priority: Priority = derivePriority(entry.cert, entry.rawFeasibility, idx);
    return {
      cert: entry.cert,
      match: entry.match,
      priority,
      reason: buildReason(entry.cert, gaps, answers),
    };
  });
}

function derivePriority(cert: Certification, feasibility: number, rank: number): Priority {
  const startNow = feasibility >= 0.85 && rank < 3;
  if (startNow) return "now";
  if (cert.difficulty === "expert" || feasibility < 0.6) return "later";
  if (rank < 4) return "next";
  return "later";
}

function buildReason(cert: Certification, gaps: SkillGap[], answers: AssessmentAnswers) {
  // Find the biggest gap this cert addresses.
  let topKey: CompetencyKey | null = null;
  let topContribution = 0;
  for (const g of gaps) {
    const contribution = (cert.builds[g.key] ?? 0) * g.gap;
    if (contribution > topContribution) {
      topContribution = contribution;
      topKey = g.key;
    }
  }
  const industryMatch = cert.industry === (answers.targetIndustry || answers.industry);
  const en =
    topKey && topContribution > 0
      ? `Closes your ${LABELS_EN[topKey]} gap${industryMatch ? " and fits your target field" : ""}.`
      : industryMatch
        ? "Strongly aligned with your target field."
        : "A high-value credential for your profile.";
  const ar =
    topKey && topContribution > 0
      ? `يغلق فجوتك في ${LABELS_AR[topKey]}${industryMatch ? " ويناسب مجالك المستهدف" : ""}.`
      : industryMatch
        ? "متوافق بقوة مع مجالك المستهدف."
        : "شهادة عالية القيمة لملفك المهني.";
  return { en, ar };
}

const LABELS_EN: Record<CompetencyKey, string> = {
  leadership: "leadership",
  technical: "technical",
  business: "business & strategy",
  aiData: "AI & data",
  communication: "communication",
  project: "project delivery",
};
const LABELS_AR: Record<CompetencyKey, string> = {
  leadership: "القيادة",
  technical: "المهارات التقنية",
  business: "الأعمال والاستراتيجية",
  aiData: "الذكاء الاصطناعي والبيانات",
  communication: "التواصل",
  project: "إدارة المشاريع",
};

function projectSalaryGrowth(recs: ScoredCertification[]): number {
  const active = recs.filter((r) => r.priority !== "later").slice(0, 3);
  if (active.length === 0) return recs[0]?.cert.salaryImpact ?? 0;
  // Diminishing returns when stacking certifications.
  const factors = [1, 0.55, 0.3];
  let total = 0;
  active.forEach((r, i) => {
    total += r.cert.salaryImpact * (factors[i] ?? 0.2);
  });
  return clamp(round(total), 0, 60);
}

function estimateTimeline(recs: ScoredCertification[], weeklyHours: number): number {
  const active = recs.filter((r) => r.priority === "now" || r.priority === "next");
  const totalWeeks = active.reduce((s, r) => s + r.cert.durationWeeks, 0);
  // A "durationWeeks" assumes ~10 study hrs/week; rescale to the learner's pace.
  const scaled = totalWeeks * (10 / Math.max(2, weeklyHours));
  return Math.max(1, round(scaled / 4.345)); // months
}

function buildRoadmap(
  answers: AssessmentAnswers,
  recs: ScoredCertification[],
  weeklyHours: number,
  locale: "en" | "ar"
): RoadmapMilestone[] {
  void locale;
  const milestones: RoadmapMilestone[] = [];
  let month = 0;
  let order = 0;

  milestones.push({
    order: order++,
    kind: "current",
    monthOffset: 0,
    title: {
      en: answers.currentRole || "Where you are now",
      ar: answers.currentRole || "موقعك الحالي",
    },
    detail: {
      en: "Your current role and skill baseline.",
      ar: "دورك الحالي وخط الأساس لمهاراتك.",
    },
  });

  const nowCerts = recs.filter((r) => r.priority === "now").slice(0, 2);
  const nextCerts = recs.filter((r) => r.priority === "next").slice(0, 2);

  for (const r of nowCerts) {
    const months = Math.max(1, round((r.cert.durationWeeks * (10 / Math.max(2, weeklyHours))) / 4.345));
    month += months;
    milestones.push({
      order: order++,
      kind: "certification",
      monthOffset: month,
      title: { en: `Earn ${r.cert.abbr}`, ar: `احصل على ${r.cert.abbr}` },
      detail: r.cert.summary,
    });
  }

  milestones.push({
    order: order++,
    kind: "skill",
    monthOffset: month + 1,
    title: { en: "Apply & consolidate", ar: "التطبيق والترسيخ" },
    detail: {
      en: "Put new skills to work on real projects to lock in the gains.",
      ar: "طبّق مهاراتك الجديدة في مشاريع حقيقية لترسيخ المكتسبات.",
    },
  });

  for (const r of nextCerts) {
    const months = Math.max(1, round((r.cert.durationWeeks * (10 / Math.max(2, weeklyHours))) / 4.345));
    month += months + 1;
    milestones.push({
      order: order++,
      kind: "certification",
      monthOffset: month,
      title: { en: `Advance with ${r.cert.abbr}`, ar: `تقدّم مع ${r.cert.abbr}` },
      detail: r.cert.summary,
    });
  }

  milestones.push({
    order: order++,
    kind: "role",
    monthOffset: month + 2,
    title: {
      en: answers.targetRole || "Your next role",
      ar: answers.targetRole || "دورك القادم",
    },
    detail: {
      en: "Positioned for the promotion or move you're aiming for.",
      ar: "جاهز للترقية أو الانتقال الذي تطمح إليه.",
    },
  });

  milestones.push({
    order: order++,
    kind: "goal",
    monthOffset: Math.max(month + 3, answers.timeframeMonths || month + 3),
    title: { en: "Long-term ambition", ar: "الطموح بعيد المدى" },
    detail: {
      en: "Leadership track and sustained career growth.",
      ar: "مسار قيادي ونمو مهني مستدام.",
    },
  });

  return milestones;
}

/** Catalog the engine scores against — injected so it works over live data. */
export interface AssessmentCatalog {
  certifications: Certification[];
  archetypes: ArchetypeDefinition[];
}

/**
 * The single entry point. Deterministic given the same answers + catalog, so
 * results are stable and testable. Swap the body for a Claude API call to go
 * live; the catalog is already loaded from Supabase by the caller.
 */
export function generateAssessment(
  answers: AssessmentAnswers,
  catalog: AssessmentCatalog,
  locale: "en" | "ar" = "en"
): AssessmentResult {
  const current = currentProfile(answers);
  const target = targetProfile(answers);
  const skillGaps = computeSkillGaps(current, target);
  const readinessIndex = computeReadiness(current, target, answers);
  const weeklyHours = WEEKLY_HOURS[(answers.studyTime || "5to10") as StudyTimeBand];

  const recommendations = scoreCertifications(answers, skillGaps, catalog.certifications);

  const strengths = [...skillGaps]
    .filter((g) => g.current >= 55)
    .sort((a, b) => b.current - a.current)
    .slice(0, 3);

  const weaknesses = [...skillGaps]
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  return {
    readinessIndex,
    readinessBand: readinessBand(readinessIndex),
    skillGaps,
    strengths: strengths.length ? strengths : [...skillGaps].sort((a, b) => b.current - a.current).slice(0, 2),
    weaknesses,
    archetype: pickArchetype(current, catalog.archetypes),
    recommendations,
    salaryGrowth: projectSalaryGrowth(recommendations),
    estimatedMonths: estimateTimeline(recommendations, weeklyHours),
    weeklyHours,
    roadmap: buildRoadmap(answers, recommendations, weeklyHours, locale),
  };
}
