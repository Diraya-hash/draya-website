import type { LocalizedText } from "./types";

export interface Option<T extends string = string> {
  value: T;
  label: LocalizedText;
  hint?: LocalizedText;
  icon?: string;
}

export const INDUSTRIES: Option[] = [
  { value: "hr", label: { en: "Human Resources", ar: "الموارد البشرية" }, icon: "Users" },
  { value: "technology", label: { en: "Technology & Software", ar: "التقنية والبرمجيات" }, icon: "Code2" },
  { value: "finance", label: { en: "Finance & Accounting", ar: "المالية والمحاسبة" }, icon: "Landmark" },
  { value: "data_ai", label: { en: "Data & AI", ar: "البيانات والذكاء الاصطناعي" }, icon: "Sparkles" },
  { value: "cybersecurity", label: { en: "Cybersecurity", ar: "الأمن السيبراني" }, icon: "ShieldCheck" },
  { value: "project_management", label: { en: "Project Management", ar: "إدارة المشاريع" }, icon: "ListChecks" },
  { value: "marketing", label: { en: "Marketing & Growth", ar: "التسويق والنمو" }, icon: "Megaphone" },
  { value: "healthcare", label: { en: "Healthcare", ar: "الرعاية الصحية" }, icon: "HeartPulse" },
  { value: "supply_chain", label: { en: "Supply Chain & Procurement", ar: "سلسلة الإمداد والمشتريات" }, icon: "Truck" },
  { value: "cloud", label: { en: "Cloud & Infrastructure", ar: "السحابة والبنية التحتية" }, icon: "Cloud" },
];

export const EXPERIENCE_LEVELS: Option[] = [
  { value: "student", label: { en: "Student / Entry", ar: "طالب / مبتدئ" }, hint: { en: "0–1 years", ar: "0–1 سنة" } },
  { value: "junior", label: { en: "Junior", ar: "مبتدئ محترف" }, hint: { en: "1–3 years", ar: "1–3 سنوات" } },
  { value: "mid", label: { en: "Mid-level", ar: "متوسط" }, hint: { en: "3–6 years", ar: "3–6 سنوات" } },
  { value: "senior", label: { en: "Senior", ar: "خبير" }, hint: { en: "6–10 years", ar: "6–10 سنوات" } },
  { value: "lead", label: { en: "Lead / Manager", ar: "قائد / مدير" }, hint: { en: "10–15 years", ar: "10–15 سنة" } },
  { value: "exec", label: { en: "Executive", ar: "تنفيذي" }, hint: { en: "15+ years", ar: "أكثر من 15 سنة" } },
];

export const EDUCATION_LEVELS: Option[] = [
  { value: "highschool", label: { en: "High school", ar: "الثانوية" } },
  { value: "diploma", label: { en: "Diploma", ar: "دبلوم" } },
  { value: "bachelor", label: { en: "Bachelor's", ar: "بكالوريوس" } },
  { value: "master", label: { en: "Master's", ar: "ماجستير" } },
  { value: "phd", label: { en: "PhD", ar: "دكتوراه" } },
];

export const LEARNING_STYLES: Option[] = [
  { value: "visual", label: { en: "Visual", ar: "بصري" }, hint: { en: "Videos & diagrams", ar: "فيديوهات ورسوم" }, icon: "Eye" },
  { value: "reading", label: { en: "Reading", ar: "قرائي" }, hint: { en: "Books & articles", ar: "كتب ومقالات" }, icon: "BookOpen" },
  { value: "handson", label: { en: "Hands-on", ar: "تطبيقي" }, hint: { en: "Labs & projects", ar: "مختبرات ومشاريع" }, icon: "Wrench" },
  { value: "social", label: { en: "Social", ar: "جماعي" }, hint: { en: "Cohorts & mentors", ar: "مجموعات وموجهون" }, icon: "Users" },
];

export const LEARNING_METHODS: Option[] = [
  { value: "self_paced", label: { en: "Self-paced online", ar: "ذاتي عبر الإنترنت" }, icon: "MousePointerClick" },
  { value: "bootcamp", label: { en: "Intensive bootcamp", ar: "معسكر مكثف" }, icon: "Zap" },
  { value: "instructor", label: { en: "Instructor-led", ar: "بإشراف مدرب" }, icon: "GraduationCap" },
  { value: "blended", label: { en: "Blended", ar: "مدمج" }, icon: "Layers" },
];

export const BUDGET_BANDS: Option[] = [
  { value: "low", label: { en: "Under $300", ar: "أقل من 300$" } },
  { value: "medium", label: { en: "$300 – $700", ar: "300$ – 700$" } },
  { value: "high", label: { en: "$700 – $1,500", ar: "700$ – 1500$" } },
  { value: "flexible", label: { en: "Flexible", ar: "مرن" } },
];

export const STUDY_TIME_BANDS: Option[] = [
  { value: "under5", label: { en: "Under 5 hrs/week", ar: "أقل من 5 ساعات/أسبوع" } },
  { value: "5to10", label: { en: "5–10 hrs/week", ar: "5–10 ساعات/أسبوع" } },
  { value: "10to20", label: { en: "10–20 hrs/week", ar: "10–20 ساعة/أسبوع" } },
  { value: "over20", label: { en: "20+ hrs/week", ar: "أكثر من 20 ساعة/أسبوع" } },
];

export const INTERESTS: Option[] = [
  { value: "leading_people", label: { en: "Leading people", ar: "قيادة الأفراد" }, icon: "Users" },
  { value: "building_products", label: { en: "Building products", ar: "بناء المنتجات" }, icon: "Hammer" },
  { value: "working_with_data", label: { en: "Working with data", ar: "العمل مع البيانات" }, icon: "BarChart3" },
  { value: "ai_automation", label: { en: "AI & automation", ar: "الذكاء الاصطناعي والأتمتة" }, icon: "Sparkles" },
  { value: "strategy", label: { en: "Strategy & growth", ar: "الاستراتيجية والنمو" }, icon: "TrendingUp" },
  { value: "security", label: { en: "Security & risk", ar: "الأمن والمخاطر" }, icon: "ShieldCheck" },
  { value: "delivery", label: { en: "Delivery & operations", ar: "التنفيذ والعمليات" }, icon: "ListChecks" },
  { value: "customer", label: { en: "Customer experience", ar: "تجربة العميل" }, icon: "Heart" },
];
