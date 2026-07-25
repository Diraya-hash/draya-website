import type { CompetencyKey } from "@/lib/assessment/competencies";

export interface JobFamily {
  slug: string;
  name: string;
  industry: string | null;
}

export interface RoleRef {
  slug: string;
  title: string;
  level: string;
}

export interface RoleCard extends RoleRef {
  summary: string;
  experienceYears: number;
}

export interface SkillNode {
  slug: string;
  name: string;
  competency: CompetencyKey | string;
  children: SkillNode[];
}

export interface SkillWithLevel {
  slug: string;
  name: string;
  competency: CompetencyKey | string;
}

export interface CertRef {
  slug: string;
  name: string;
  abbr: string;
  difficulty: string;
  weeks: number;
  cost: number;
  strength: number;
}

export interface SalaryBand {
  median: number;
  currency: string;
}

export interface RoleGraph {
  slug: string;
  title: string;
  level: string;
  summary: string;
  experienceYears: number;
  family: { slug: string; name: string } | null;
  responsibilities: string[];
  skillsByCompetency: { competency: string; skills: SkillWithLevel[] }[];
  recommendedCerts: CertRef[];
  promotions: RoleRef[];
  salary: SalaryBand;
  demand: { saudi: number; global: number; future: number };
}
