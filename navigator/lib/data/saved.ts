import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getUser } from "@/lib/auth";
import { CERT_SELECT, mapCertRow, type RawCert } from "./certifications";
import type { Certification } from "@/lib/assessment/types";

export type SavedStatus = "wishlist" | "in_progress" | "completed";

export interface SavedCertification {
  cert: Certification;
  status: SavedStatus;
  progressPercent: number;
  hoursLogged: number;
  targetExamDate: string | null;
  completedAt: string | null;
}

/** All certifications the current user has saved, newest first. */
export async function getSavedCertifications(): Promise<SavedCertification[]> {
  if (!isSupabaseConfigured()) return [];
  const user = await getUser();
  if (!user) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("saved_certifications")
      .select(
        `status, progress_percent, hours_logged, target_exam_date, completed_at,
         certification:certifications(${CERT_SELECT})`
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? [])
      .filter((r) => r.certification)
      .map((r) => ({
        cert: mapCertRow(r.certification as unknown as RawCert),
        status: r.status as SavedStatus,
        progressPercent: r.progress_percent as number,
        hoursLogged: r.hours_logged as number,
        targetExamDate: (r.target_exam_date as string | null) ?? null,
        completedAt: (r.completed_at as string | null) ?? null,
      }));
  } catch (err) {
    console.error("[data/saved] list failed:", err);
    return [];
  }
}

/** Set of certification slugs the user has saved (for toggling UI state). */
export async function getSavedSlugs(): Promise<Set<string>> {
  if (!isSupabaseConfigured()) return new Set();
  const user = await getUser();
  if (!user) return new Set();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("saved_certifications")
      .select("certification:certifications(slug)")
      .eq("user_id", user.id);
    if (error) throw error;
    return new Set(
      (data ?? [])
        .map((r) => (r.certification as unknown as { slug: string } | null)?.slug)
        .filter((s): s is string => Boolean(s))
    );
  } catch {
    return new Set();
  }
}
