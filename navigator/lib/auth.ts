import "server-only";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Current authenticated user, or null (also null when Supabase is unconfigured). */
export async function getUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

/** Display name for a user: profile name → metadata → email local-part. */
export function displayName(user: User): string {
  return (
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "there"
  );
}
