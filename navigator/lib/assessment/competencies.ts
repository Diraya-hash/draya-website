import type { LocalizedText } from "./types";

/** The six competency dimensions the assessment measures. */
export const COMPETENCY_KEYS = [
  "leadership",
  "technical",
  "business",
  "aiData",
  "communication",
  "project",
] as const;

export type CompetencyKey = (typeof COMPETENCY_KEYS)[number];

export interface Competency {
  key: CompetencyKey;
  label: LocalizedText;
  description: LocalizedText;
  icon: string; // lucide icon name
}

export const COMPETENCIES: Record<CompetencyKey, Competency> = {
  leadership: {
    key: "leadership",
    label: { en: "Leadership", ar: "القيادة" },
    description: {
      en: "Guiding teams, decision-making, and driving change.",
      ar: "قيادة الفرق واتخاذ القرار وإحداث التغيير.",
    },
    icon: "Compass",
  },
  technical: {
    key: "technical",
    label: { en: "Technical", ar: "المهارات التقنية" },
    description: {
      en: "Core domain and engineering craft.",
      ar: "الإتقان التقني والمعرفة المتخصصة في المجال.",
    },
    icon: "Cpu",
  },
  business: {
    key: "business",
    label: { en: "Business & Strategy", ar: "الأعمال والاستراتيجية" },
    description: {
      en: "Commercial acumen, finance, and strategic thinking.",
      ar: "الفطنة التجارية والمالية والتفكير الاستراتيجي.",
    },
    icon: "TrendingUp",
  },
  aiData: {
    key: "aiData",
    label: { en: "AI & Data", ar: "الذكاء الاصطناعي والبيانات" },
    description: {
      en: "Working with data, analytics, and AI tooling.",
      ar: "التعامل مع البيانات والتحليلات وأدوات الذكاء الاصطناعي.",
    },
    icon: "Sparkles",
  },
  communication: {
    key: "communication",
    label: { en: "Communication", ar: "التواصل" },
    description: {
      en: "Influence, storytelling, and stakeholder management.",
      ar: "التأثير ورواية القصص وإدارة أصحاب المصلحة.",
    },
    icon: "MessagesSquare",
  },
  project: {
    key: "project",
    label: { en: "Project Delivery", ar: "إدارة المشاريع" },
    description: {
      en: "Planning, execution, and delivering outcomes.",
      ar: "التخطيط والتنفيذ وتحقيق النتائج.",
    },
    icon: "ListChecks",
  },
};

export const COMPETENCY_LIST: Competency[] = COMPETENCY_KEYS.map(
  (k) => COMPETENCIES[k]
);
