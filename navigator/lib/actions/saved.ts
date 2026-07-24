"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getUser } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";
import type { SavedStatus } from "@/lib/data/saved";
import type { SupabaseClient } from "@supabase/supabase-js";

type Ok = { ok: true; saved?: boolean };
type Err = { ok: false; error: "unauthenticated" | "unconfigured" | "not_found" | "failed" };
type Result = Ok | Err;

async function certIdBySlug(supabase: SupabaseClient, slug: string): Promise<string | null> {
  const { data } = await supabase.from("certifications").select("id").eq("slug", slug).maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

type Context =
  | { error: "unconfigured" | "unauthenticated" }
  | { error?: undefined; supabase: SupabaseClient; userId: string };

async function requireContext(): Promise<Context> {
  if (!isSupabaseConfigured()) return { error: "unconfigured" };
  const user = await getUser();
  if (!user) return { error: "unauthenticated" };
  const supabase = await createClient();
  return { supabase, userId: user.id };
}

/** Save if not saved, remove if already saved. Returns the new saved state. */
export async function toggleSaved(slug: string, locale: Locale): Promise<Result> {
  const ctx = await requireContext();
  if (ctx.error) return { ok: false, error: ctx.error };
  const { supabase, userId } = ctx;
  try {
    const certId = await certIdBySlug(supabase, slug);
    if (!certId) return { ok: false, error: "not_found" };

    const { data: existing } = await supabase
      .from("saved_certifications")
      .select("certification_id")
      .eq("user_id", userId)
      .eq("certification_id", certId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("saved_certifications")
        .delete()
        .eq("user_id", userId)
        .eq("certification_id", certId);
      if (error) throw error;
      revalidatePath(`/${locale}/dashboard`);
      return { ok: true, saved: false };
    }

    const { error } = await supabase
      .from("saved_certifications")
      .insert({ user_id: userId, certification_id: certId, status: "wishlist" });
    if (error) throw error;
    revalidatePath(`/${locale}/dashboard`);
    return { ok: true, saved: true };
  } catch (err) {
    console.error("[actions/saved] toggle failed:", err);
    return { ok: false, error: "failed" };
  }
}

export async function updateSavedStatus(
  slug: string,
  status: SavedStatus,
  locale: Locale
): Promise<Result> {
  const ctx = await requireContext();
  if (ctx.error) return { ok: false, error: ctx.error };
  const { supabase, userId } = ctx;
  try {
    const certId = await certIdBySlug(supabase, slug);
    if (!certId) return { ok: false, error: "not_found" };
    const patch: Record<string, unknown> = { status };
    if (status === "completed") {
      patch.progress_percent = 100;
      patch.completed_at = new Date().toISOString();
    } else {
      patch.completed_at = null;
    }
    const { error } = await supabase
      .from("saved_certifications")
      .update(patch)
      .eq("user_id", userId)
      .eq("certification_id", certId);
    if (error) throw error;
    revalidatePath(`/${locale}/dashboard`);
    return { ok: true };
  } catch (err) {
    console.error("[actions/saved] status failed:", err);
    return { ok: false, error: "failed" };
  }
}

export async function updateSavedProgress(
  slug: string,
  progressPercent: number,
  hoursLogged: number,
  locale: Locale
): Promise<Result> {
  const ctx = await requireContext();
  if (ctx.error) return { ok: false, error: ctx.error };
  const { supabase, userId } = ctx;
  try {
    const certId = await certIdBySlug(supabase, slug);
    if (!certId) return { ok: false, error: "not_found" };
    const clampedProgress = Math.max(0, Math.min(100, Math.round(progressPercent)));
    const { error } = await supabase
      .from("saved_certifications")
      .update({
        progress_percent: clampedProgress,
        hours_logged: Math.max(0, Math.round(hoursLogged)),
      })
      .eq("user_id", userId)
      .eq("certification_id", certId);
    if (error) throw error;
    revalidatePath(`/${locale}/dashboard`);
    return { ok: true };
  } catch (err) {
    console.error("[actions/saved] progress failed:", err);
    return { ok: false, error: "failed" };
  }
}

export async function removeSaved(slug: string, locale: Locale): Promise<Result> {
  const ctx = await requireContext();
  if (ctx.error) return { ok: false, error: ctx.error };
  const { supabase, userId } = ctx;
  try {
    const certId = await certIdBySlug(supabase, slug);
    if (!certId) return { ok: false, error: "not_found" };
    const { error } = await supabase
      .from("saved_certifications")
      .delete()
      .eq("user_id", userId)
      .eq("certification_id", certId);
    if (error) throw error;
    revalidatePath(`/${locale}/dashboard`);
    return { ok: true };
  } catch (err) {
    console.error("[actions/saved] remove failed:", err);
    return { ok: false, error: "failed" };
  }
}
