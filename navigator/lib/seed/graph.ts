/**
 * Career Knowledge Graph seed (module 0002): job families, skill hierarchy,
 * role architecture, and 3 real promotion ladders (HR/L&D, Data/AI, Security).
 * Extends lib/seed/catalog.ts. Used by both the seed script and the graph
 * query-layer fallback, so the two never drift.
 */
import type { SkillKind, RoleLevel } from "./catalog";

export interface SeedFamily {
  slug: string;
  name_en: string;
  name_ar: string;
  industry: string;
  category: string;
  sort_order: number;
}

export interface SeedGraphSkill {
  slug: string;
  name_en: string;
  name_ar: string;
  kind: SkillKind;
  category: string;
  parent?: string; // parent skill slug
  future_demand: number;
}

export interface SeedGraphRole {
  slug: string;
  title_en: string;
  title_ar: string;
  level: RoleLevel;
  category: string;
  family: string;
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

export interface SeedProgression {
  from: string;
  to: string;
  years: number;
}

export const JOB_FAMILIES: SeedFamily[] = [
  { slug: "learning-development", name_en: "Learning & Development", name_ar: "التعلم والتطوير", industry: "hr", category: "hr", sort_order: 0 },
  { slug: "talent-management", name_en: "Talent Management", name_ar: "إدارة المواهب", industry: "hr", category: "hr", sort_order: 1 },
  { slug: "data-ai", name_en: "Data & AI", name_ar: "البيانات والذكاء الاصطناعي", industry: "data_ai", category: "data_ai", sort_order: 2 },
  { slug: "cybersecurity", name_en: "Cybersecurity", name_ar: "الأمن السيبراني", industry: "cybersecurity", category: "cybersecurity", sort_order: 3 },
  { slug: "cloud-infrastructure", name_en: "Cloud & Infrastructure", name_ar: "السحابة والبنية التحتية", industry: "cloud", category: "cloud", sort_order: 4 },
  { slug: "software-engineering", name_en: "Software Engineering", name_ar: "هندسة البرمجيات", industry: "technology", category: "software", sort_order: 5 },
  { slug: "project-delivery", name_en: "Project Delivery", name_ar: "تنفيذ المشاريع", industry: "project_management", category: "project_management", sort_order: 6 },
  { slug: "finance", name_en: "Finance", name_ar: "المالية", industry: "finance", category: "finance", sort_order: 7 },
];

/** New child/root skills that complete the hierarchy (roots have no parent). */
export const GRAPH_SKILLS: SeedGraphSkill[] = [
  // Leadership cluster (root = existing "leadership")
  { slug: "coaching", name_en: "Coaching", name_ar: "التدريب", kind: "leadership", category: "hr", parent: "leadership", future_demand: 80 },
  { slug: "mentoring", name_en: "Mentoring", name_ar: "الإرشاد", kind: "leadership", category: "hr", parent: "leadership", future_demand: 76 },
  { slug: "feedback", name_en: "Feedback", name_ar: "التغذية الراجعة", kind: "leadership", category: "hr", parent: "leadership", future_demand: 74 },
  { slug: "delegation", name_en: "Delegation", name_ar: "التفويض", kind: "leadership", category: "hr", parent: "leadership", future_demand: 70 },
  { slug: "performance-management", name_en: "Performance Management", name_ar: "إدارة الأداء", kind: "leadership", category: "hr", parent: "leadership", future_demand: 78 },
  { slug: "team-development", name_en: "Team Development", name_ar: "تطوير الفريق", kind: "leadership", category: "hr", parent: "leadership", future_demand: 77 },
  // Artificial Intelligence cluster (new root)
  { slug: "artificial-intelligence", name_en: "Artificial Intelligence", name_ar: "الذكاء الاصطناعي", kind: "ai_data", category: "data_ai", future_demand: 97 },
  { slug: "prompt-engineering", name_en: "Prompt Engineering", name_ar: "هندسة الأوامر", kind: "ai_data", category: "data_ai", parent: "artificial-intelligence", future_demand: 95 },
  { slug: "llm", name_en: "Large Language Models", name_ar: "نماذج اللغة الكبيرة", kind: "ai_data", category: "data_ai", parent: "artificial-intelligence", future_demand: 94 },
  { slug: "ai-governance", name_en: "AI Governance", name_ar: "حوكمة الذكاء الاصطناعي", kind: "business", category: "data_ai", parent: "artificial-intelligence", future_demand: 90 },
  { slug: "ai-ethics", name_en: "AI Ethics", name_ar: "أخلاقيات الذكاء الاصطناعي", kind: "business", category: "data_ai", parent: "artificial-intelligence", future_demand: 88 },
  // Data Science cluster (new root)
  { slug: "data-science", name_en: "Data Science", name_ar: "علم البيانات", kind: "ai_data", category: "data_ai", future_demand: 92 },
];

/** parent overrides for EXISTING catalog skills (childSlug -> parentSlug). */
export const SKILL_PARENTS: Record<string, string> = {
  "people-management": "leadership",
  "change-management": "leadership",
  "machine-learning": "artificial-intelligence",
  "deep-learning": "artificial-intelligence",
  "generative-ai": "artificial-intelligence",
  "data-analysis": "data-science",
  "data-engineering": "data-science",
  "statistics": "data-science",
  "data-visualization": "data-science",
  "sql": "data-science",
};

/** New roles that complete the 3 ladders (existing roles reused from catalog). */
export const GRAPH_ROLES: SeedGraphRole[] = [
  {
    slug: "learning-specialist", title_en: "Learning Specialist", title_ar: "أخصائي تعلم", level: "entry", category: "hr",
    family: "learning-development", median_salary_usd: 55000, saudi_demand: 80, global_demand: 78, future_demand: 79, typical_experience_years: 1,
    summary_en: "Designs and delivers learning programmes and supports L&D operations.",
    summary_ar: "يصمم ويقدّم برامج التعلم ويدعم عمليات التعلم والتطوير.",
    responsibilities: [
      { en: "Build and facilitate training content", ar: "إعداد المحتوى التدريبي وتيسيره" },
      { en: "Support the learning management system", ar: "دعم نظام إدارة التعلم" },
      { en: "Measure learning effectiveness", ar: "قياس فاعلية التعلم" },
    ],
    skills: ["learning-development", "communication", "coaching"],
  },
  {
    slug: "senior-learning-specialist", title_en: "Senior Learning Specialist", title_ar: "أخصائي تعلم أول", level: "mid", category: "hr",
    family: "learning-development", median_salary_usd: 72000, saudi_demand: 80, global_demand: 79, future_demand: 80, typical_experience_years: 4,
    summary_en: "Owns learning programmes end-to-end and mentors specialists.",
    summary_ar: "يدير برامج التعلم بالكامل ويوجّه الأخصائيين.",
    responsibilities: [
      { en: "Own programme design and rollout", ar: "امتلاك تصميم البرامج وإطلاقها" },
      { en: "Coach junior specialists", ar: "توجيه الأخصائيين المبتدئين" },
      { en: "Partner with the business on needs", ar: "الشراكة مع الأعمال في تحديد الاحتياجات" },
    ],
    skills: ["learning-development", "coaching", "communication", "people-management"],
  },
  {
    slug: "head-of-learning", title_en: "Head of Learning", title_ar: "رئيس التعلم", level: "lead", category: "hr",
    family: "learning-development", median_salary_usd: 135000, saudi_demand: 80, global_demand: 78, future_demand: 80, typical_experience_years: 10,
    summary_en: "Leads the learning function and its strategy across the organisation.",
    summary_ar: "يقود وظيفة التعلم واستراتيجيتها عبر المؤسسة.",
    responsibilities: [
      { en: "Set the learning strategy", ar: "وضع استراتيجية التعلم" },
      { en: "Lead the L&D team and budget", ar: "قيادة فريق التعلم والموازنة" },
      { en: "Align learning to business goals", ar: "مواءمة التعلم مع أهداف الأعمال" },
    ],
    skills: ["learning-development", "leadership", "strategic-thinking", "people-management", "org-development"],
  },
  {
    slug: "clo", title_en: "Chief Learning Officer", title_ar: "الرئيس التنفيذي للتعلم", level: "executive", category: "hr",
    family: "learning-development", median_salary_usd: 205000, saudi_demand: 76, global_demand: 78, future_demand: 82, typical_experience_years: 15,
    summary_en: "Owns enterprise capability and the learning culture at C-level.",
    summary_ar: "يمتلك قدرات المؤسسة وثقافة التعلم على مستوى القيادة التنفيذية.",
    responsibilities: [
      { en: "Own enterprise capability strategy", ar: "امتلاك استراتيجية قدرات المؤسسة" },
      { en: "Advise the executive team", ar: "تقديم المشورة للفريق التنفيذي" },
      { en: "Drive the learning culture", ar: "قيادة ثقافة التعلم" },
    ],
    skills: ["leadership", "org-development", "strategic-thinking", "learning-development", "talent-management"],
  },
  {
    slug: "cybersecurity-analyst", title_en: "Cybersecurity Analyst", title_ar: "محلل أمن سيبراني", level: "entry", category: "cybersecurity",
    family: "cybersecurity", median_salary_usd: 72000, saudi_demand: 86, global_demand: 88, future_demand: 90, typical_experience_years: 1,
    summary_en: "Monitors, triages and responds to security events.",
    summary_ar: "يراقب الأحداث الأمنية ويصنّفها ويستجيب لها.",
    responsibilities: [
      { en: "Monitor alerts and triage incidents", ar: "مراقبة التنبيهات وتصنيف الحوادث" },
      { en: "Run vulnerability scans", ar: "إجراء فحوصات الثغرات" },
      { en: "Document and report findings", ar: "توثيق النتائج ورفع التقارير" },
    ],
    skills: ["network-security", "incident-response", "compliance"],
  },
  {
    slug: "security-manager", title_en: "Security Manager", title_ar: "مدير أمن", level: "lead", category: "cybersecurity",
    family: "cybersecurity", median_salary_usd: 150000, saudi_demand: 84, global_demand: 86, future_demand: 88, typical_experience_years: 10,
    summary_en: "Leads the security team, programme and risk posture.",
    summary_ar: "يقود فريق الأمن وبرنامجه ووضع المخاطر.",
    responsibilities: [
      { en: "Lead the security programme", ar: "قيادة برنامج الأمن" },
      { en: "Own risk and compliance posture", ar: "امتلاك وضع المخاطر والامتثال" },
      { en: "Manage the security team", ar: "إدارة فريق الأمن" },
    ],
    skills: ["security-governance", "risk-management", "leadership", "people-management"],
  },
];

/** Detail overlay for EXISTING catalog roles used in the ladders. */
export const ROLE_DETAILS: Record<
  string,
  { family: string; typical_experience_years: number; summary_en: string; summary_ar: string; responsibilities: { en: string; ar: string }[] }
> = {
  "ld-manager": {
    family: "learning-development", typical_experience_years: 7,
    summary_en: "Manages learning programmes, the team and stakeholders.",
    summary_ar: "يدير برامج التعلم والفريق وأصحاب المصلحة.",
    responsibilities: [
      { en: "Manage the L&D roadmap", ar: "إدارة خارطة طريق التعلم" },
      { en: "Lead a team of specialists", ar: "قيادة فريق من الأخصائيين" },
    ],
  },
  "data-analyst": {
    family: "data-ai", typical_experience_years: 1,
    summary_en: "Turns data into decisions with analysis and dashboards.",
    summary_ar: "يحوّل البيانات إلى قرارات عبر التحليل ولوحات المعلومات.",
    responsibilities: [
      { en: "Clean and analyse datasets", ar: "تنظيف البيانات وتحليلها" },
      { en: "Build reports and dashboards", ar: "بناء التقارير ولوحات المعلومات" },
    ],
  },
  "data-scientist": {
    family: "data-ai", typical_experience_years: 4,
    summary_en: "Builds models and experiments to answer business questions.",
    summary_ar: "يبني النماذج والتجارب للإجابة عن أسئلة الأعمال.",
    responsibilities: [
      { en: "Design models and experiments", ar: "تصميم النماذج والتجارب" },
      { en: "Communicate insights to stakeholders", ar: "إيصال الرؤى لأصحاب المصلحة" },
    ],
  },
  "ml-engineer": {
    family: "data-ai", typical_experience_years: 5,
    summary_en: "Ships and operates machine-learning systems in production.",
    summary_ar: "ينشر أنظمة التعلم الآلي ويشغّلها في الإنتاج.",
    responsibilities: [
      { en: "Build and deploy ML pipelines", ar: "بناء ونشر مسارات التعلم الآلي" },
      { en: "Monitor and improve models", ar: "مراقبة النماذج وتحسينها" },
    ],
  },
  "ai-strategist": {
    family: "data-ai", typical_experience_years: 9,
    summary_en: "Leads responsible AI adoption and its business value.",
    summary_ar: "يقود التبني المسؤول للذكاء الاصطناعي وقيمته التجارية.",
    responsibilities: [
      { en: "Frame AI use-cases and ROI", ar: "صياغة حالات استخدام الذكاء الاصطناعي وعائدها" },
      { en: "Govern AI risk and ethics", ar: "حوكمة مخاطر وأخلاقيات الذكاء الاصطناعي" },
    ],
  },
  "security-engineer": {
    family: "cybersecurity", typical_experience_years: 4,
    summary_en: "Designs and hardens systems against threats.",
    summary_ar: "يصمم الأنظمة ويحصّنها ضد التهديدات.",
    responsibilities: [
      { en: "Engineer security controls", ar: "هندسة الضوابط الأمنية" },
      { en: "Lead incident response", ar: "قيادة الاستجابة للحوادث" },
    ],
  },
  "ciso": {
    family: "cybersecurity", typical_experience_years: 15,
    summary_en: "Owns enterprise security strategy and governance at C-level.",
    summary_ar: "يمتلك استراتيجية وحوكمة أمن المؤسسة على مستوى القيادة.",
    responsibilities: [
      { en: "Set enterprise security strategy", ar: "وضع استراتيجية أمن المؤسسة" },
      { en: "Govern risk across the business", ar: "حوكمة المخاطر عبر الأعمال" },
    ],
  },
};

/** The 3 promotion ladders as role→role edges. */
export const PROGRESSIONS: SeedProgression[] = [
  // HR / L&D
  { from: "learning-specialist", to: "senior-learning-specialist", years: 2 },
  { from: "senior-learning-specialist", to: "ld-manager", years: 3 },
  { from: "ld-manager", to: "head-of-learning", years: 3 },
  { from: "head-of-learning", to: "clo", years: 4 },
  // Data / AI
  { from: "data-analyst", to: "data-scientist", years: 3 },
  { from: "data-scientist", to: "ml-engineer", years: 2 },
  { from: "ml-engineer", to: "ai-strategist", years: 3 },
  // Cybersecurity
  { from: "cybersecurity-analyst", to: "security-engineer", years: 2 },
  { from: "security-engineer", to: "security-manager", years: 3 },
  { from: "security-manager", to: "ciso", years: 4 },
];
