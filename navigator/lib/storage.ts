import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export type Bucket = "cv-uploads" | "pdf-reports" | "user-files";

/**
 * Storage helpers. Every path is namespaced under the caller's `{user_id}/`
 * folder, matching the owner-by-folder RLS policies on storage.objects.
 */

function ownedPath(userId: string, path: string): string {
  const clean = path.replace(/^\/+/, "");
  return `${userId}/${clean}`;
}

export async function uploadUserFile(
  bucket: Bucket,
  path: string,
  body: ArrayBuffer | Uint8Array | Blob,
  contentType?: string
): Promise<{ path: string } | { error: string }> {
  const user = await getUser();
  if (!user) return { error: "unauthenticated" };
  const supabase = await createClient();
  const key = ownedPath(user.id, path);
  const { error } = await supabase.storage
    .from(bucket)
    .upload(key, body, { upsert: true, contentType });
  if (error) return { error: error.message };
  return { path: key };
}

/** Short-lived signed URL for a private object the caller owns. */
export async function createSignedUrl(
  bucket: Bucket,
  path: string,
  expiresInSeconds = 300
): Promise<string | null> {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const key = path.startsWith(`${user.id}/`) ? path : ownedPath(user.id, path);
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(key, expiresInSeconds);
  if (error) return null;
  return data.signedUrl;
}

export async function removeUserFile(bucket: Bucket, path: string): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;
  const supabase = await createClient();
  const key = path.startsWith(`${user.id}/`) ? path : ownedPath(user.id, path);
  const { error } = await supabase.storage.from(bucket).remove([key]);
  return !error;
}

export async function listUserFiles(bucket: Bucket): Promise<string[]> {
  const user = await getUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(bucket).list(user.id);
  if (error) return [];
  return (data ?? []).map((f) => `${user.id}/${f.name}`);
}
