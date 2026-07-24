import type { CareerArchetype } from "./types";
import type { CompetencyKey } from "./competencies";

/**
 * Career DNA archetypes. Each declares the competency signature that pulls a
 * profile toward it; the engine picks the closest match to the user's profile.
 */
export interface ArchetypeDefinition extends CareerArchetype {
  signature: Partial<Record<CompetencyKey, number>>; // 0–100 ideal profile
}

export const ARCHETYPES: ArchetypeDefinition[] = [
  {
    id: "transformation-leader",
    name: { en: "Transformation Leader", ar: "قائد التحول" },
    tagline: {
      en: "You turn strategy into organisational change.",
      ar: "تحوّل الاستراتيجية إلى تغيير مؤسسي.",
    },
    description: {
      en: "You operate where leadership, business acumen and delivery meet — the person organisations trust to steer ambitious change and bring people along.",
      ar: "تعمل عند تقاطع القيادة والفطنة التجارية والتنفيذ — الشخص الذي تثق به المؤسسات لقيادة التغيير الطموح واستقطاب الناس معه.",
    },
    strengths: [
      { en: "Aligning teams behind a vision", ar: "مواءمة الفرق خلف رؤية واضحة" },
      { en: "Balancing ambition with delivery", ar: "الموازنة بين الطموح والتنفيذ" },
    ],
    watchouts: [
      { en: "Deepen your data fluency", ar: "عزّز طلاقتك في البيانات" },
      { en: "Guard against over-committing", ar: "احذر من الإفراط في الالتزامات" },
    ],
    futureRoles: [
      { en: "Chief Operating Officer", ar: "الرئيس التنفيذي للعمليات" },
      { en: "Programme Director", ar: "مدير البرامج" },
    ],
    icon: "Rocket",
    gradient: "from-emerald-500/20 to-teal-700/20",
    signature: { leadership: 90, business: 85, project: 75, communication: 80 },
  },
  {
    id: "ai-strategist",
    name: { en: "AI Strategist", ar: "استراتيجي الذكاء الاصطناعي" },
    tagline: {
      en: "You make intelligence useful to the business.",
      ar: "تجعل الذكاء الاصطناعي مفيدًا للأعمال.",
    },
    description: {
      en: "You blend data fluency with commercial judgement, translating AI capability into decisions, products and measurable value.",
      ar: "تمزج طلاقة البيانات بالحكمة التجارية، لتترجم قدرات الذكاء الاصطناعي إلى قرارات ومنتجات وقيمة قابلة للقياس.",
    },
    strengths: [
      { en: "Spotting high-value AI use-cases", ar: "اكتشاف حالات الاستخدام عالية القيمة" },
      { en: "Bridging tech and business", ar: "الربط بين التقنية والأعمال" },
    ],
    watchouts: [
      { en: "Invest in stakeholder storytelling", ar: "استثمر في سرد القصص لأصحاب المصلحة" },
      { en: "Stay close to delivery detail", ar: "ابقَ قريبًا من تفاصيل التنفيذ" },
    ],
    futureRoles: [
      { en: "Head of Data & AI", ar: "رئيس البيانات والذكاء الاصطناعي" },
      { en: "AI Product Lead", ar: "قائد منتجات الذكاء الاصطناعي" },
    ],
    icon: "Sparkles",
    gradient: "from-cyan-500/20 to-emerald-600/20",
    signature: { aiData: 92, business: 78, technical: 70, leadership: 60 },
  },
  {
    id: "talent-architect",
    name: { en: "Talent Architect", ar: "مهندس المواهب" },
    tagline: {
      en: "You build the people systems others grow within.",
      ar: "تبني أنظمة الأفراد التي ينمو الآخرون في إطارها.",
    },
    description: {
      en: "People-centred and structured, you design the culture, capability and processes that let organisations scale their talent with intent.",
      ar: "متمحور حول الأفراد ومنظّم، تصمم الثقافة والقدرات والعمليات التي تتيح للمؤسسات توسيع مواهبها بوعي.",
    },
    strengths: [
      { en: "Designing people programmes", ar: "تصميم برامج الأفراد" },
      { en: "Reading culture and dynamics", ar: "قراءة الثقافة والديناميكيات" },
    ],
    watchouts: [
      { en: "Quantify people impact with data", ar: "قِس أثر الأفراد بالبيانات" },
      { en: "Sharpen commercial framing", ar: "اشحذ التأطير التجاري" },
    ],
    futureRoles: [
      { en: "Chief People Officer", ar: "الرئيس التنفيذي للأفراد" },
      { en: "Head of Talent", ar: "رئيس المواهب" },
    ],
    icon: "Users",
    gradient: "from-teal-500/20 to-emerald-700/20",
    signature: { communication: 88, leadership: 78, business: 65, project: 55 },
  },
  {
    id: "technical-builder",
    name: { en: "Technical Builder", ar: "الباني التقني" },
    tagline: {
      en: "You turn hard problems into working systems.",
      ar: "تحوّل المشكلات الصعبة إلى أنظمة تعمل.",
    },
    description: {
      en: "Deep craft is your edge. You go further technically than most and increasingly pair that depth with delivery and data.",
      ar: "الإتقان العميق هو ميزتك. تتقدّم تقنيًا أكثر من غيرك، وتقرن هذا العمق تدريجيًا بالتنفيذ والبيانات.",
    },
    strengths: [
      { en: "Solving complex technical problems", ar: "حل المشكلات التقنية المعقدة" },
      { en: "Building reliable systems", ar: "بناء أنظمة موثوقة" },
    ],
    watchouts: [
      { en: "Grow influence and communication", ar: "نمِّ التأثير والتواصل" },
      { en: "Connect work to business value", ar: "اربط العمل بقيمة الأعمال" },
    ],
    futureRoles: [
      { en: "Principal Engineer / Architect", ar: "مهندس رئيسي / معماري" },
      { en: "Head of Engineering", ar: "رئيس الهندسة" },
    ],
    icon: "Cpu",
    gradient: "from-emerald-600/20 to-cyan-700/20",
    signature: { technical: 92, aiData: 70, project: 65, business: 45 },
  },
  {
    id: "delivery-commander",
    name: { en: "Delivery Commander", ar: "قائد التنفيذ" },
    tagline: {
      en: "You get complex work across the line.",
      ar: "توصل الأعمال المعقدة إلى خط النهاية.",
    },
    description: {
      en: "Structured, dependable and calm under pressure, you orchestrate people, scope and risk to deliver outcomes others struggle to land.",
      ar: "منظّم وموثوق وهادئ تحت الضغط، تنسّق الأفراد والنطاق والمخاطر لتحقق نتائج يصعب على غيرك إنجازها.",
    },
    strengths: [
      { en: "Orchestrating complex delivery", ar: "تنسيق التنفيذ المعقد" },
      { en: "Managing risk and stakeholders", ar: "إدارة المخاطر وأصحاب المصلحة" },
    ],
    watchouts: [
      { en: "Lift strategic and commercial view", ar: "ارفع النظرة الاستراتيجية والتجارية" },
      { en: "Invest in data-driven decisions", ar: "استثمر في القرارات المبنية على البيانات" },
    ],
    futureRoles: [
      { en: "Programme Director", ar: "مدير البرامج" },
      { en: "Head of PMO", ar: "رئيس مكتب إدارة المشاريع" },
    ],
    icon: "ListChecks",
    gradient: "from-teal-600/20 to-emerald-500/20",
    signature: { project: 92, leadership: 68, communication: 66, business: 60 },
  },
  {
    id: "commercial-navigator",
    name: { en: "Commercial Navigator", ar: "المُلاح التجاري" },
    tagline: {
      en: "You read the numbers and steer the business.",
      ar: "تقرأ الأرقام وتوجّه الأعمال.",
    },
    description: {
      en: "Finance and strategy are your native language. You connect value, risk and growth — and are ready to add data and leadership range.",
      ar: "المالية والاستراتيجية لغتك الأم. تربط بين القيمة والمخاطر والنمو، وأنت جاهز لإضافة مدى من البيانات والقيادة.",
    },
    strengths: [
      { en: "Commercial and financial judgement", ar: "الحكم التجاري والمالي" },
      { en: "Strategic prioritisation", ar: "تحديد الأولويات الاستراتيجية" },
    ],
    watchouts: [
      { en: "Build data and analytics depth", ar: "ابنِ عمقًا في البيانات والتحليلات" },
      { en: "Grow team leadership", ar: "نمِّ قيادة الفريق" },
    ],
    futureRoles: [
      { en: "Chief Financial Officer", ar: "الرئيس التنفيذي المالي" },
      { en: "Head of Strategy", ar: "رئيس الاستراتيجية" },
    ],
    icon: "TrendingUp",
    gradient: "from-emerald-500/20 to-teal-600/20",
    signature: { business: 92, communication: 70, leadership: 66, aiData: 55 },
  },
];
