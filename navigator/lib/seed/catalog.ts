/**
 * Curated, REAL seed catalog for testing (Infrastructure module 0001).
 *
 * Names, providers and categories are real, well-known credentials. Numeric
 * fields (price, duration, salary impact, demand) are reasonable APPROXIMATIONS
 * and are seeded with `verified = false` + `source = 'seed:curated'`. The Admin
 * CMS / Import System promotes records to verified with accurate values.
 *
 * Kept intentionally small (~20 providers / ~90 certs / ~50 skills / ~20 roles).
 * The seed script derives career_level, salary_impact, etc. from difficulty.
 */

export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";
export type SkillKind =
  | "technical" | "leadership" | "business" | "ai_data"
  | "communication" | "project" | "soft" | "domain";
export type RoleLevel = "entry" | "mid" | "senior" | "lead" | "executive";

export interface SeedCategory {
  slug: string;
  name_en: string;
  name_ar: string;
  icon: string;
}

export interface SeedSkill {
  slug: string;
  name_en: string;
  name_ar: string;
  kind: SkillKind;
  category: string;
  future_demand: number; // 0..100
}

export interface SeedProvider {
  slug: string;
  name: string;
  website?: string;
}

export interface SeedRole {
  slug: string;
  title_en: string;
  title_ar: string;
  level: RoleLevel;
  category: string;
  median_salary_usd: number;
  saudi_demand: number;
  global_demand: number;
  future_demand: number;
  skills: string[]; // skill slugs required
}

export interface SeedCert {
  name: string;
  abbr: string;
  provider: string; // provider slug
  category: string; // category slug
  difficulty: Difficulty;
  weeks: number;
  cost: number; // USD, approximate
  skills: string[]; // skill slugs taught
  tags?: string[];
}

export const CATEGORIES: SeedCategory[] = [
  { slug: "cloud", name_en: "Cloud Computing", name_ar: "الحوسبة السحابية", icon: "Cloud" },
  { slug: "cybersecurity", name_en: "Cybersecurity", name_ar: "الأمن السيبراني", icon: "ShieldCheck" },
  { slug: "data_ai", name_en: "Data & AI", name_ar: "البيانات والذكاء الاصطناعي", icon: "Sparkles" },
  { slug: "project_management", name_en: "Project Management", name_ar: "إدارة المشاريع", icon: "ListChecks" },
  { slug: "it_networking", name_en: "IT & Networking", name_ar: "تقنية المعلومات والشبكات", icon: "Cpu" },
  { slug: "software", name_en: "Software Development", name_ar: "تطوير البرمجيات", icon: "Code2" },
  { slug: "hr", name_en: "Human Resources", name_ar: "الموارد البشرية", icon: "Users" },
  { slug: "finance", name_en: "Finance & Accounting", name_ar: "المالية والمحاسبة", icon: "Landmark" },
  { slug: "marketing", name_en: "Marketing", name_ar: "التسويق", icon: "Megaphone" },
  { slug: "business_analysis", name_en: "Business Analysis", name_ar: "تحليل الأعمال", icon: "TrendingUp" },
  { slug: "itsm", name_en: "IT Service Management", name_ar: "إدارة خدمات تقنية المعلومات", icon: "Layers" },
  { slug: "erp_crm", name_en: "ERP & CRM", name_ar: "تخطيط الموارد وإدارة العملاء", icon: "Landmark" },
];

export const SKILLS: SeedSkill[] = [
  // Cloud / technical
  { slug: "cloud-architecture", name_en: "Cloud Architecture", name_ar: "هندسة السحابة", kind: "technical", category: "cloud", future_demand: 92 },
  { slug: "aws", name_en: "Amazon Web Services", name_ar: "خدمات أمازون السحابية", kind: "technical", category: "cloud", future_demand: 90 },
  { slug: "azure", name_en: "Microsoft Azure", name_ar: "مايكروسوفت أزور", kind: "technical", category: "cloud", future_demand: 88 },
  { slug: "gcp", name_en: "Google Cloud", name_ar: "جوجل كلاود", kind: "technical", category: "cloud", future_demand: 84 },
  { slug: "kubernetes", name_en: "Kubernetes", name_ar: "كوبرنيتيس", kind: "technical", category: "cloud", future_demand: 86 },
  { slug: "devops", name_en: "DevOps", name_ar: "ديف أوبس", kind: "technical", category: "cloud", future_demand: 85 },
  { slug: "networking", name_en: "Networking", name_ar: "الشبكات", kind: "technical", category: "it_networking", future_demand: 70 },
  { slug: "linux", name_en: "Linux Administration", name_ar: "إدارة لينكس", kind: "technical", category: "it_networking", future_demand: 68 },
  // Security
  { slug: "network-security", name_en: "Network Security", name_ar: "أمن الشبكات", kind: "technical", category: "cybersecurity", future_demand: 88 },
  { slug: "risk-management", name_en: "Risk Management", name_ar: "إدارة المخاطر", kind: "business", category: "cybersecurity", future_demand: 82 },
  { slug: "security-governance", name_en: "Security Governance", name_ar: "حوكمة الأمن", kind: "business", category: "cybersecurity", future_demand: 80 },
  { slug: "ethical-hacking", name_en: "Ethical Hacking", name_ar: "الاختراق الأخلاقي", kind: "technical", category: "cybersecurity", future_demand: 83 },
  { slug: "incident-response", name_en: "Incident Response", name_ar: "الاستجابة للحوادث", kind: "technical", category: "cybersecurity", future_demand: 81 },
  { slug: "compliance", name_en: "Compliance & Audit", name_ar: "الامتثال والتدقيق", kind: "business", category: "cybersecurity", future_demand: 76 },
  // Data / AI
  { slug: "data-analysis", name_en: "Data Analysis", name_ar: "تحليل البيانات", kind: "ai_data", category: "data_ai", future_demand: 89 },
  { slug: "machine-learning", name_en: "Machine Learning", name_ar: "تعلّم الآلة", kind: "ai_data", category: "data_ai", future_demand: 93 },
  { slug: "deep-learning", name_en: "Deep Learning", name_ar: "التعلم العميق", kind: "ai_data", category: "data_ai", future_demand: 90 },
  { slug: "generative-ai", name_en: "Generative AI", name_ar: "الذكاء الاصطناعي التوليدي", kind: "ai_data", category: "data_ai", future_demand: 96 },
  { slug: "data-engineering", name_en: "Data Engineering", name_ar: "هندسة البيانات", kind: "ai_data", category: "data_ai", future_demand: 88 },
  { slug: "sql", name_en: "SQL & Databases", name_ar: "قواعد البيانات وSQL", kind: "technical", category: "data_ai", future_demand: 78 },
  { slug: "data-visualization", name_en: "Data Visualization", name_ar: "تصوير البيانات", kind: "ai_data", category: "data_ai", future_demand: 79 },
  { slug: "statistics", name_en: "Statistics", name_ar: "الإحصاء", kind: "ai_data", category: "data_ai", future_demand: 74 },
  // Software
  { slug: "programming", name_en: "Programming", name_ar: "البرمجة", kind: "technical", category: "software", future_demand: 85 },
  { slug: "web-development", name_en: "Web Development", name_ar: "تطوير الويب", kind: "technical", category: "software", future_demand: 80 },
  { slug: "agile-engineering", name_en: "Agile Engineering", name_ar: "الهندسة الرشيقة", kind: "technical", category: "software", future_demand: 77 },
  { slug: "ux-design", name_en: "UX Design", name_ar: "تصميم تجربة المستخدم", kind: "technical", category: "software", future_demand: 76 },
  // Project / delivery
  { slug: "project-management", name_en: "Project Management", name_ar: "إدارة المشاريع", kind: "project", category: "project_management", future_demand: 82 },
  { slug: "agile", name_en: "Agile & Scrum", name_ar: "أجايل وسكرم", kind: "project", category: "project_management", future_demand: 83 },
  { slug: "program-management", name_en: "Program Management", name_ar: "إدارة البرامج", kind: "project", category: "project_management", future_demand: 78 },
  { slug: "product-management", name_en: "Product Management", name_ar: "إدارة المنتجات", kind: "project", category: "project_management", future_demand: 84 },
  { slug: "change-management", name_en: "Change Management", name_ar: "إدارة التغيير", kind: "leadership", category: "project_management", future_demand: 75 },
  // Leadership / business
  { slug: "leadership", name_en: "Leadership", name_ar: "القيادة", kind: "leadership", category: "hr", future_demand: 85 },
  { slug: "strategic-thinking", name_en: "Strategic Thinking", name_ar: "التفكير الاستراتيجي", kind: "leadership", category: "business_analysis", future_demand: 84 },
  { slug: "people-management", name_en: "People Management", name_ar: "إدارة الأفراد", kind: "leadership", category: "hr", future_demand: 80 },
  { slug: "stakeholder-management", name_en: "Stakeholder Management", name_ar: "إدارة أصحاب المصلحة", kind: "communication", category: "business_analysis", future_demand: 77 },
  { slug: "communication", name_en: "Communication", name_ar: "التواصل", kind: "communication", category: "hr", future_demand: 81 },
  { slug: "negotiation", name_en: "Negotiation", name_ar: "التفاوض", kind: "communication", category: "business_analysis", future_demand: 72 },
  { slug: "problem-solving", name_en: "Problem Solving", name_ar: "حل المشكلات", kind: "soft", category: "business_analysis", future_demand: 83 },
  { slug: "innovation", name_en: "Innovation", name_ar: "الابتكار", kind: "soft", category: "business_analysis", future_demand: 82 },
  { slug: "learning-agility", name_en: "Learning Agility", name_ar: "مرونة التعلّم", kind: "soft", category: "hr", future_demand: 86 },
  // HR
  { slug: "talent-management", name_en: "Talent Management", name_ar: "إدارة المواهب", kind: "domain", category: "hr", future_demand: 79 },
  { slug: "learning-development", name_en: "Learning & Development", name_ar: "التعلم والتطوير", kind: "domain", category: "hr", future_demand: 78 },
  { slug: "hr-analytics", name_en: "People Analytics", name_ar: "تحليلات الموارد البشرية", kind: "ai_data", category: "hr", future_demand: 85 },
  { slug: "org-development", name_en: "Organizational Development", name_ar: "التطوير المؤسسي", kind: "domain", category: "hr", future_demand: 74 },
  // Finance / business
  { slug: "financial-analysis", name_en: "Financial Analysis", name_ar: "التحليل المالي", kind: "business", category: "finance", future_demand: 80 },
  { slug: "accounting", name_en: "Accounting", name_ar: "المحاسبة", kind: "business", category: "finance", future_demand: 70 },
  { slug: "budgeting", name_en: "Budgeting & Planning", name_ar: "الموازنة والتخطيط", kind: "business", category: "finance", future_demand: 72 },
  { slug: "business-analysis", name_en: "Business Analysis", name_ar: "تحليل الأعمال", kind: "business", category: "business_analysis", future_demand: 81 },
  // Marketing
  { slug: "digital-marketing", name_en: "Digital Marketing", name_ar: "التسويق الرقمي", kind: "domain", category: "marketing", future_demand: 79 },
  { slug: "marketing-analytics", name_en: "Marketing Analytics", name_ar: "تحليلات التسويق", kind: "ai_data", category: "marketing", future_demand: 80 },
  // ITSM / ERP
  { slug: "itsm", name_en: "IT Service Management", name_ar: "إدارة خدمات تقنية المعلومات", kind: "domain", category: "itsm", future_demand: 71 },
  { slug: "erp", name_en: "ERP Systems", name_ar: "أنظمة تخطيط الموارد", kind: "technical", category: "erp_crm", future_demand: 73 },
  { slug: "crm", name_en: "CRM Platforms", name_ar: "منصات إدارة العملاء", kind: "technical", category: "erp_crm", future_demand: 75 },
];

export const PROVIDERS: SeedProvider[] = [
  { slug: "amazon-web-services", name: "Amazon Web Services", website: "https://aws.amazon.com/certification/" },
  { slug: "microsoft", name: "Microsoft", website: "https://learn.microsoft.com/credentials/" },
  { slug: "google", name: "Google", website: "https://cloud.google.com/learn/certification" },
  { slug: "oracle", name: "Oracle", website: "https://education.oracle.com/certification" },
  { slug: "cisco", name: "Cisco", website: "https://www.cisco.com/site/us/en/learn/training-certifications/" },
  { slug: "ibm", name: "IBM", website: "https://www.ibm.com/training/credentials" },
  { slug: "sap", name: "SAP", website: "https://training.sap.com/certification" },
  { slug: "salesforce", name: "Salesforce", website: "https://trailhead.salesforce.com/credentials" },
  { slug: "comptia", name: "CompTIA", website: "https://www.comptia.org/certifications" },
  { slug: "isaca", name: "ISACA", website: "https://www.isaca.org/credentialing" },
  { slug: "isc2", name: "ISC2", website: "https://www.isc2.org/certifications" },
  { slug: "ec-council", name: "EC-Council", website: "https://www.eccouncil.org/" },
  { slug: "pmi", name: "Project Management Institute", website: "https://www.pmi.org/certifications" },
  { slug: "axelos", name: "AXELOS", website: "https://www.axelos.com/" },
  { slug: "scrum-alliance", name: "Scrum Alliance", website: "https://www.scrumalliance.org/" },
  { slug: "iiba", name: "IIBA", website: "https://www.iiba.org/" },
  { slug: "aihr", name: "AIHR", website: "https://www.aihr.com/" },
  { slug: "shrm", name: "SHRM", website: "https://www.shrm.org/credentials" },
  { slug: "hrci", name: "HRCI", website: "https://www.hrci.org/" },
  { slug: "cfa-institute", name: "CFA Institute", website: "https://www.cfainstitute.org/" },
];

export const ROLES: SeedRole[] = [
  { slug: "cloud-architect", title_en: "Cloud Architect", title_ar: "مهندس السحابة", level: "senior", category: "cloud", median_salary_usd: 135000, saudi_demand: 88, global_demand: 92, future_demand: 93, skills: ["cloud-architecture", "aws", "kubernetes", "devops", "networking"] },
  { slug: "devops-engineer", title_en: "DevOps Engineer", title_ar: "مهندس ديف أوبس", level: "mid", category: "cloud", median_salary_usd: 115000, saudi_demand: 84, global_demand: 88, future_demand: 88, skills: ["devops", "kubernetes", "linux", "aws"] },
  { slug: "security-engineer", title_en: "Security Engineer", title_ar: "مهندس أمن", level: "mid", category: "cybersecurity", median_salary_usd: 120000, saudi_demand: 86, global_demand: 90, future_demand: 90, skills: ["network-security", "incident-response", "ethical-hacking"] },
  { slug: "ciso", title_en: "Chief Information Security Officer", title_ar: "رئيس أمن المعلومات", level: "executive", category: "cybersecurity", median_salary_usd: 220000, saudi_demand: 82, global_demand: 85, future_demand: 88, skills: ["security-governance", "risk-management", "compliance", "leadership", "strategic-thinking"] },
  { slug: "data-scientist", title_en: "Data Scientist", title_ar: "عالم بيانات", level: "senior", category: "data_ai", median_salary_usd: 130000, saudi_demand: 80, global_demand: 90, future_demand: 94, skills: ["machine-learning", "statistics", "data-analysis", "programming"] },
  { slug: "data-analyst", title_en: "Data Analyst", title_ar: "محلل بيانات", level: "entry", category: "data_ai", median_salary_usd: 75000, saudi_demand: 78, global_demand: 85, future_demand: 86, skills: ["data-analysis", "sql", "data-visualization"] },
  { slug: "ml-engineer", title_en: "Machine Learning Engineer", title_ar: "مهندس تعلّم آلي", level: "senior", category: "data_ai", median_salary_usd: 145000, saudi_demand: 76, global_demand: 90, future_demand: 95, skills: ["machine-learning", "deep-learning", "data-engineering", "programming"] },
  { slug: "ai-strategist", title_en: "AI Strategist", title_ar: "استراتيجي الذكاء الاصطناعي", level: "lead", category: "data_ai", median_salary_usd: 160000, saudi_demand: 85, global_demand: 88, future_demand: 96, skills: ["generative-ai", "strategic-thinking", "data-analysis", "leadership"] },
  { slug: "software-engineer", title_en: "Software Engineer", title_ar: "مهندس برمجيات", level: "mid", category: "software", median_salary_usd: 110000, saudi_demand: 82, global_demand: 88, future_demand: 85, skills: ["programming", "web-development", "agile-engineering"] },
  { slug: "product-manager", title_en: "Product Manager", title_ar: "مدير منتج", level: "senior", category: "project_management", median_salary_usd: 130000, saudi_demand: 80, global_demand: 86, future_demand: 87, skills: ["product-management", "stakeholder-management", "strategic-thinking", "communication"] },
  { slug: "project-manager", title_en: "Project Manager", title_ar: "مدير مشروع", level: "mid", category: "project_management", median_salary_usd: 95000, saudi_demand: 88, global_demand: 85, future_demand: 82, skills: ["project-management", "agile", "stakeholder-management", "communication"] },
  { slug: "program-director", title_en: "Program Director", title_ar: "مدير برامج", level: "lead", category: "project_management", median_salary_usd: 165000, saudi_demand: 80, global_demand: 82, future_demand: 80, skills: ["program-management", "leadership", "strategic-thinking", "change-management"] },
  { slug: "business-analyst", title_en: "Business Analyst", title_ar: "محلل أعمال", level: "mid", category: "business_analysis", median_salary_usd: 90000, saudi_demand: 82, global_demand: 84, future_demand: 82, skills: ["business-analysis", "stakeholder-management", "problem-solving", "communication"] },
  { slug: "hr-business-partner", title_en: "HR Business Partner", title_ar: "شريك أعمال الموارد البشرية", level: "senior", category: "hr", median_salary_usd: 95000, saudi_demand: 85, global_demand: 82, future_demand: 80, skills: ["talent-management", "people-management", "communication", "strategic-thinking"] },
  { slug: "chro", title_en: "Chief Human Resources Officer", title_ar: "الرئيس التنفيذي للموارد البشرية", level: "executive", category: "hr", median_salary_usd: 210000, saudi_demand: 78, global_demand: 80, future_demand: 82, skills: ["leadership", "org-development", "talent-management", "strategic-thinking"] },
  { slug: "ld-manager", title_en: "Learning & Development Manager", title_ar: "مدير التعلم والتطوير", level: "senior", category: "hr", median_salary_usd: 92000, saudi_demand: 80, global_demand: 78, future_demand: 79, skills: ["learning-development", "people-management", "communication", "hr-analytics"] },
  { slug: "financial-analyst", title_en: "Financial Analyst", title_ar: "محلل مالي", level: "mid", category: "finance", median_salary_usd: 85000, saudi_demand: 80, global_demand: 84, future_demand: 78, skills: ["financial-analysis", "accounting", "budgeting"] },
  { slug: "cfo", title_en: "Chief Financial Officer", title_ar: "الرئيس التنفيذي المالي", level: "executive", category: "finance", median_salary_usd: 250000, saudi_demand: 82, global_demand: 84, future_demand: 82, skills: ["financial-analysis", "strategic-thinking", "leadership", "risk-management"] },
  { slug: "marketing-manager", title_en: "Marketing Manager", title_ar: "مدير تسويق", level: "senior", category: "marketing", median_salary_usd: 100000, saudi_demand: 78, global_demand: 82, future_demand: 80, skills: ["digital-marketing", "marketing-analytics", "communication", "strategic-thinking"] },
  { slug: "solutions-architect", title_en: "Solutions Architect", title_ar: "مهندس حلول", level: "senior", category: "cloud", median_salary_usd: 140000, saudi_demand: 86, global_demand: 90, future_demand: 90, skills: ["cloud-architecture", "aws", "azure", "stakeholder-management"] },
];

export const CERTIFICATIONS: SeedCert[] = [
  // AWS
  { name: "AWS Certified Cloud Practitioner", abbr: "CLF-C02", provider: "amazon-web-services", category: "cloud", difficulty: "beginner", weeks: 4, cost: 100, skills: ["aws", "cloud-architecture"] },
  { name: "AWS Certified Solutions Architect – Associate", abbr: "SAA-C03", provider: "amazon-web-services", category: "cloud", difficulty: "intermediate", weeks: 10, cost: 150, skills: ["aws", "cloud-architecture", "networking"] },
  { name: "AWS Certified Developer – Associate", abbr: "DVA-C02", provider: "amazon-web-services", category: "cloud", difficulty: "intermediate", weeks: 9, cost: 150, skills: ["aws", "programming", "devops"] },
  { name: "AWS Certified SysOps Administrator – Associate", abbr: "SOA-C02", provider: "amazon-web-services", category: "cloud", difficulty: "intermediate", weeks: 10, cost: 150, skills: ["aws", "devops", "linux"] },
  { name: "AWS Certified Solutions Architect – Professional", abbr: "SAP-C02", provider: "amazon-web-services", category: "cloud", difficulty: "expert", weeks: 16, cost: 300, skills: ["cloud-architecture", "aws", "networking"] },
  { name: "AWS Certified DevOps Engineer – Professional", abbr: "DOP-C02", provider: "amazon-web-services", category: "cloud", difficulty: "expert", weeks: 15, cost: 300, skills: ["devops", "aws", "kubernetes"] },
  { name: "AWS Certified Machine Learning – Specialty", abbr: "MLS-C01", provider: "amazon-web-services", category: "data_ai", difficulty: "expert", weeks: 16, cost: 300, skills: ["machine-learning", "aws", "data-engineering"] },
  { name: "AWS Certified Security – Specialty", abbr: "SCS-C02", provider: "amazon-web-services", category: "cybersecurity", difficulty: "advanced", weeks: 12, cost: 300, skills: ["network-security", "aws", "compliance"] },
  // Microsoft
  { name: "Microsoft Azure Fundamentals", abbr: "AZ-900", provider: "microsoft", category: "cloud", difficulty: "beginner", weeks: 3, cost: 99, skills: ["azure", "cloud-architecture"] },
  { name: "Microsoft Azure Administrator", abbr: "AZ-104", provider: "microsoft", category: "cloud", difficulty: "intermediate", weeks: 10, cost: 165, skills: ["azure", "networking", "linux"] },
  { name: "Microsoft Azure Solutions Architect Expert", abbr: "AZ-305", provider: "microsoft", category: "cloud", difficulty: "expert", weeks: 16, cost: 165, skills: ["cloud-architecture", "azure", "networking"] },
  { name: "Microsoft Azure Developer Associate", abbr: "AZ-204", provider: "microsoft", category: "cloud", difficulty: "intermediate", weeks: 10, cost: 165, skills: ["azure", "programming", "devops"] },
  { name: "Microsoft Azure AI Engineer Associate", abbr: "AI-102", provider: "microsoft", category: "data_ai", difficulty: "advanced", weeks: 12, cost: 165, skills: ["machine-learning", "azure", "generative-ai"] },
  { name: "Microsoft Azure Data Scientist Associate", abbr: "DP-100", provider: "microsoft", category: "data_ai", difficulty: "advanced", weeks: 12, cost: 165, skills: ["machine-learning", "data-analysis", "statistics"] },
  { name: "Microsoft Power BI Data Analyst Associate", abbr: "PL-300", provider: "microsoft", category: "data_ai", difficulty: "intermediate", weeks: 8, cost: 165, skills: ["data-visualization", "data-analysis", "sql"] },
  { name: "Microsoft Security Operations Analyst", abbr: "SC-200", provider: "microsoft", category: "cybersecurity", difficulty: "intermediate", weeks: 9, cost: 165, skills: ["incident-response", "network-security", "azure"] },
  // Google
  { name: "Google Cloud Digital Leader", abbr: "GCDL", provider: "google", category: "cloud", difficulty: "beginner", weeks: 3, cost: 99, skills: ["gcp", "cloud-architecture"] },
  { name: "Google Associate Cloud Engineer", abbr: "GACE", provider: "google", category: "cloud", difficulty: "intermediate", weeks: 9, cost: 125, skills: ["gcp", "networking", "devops"] },
  { name: "Google Professional Cloud Architect", abbr: "GPCA", provider: "google", category: "cloud", difficulty: "expert", weeks: 15, cost: 200, skills: ["cloud-architecture", "gcp", "networking"] },
  { name: "Google Professional Data Engineer", abbr: "GPDE", provider: "google", category: "data_ai", difficulty: "advanced", weeks: 13, cost: 200, skills: ["data-engineering", "gcp", "machine-learning"] },
  { name: "Google Data Analytics Professional Certificate", abbr: "GDA", provider: "google", category: "data_ai", difficulty: "beginner", weeks: 12, cost: 234, skills: ["data-analysis", "sql", "data-visualization"] },
  { name: "Google Project Management Certificate", abbr: "GPM", provider: "google", category: "project_management", difficulty: "beginner", weeks: 10, cost: 234, skills: ["project-management", "agile", "communication"] },
  { name: "Google UX Design Certificate", abbr: "GUX", provider: "google", category: "software", difficulty: "beginner", weeks: 16, cost: 234, skills: ["ux-design", "communication"] },
  { name: "Google Cloud Professional ML Engineer", abbr: "GPMLE", provider: "google", category: "data_ai", difficulty: "expert", weeks: 15, cost: 200, skills: ["machine-learning", "deep-learning", "gcp"] },
  // CompTIA
  { name: "CompTIA A+", abbr: "A+", provider: "comptia", category: "it_networking", difficulty: "beginner", weeks: 8, cost: 253, skills: ["networking", "linux"] },
  { name: "CompTIA Network+", abbr: "Network+", provider: "comptia", category: "it_networking", difficulty: "intermediate", weeks: 8, cost: 358, skills: ["networking"] },
  { name: "CompTIA Security+", abbr: "Security+", provider: "comptia", category: "cybersecurity", difficulty: "intermediate", weeks: 8, cost: 392, skills: ["network-security", "compliance", "incident-response"] },
  { name: "CompTIA CySA+", abbr: "CySA+", provider: "comptia", category: "cybersecurity", difficulty: "advanced", weeks: 10, cost: 392, skills: ["incident-response", "network-security"] },
  { name: "CompTIA PenTest+", abbr: "PenTest+", provider: "comptia", category: "cybersecurity", difficulty: "advanced", weeks: 10, cost: 404, skills: ["ethical-hacking", "network-security"] },
  { name: "CompTIA Cloud+", abbr: "Cloud+", provider: "comptia", category: "cloud", difficulty: "intermediate", weeks: 9, cost: 358, skills: ["cloud-architecture", "networking"] },
  // Cisco
  { name: "Cisco Certified Network Associate", abbr: "CCNA", provider: "cisco", category: "it_networking", difficulty: "intermediate", weeks: 12, cost: 300, skills: ["networking", "network-security"] },
  { name: "Cisco Certified Network Professional", abbr: "CCNP", provider: "cisco", category: "it_networking", difficulty: "advanced", weeks: 16, cost: 400, skills: ["networking", "network-security"] },
  { name: "Cisco Certified CyberOps Associate", abbr: "CyberOps", provider: "cisco", category: "cybersecurity", difficulty: "intermediate", weeks: 10, cost: 300, skills: ["incident-response", "network-security"] },
  // ISC2 / ISACA / EC-Council
  { name: "ISC2 Certified in Cybersecurity", abbr: "CC", provider: "isc2", category: "cybersecurity", difficulty: "beginner", weeks: 6, cost: 50, skills: ["network-security", "compliance"] },
  { name: "ISC2 Certified Information Systems Security Professional", abbr: "CISSP", provider: "isc2", category: "cybersecurity", difficulty: "expert", weeks: 20, cost: 749, skills: ["security-governance", "risk-management", "network-security"] },
  { name: "ISC2 Certified Cloud Security Professional", abbr: "CCSP", provider: "isc2", category: "cybersecurity", difficulty: "expert", weeks: 16, cost: 599, skills: ["cloud-architecture", "network-security", "compliance"] },
  { name: "ISACA Certified Information Systems Auditor", abbr: "CISA", provider: "isaca", category: "cybersecurity", difficulty: "advanced", weeks: 14, cost: 575, skills: ["compliance", "risk-management", "security-governance"] },
  { name: "ISACA Certified Information Security Manager", abbr: "CISM", provider: "isaca", category: "cybersecurity", difficulty: "advanced", weeks: 14, cost: 575, skills: ["security-governance", "risk-management", "leadership"] },
  { name: "ISACA Certified in Risk and Information Systems Control", abbr: "CRISC", provider: "isaca", category: "cybersecurity", difficulty: "advanced", weeks: 12, cost: 575, skills: ["risk-management", "compliance"] },
  { name: "EC-Council Certified Ethical Hacker", abbr: "CEH", provider: "ec-council", category: "cybersecurity", difficulty: "advanced", weeks: 12, cost: 550, skills: ["ethical-hacking", "network-security", "incident-response"] },
  // PMI / AXELOS / Scrum / IIBA
  { name: "PMI Project Management Professional", abbr: "PMP", provider: "pmi", category: "project_management", difficulty: "advanced", weeks: 16, cost: 555, skills: ["project-management", "leadership", "stakeholder-management"] },
  { name: "PMI Certified Associate in Project Management", abbr: "CAPM", provider: "pmi", category: "project_management", difficulty: "beginner", weeks: 8, cost: 300, skills: ["project-management", "communication"] },
  { name: "PMI Agile Certified Practitioner", abbr: "PMI-ACP", provider: "pmi", category: "project_management", difficulty: "intermediate", weeks: 10, cost: 495, skills: ["agile", "project-management"] },
  { name: "PMI Program Management Professional", abbr: "PgMP", provider: "pmi", category: "project_management", difficulty: "expert", weeks: 18, cost: 800, skills: ["program-management", "leadership", "strategic-thinking"] },
  { name: "AXELOS PRINCE2 Foundation", abbr: "PRINCE2-F", provider: "axelos", category: "project_management", difficulty: "beginner", weeks: 5, cost: 300, skills: ["project-management"] },
  { name: "AXELOS PRINCE2 Practitioner", abbr: "PRINCE2-P", provider: "axelos", category: "project_management", difficulty: "intermediate", weeks: 8, cost: 400, skills: ["project-management", "change-management"] },
  { name: "AXELOS ITIL 4 Foundation", abbr: "ITIL4-F", provider: "axelos", category: "itsm", difficulty: "beginner", weeks: 4, cost: 300, skills: ["itsm"] },
  { name: "Scrum Alliance Certified ScrumMaster", abbr: "CSM", provider: "scrum-alliance", category: "project_management", difficulty: "beginner", weeks: 3, cost: 1000, skills: ["agile", "communication", "change-management"] },
  { name: "Scrum Alliance Certified Scrum Product Owner", abbr: "CSPO", provider: "scrum-alliance", category: "project_management", difficulty: "beginner", weeks: 3, cost: 1000, skills: ["product-management", "agile", "stakeholder-management"] },
  { name: "IIBA Entry Certificate in Business Analysis", abbr: "ECBA", provider: "iiba", category: "business_analysis", difficulty: "beginner", weeks: 8, cost: 235, skills: ["business-analysis", "communication"] },
  { name: "IIBA Certification of Capability in Business Analysis", abbr: "CCBA", provider: "iiba", category: "business_analysis", difficulty: "intermediate", weeks: 12, cost: 405, skills: ["business-analysis", "stakeholder-management"] },
  { name: "IIBA Certified Business Analysis Professional", abbr: "CBAP", provider: "iiba", category: "business_analysis", difficulty: "advanced", weeks: 16, cost: 505, skills: ["business-analysis", "stakeholder-management", "strategic-thinking"] },
  // HR
  { name: "SHRM Certified Professional", abbr: "SHRM-CP", provider: "shrm", category: "hr", difficulty: "intermediate", weeks: 12, cost: 410, skills: ["talent-management", "communication", "people-management"] },
  { name: "SHRM Senior Certified Professional", abbr: "SHRM-SCP", provider: "shrm", category: "hr", difficulty: "advanced", weeks: 14, cost: 410, skills: ["talent-management", "leadership", "strategic-thinking"] },
  { name: "HRCI Professional in Human Resources", abbr: "PHR", provider: "hrci", category: "hr", difficulty: "intermediate", weeks: 12, cost: 495, skills: ["talent-management", "people-management"] },
  { name: "HRCI Senior Professional in Human Resources", abbr: "SPHR", provider: "hrci", category: "hr", difficulty: "advanced", weeks: 14, cost: 595, skills: ["leadership", "org-development", "strategic-thinking"] },
  { name: "AIHR People Analytics Certificate", abbr: "AIHR-PA", provider: "aihr", category: "hr", difficulty: "intermediate", weeks: 10, cost: 1000, skills: ["hr-analytics", "data-analysis", "talent-management"] },
  { name: "AIHR Talent Management Certificate", abbr: "AIHR-TM", provider: "aihr", category: "hr", difficulty: "intermediate", weeks: 10, cost: 1000, skills: ["talent-management", "org-development", "learning-development"] },
  { name: "AIHR Learning & Development Certificate", abbr: "AIHR-LD", provider: "aihr", category: "hr", difficulty: "intermediate", weeks: 10, cost: 1000, skills: ["learning-development", "people-management", "communication"] },
  // Finance
  { name: "CFA Institute Chartered Financial Analyst", abbr: "CFA", provider: "cfa-institute", category: "finance", difficulty: "expert", weeks: 40, cost: 1200, skills: ["financial-analysis", "risk-management", "strategic-thinking"] },
  { name: "CFA Institute Investment Foundations", abbr: "CFA-IF", provider: "cfa-institute", category: "finance", difficulty: "beginner", weeks: 8, cost: 350, skills: ["financial-analysis", "accounting"] },
  // Oracle / SAP / Salesforce / IBM
  { name: "Oracle Cloud Infrastructure Foundations Associate", abbr: "OCI-F", provider: "oracle", category: "cloud", difficulty: "beginner", weeks: 4, cost: 95, skills: ["cloud-architecture", "networking"] },
  { name: "Oracle Database SQL Certified Associate", abbr: "ODB-SQL", provider: "oracle", category: "data_ai", difficulty: "intermediate", weeks: 8, cost: 245, skills: ["sql", "data-engineering"] },
  { name: "SAP Certified Application Associate – SAP S/4HANA", abbr: "SAP-S4", provider: "sap", category: "erp_crm", difficulty: "advanced", weeks: 14, cost: 550, skills: ["erp", "business-analysis"] },
  { name: "SAP Certified Development Associate – ABAP", abbr: "SAP-ABAP", provider: "sap", category: "erp_crm", difficulty: "advanced", weeks: 14, cost: 550, skills: ["erp", "programming"] },
  { name: "Salesforce Certified Administrator", abbr: "SF-ADM", provider: "salesforce", category: "erp_crm", difficulty: "intermediate", weeks: 9, cost: 200, skills: ["crm", "business-analysis"] },
  { name: "Salesforce Certified Platform Developer I", abbr: "SF-PD1", provider: "salesforce", category: "erp_crm", difficulty: "advanced", weeks: 12, cost: 200, skills: ["crm", "programming"] },
  { name: "IBM Data Science Professional Certificate", abbr: "IBM-DS", provider: "ibm", category: "data_ai", difficulty: "intermediate", weeks: 12, cost: 234, skills: ["data-analysis", "machine-learning", "programming"] },
  { name: "IBM AI Engineering Professional Certificate", abbr: "IBM-AIE", provider: "ibm", category: "data_ai", difficulty: "advanced", weeks: 14, cost: 234, skills: ["machine-learning", "deep-learning", "generative-ai"] },
];
