import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ARCHETYPES, type ArchetypeDefinition } from "@/lib/assessment/archetypes";
import type { LocalizedText } from "@/lib/assessment/types";
import type { CompetencyKey } from "@/lib/assessment/competencies";

interface RawArchetype {
  slug: string;
  name_en: string;
  name_ar: string;
  tagline_en: string | null;
  tagline_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  strengths: LocalizedText[] | null;
  watchouts: LocalizedText[] | null;
  future_roles: LocalizedText[] | null;
  icon: string | null;
  gradient: string | null;
  signature: Partial<Record<CompetencyKey, number>> | null;
}

function mapRow(row: RawArchetype): ArchetypeDefinition {
  const t = (en: string | null, ar: string | null): LocalizedText => ({
    en: en ?? "",
    ar: ar ?? "",
  });
  return {
    id: row.slug,
    name: t(row.name_en, row.name_ar),
    tagline: t(row.tagline_en, row.tagline_ar),
    description: t(row.description_en, row.description_ar),
    strengths: row.strengths ?? [],
    watchouts: row.watchouts ?? [],
    futureRoles: row.future_roles ?? [],
    icon: row.icon ?? "Sparkles",
    gradient: row.gradient ?? "from-emerald-500/20 to-teal-700/20",
    signature: row.signature ?? {},
  };
}

/** Live Career DNA archetypes (with engine signatures); mock fallback. */
export async function getArchetypes(): Promise<ArchetypeDefinition[]> {
  if (!isSupabaseConfigured()) return ARCHETYPES;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("career_archetypes")
      .select(
        "slug, name_en, name_ar, tagline_en, tagline_ar, description_en, description_ar, strengths, watchouts, future_roles, icon, gradient, signature"
      )
      .order("sort_order");
    if (error) throw error;
    if (!data || data.length === 0) return ARCHETYPES;
    return (data as unknown as RawArchetype[]).map(mapRow);
  } catch (err) {
    console.error("[data/archetypes] falling back to sample data:", err);
    return ARCHETYPES;
  }
}

export async function getArchetypeCount(): Promise<number> {
  if (!isSupabaseConfigured()) return ARCHETYPES.length;
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("career_archetypes")
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? ARCHETYPES.length;
  } catch {
    return ARCHETYPES.length;
  }
}
