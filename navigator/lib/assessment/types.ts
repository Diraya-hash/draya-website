import type { CompetencyKey } from "./competencies";

export interface LocalizedText {
  en: string;
  ar: string;
}

export type Industry =
  | "hr"
  | "technology"
  | "finance"
  | "data_ai"
  | "cybersecurity"
  | "project_management"
  | "marketing"
  | "healthcare"
  | "supply_chain"
  | "cloud";

export type ExperienceLevel = "student" | "junior" | "mid" | "senior" | "lead" | "exec";

export type EducationLevel = "highschool" | "diploma" | "bachelor" | "master" | "phd";

export type LearningStyle = "visual" | "reading" | "handson" | "social";

export type LearningMethod = "self_paced" | "bootcamp" | "instructor" | "blended";

export type BudgetBand = "low" | "medium" | "high" | "flexible";

export type StudyTimeBand = "under5" | "5to10" | "10to20" | "over20";

/** Raw answers collected from the wizard. */
export interface AssessmentAnswers {
  name: string;
  currentRole: string;
  industry: Industry | "";
  experience: ExperienceLevel | "";
  education: EducationLevel | "";

  targetRole: string;
  targetIndustry: Industry | "";
  timeframeMonths: number; // desired horizon to reach the goal
  salaryGoal: number; // % increase target

  /** Self-rated 0–5 for each competency. */
  skills: Record<CompetencyKey, number>;

  learningStyle: LearningStyle | "";
  learningMethod: LearningMethod | "";
  budget: BudgetBand | "";
  studyTime: StudyTimeBand | "";

  interests: string[]; // interest tag ids
}

export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";
export type Priority = "now" | "next" | "later";

export interface Certification {
  id: string;
  name: string;
  provider: string;
  abbr: string;
  industry: Industry;
  difficulty: Difficulty;
  /** Which competencies this certification builds, weighted 0–1. */
  builds: Partial<Record<CompetencyKey, number>>;
  durationWeeks: number;
  examCost: number; // USD
  budgetBand: BudgetBand;
  salaryImpact: number; // % uplift, typical
  saudiRelevance: number; // 0–100
  globalRelevance: number; // 0–100
  rating: number; // 0–5
  reviews: number;
  summary: LocalizedText;
  outcomes: LocalizedText[];
  tags: string[];
}

export interface ScoredCertification {
  cert: Certification;
  match: number; // 0–100 compatibility
  priority: Priority;
  reason: LocalizedText;
}

export interface SkillGap {
  key: CompetencyKey;
  current: number; // 0–100
  target: number; // 0–100
  gap: number; // target - current, clamped >= 0
}

export interface CareerArchetype {
  id: string;
  name: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  strengths: LocalizedText[];
  watchouts: LocalizedText[];
  futureRoles: LocalizedText[];
  icon: string;
  gradient: string; // tailwind gradient classes
}

export interface RoadmapMilestone {
  order: number;
  title: LocalizedText;
  detail: LocalizedText;
  kind: "current" | "certification" | "skill" | "role" | "goal";
  monthOffset: number;
}

export interface AssessmentResult {
  readinessIndex: number; // 0–100
  readinessBand: "emerging" | "developing" | "proficient" | "advanced";
  skillGaps: SkillGap[];
  strengths: SkillGap[];
  weaknesses: SkillGap[];
  archetype: CareerArchetype;
  recommendations: ScoredCertification[];
  salaryGrowth: number; // projected % uplift
  estimatedMonths: number;
  weeklyHours: number;
  roadmap: RoadmapMilestone[];
}
