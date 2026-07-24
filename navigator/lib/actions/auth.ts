"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Locale } from "@/lib/i18n";

/** Sign the current user out and return to the localized home page. */
export async function signOut(locale: Locale) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect(`/${locale}`);
}
