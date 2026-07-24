/**
 * Central check for whether Supabase is wired up. The data layer uses this to
 * decide between live queries and the built-in mock fallback, so the app keeps
 * working (on Vercel, in CI, before `supabase start`) until env is provided.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
