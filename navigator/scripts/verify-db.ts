/**
 * Verifies the live database: migrations applied, catalog seeded, RLS enforced,
 * and storage buckets present. Run AFTER `supabase db push` + `npm run seed`.
 *
 *   npm run verify:db
 *
 * Uses the anon key to prove public-read + RLS denial, and the service-role key
 * to inspect buckets and provenance.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anon || !service) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const pub = createClient(url, anon, { auth: { persistSession: false } });
const admin = createClient(url, service, { auth: { persistSession: false } });

let failures = 0;
function assert(label: string, ok: boolean, detail = "") {
  console.log(`${ok ? "✓" : "✗"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

async function count(client: typeof pub, table: string): Promise<number> {
  const { count } = await client.from(table).select("*", { count: "exact", head: true });
  return count ?? 0;
}

async function main() {
  console.log(`Verifying ${url} …\n`);

  // 1. Catalog is public-readable and seeded.
  const certs = await count(pub, "certifications");
  assert("anon can read certifications", certs > 0, `${certs} rows`);
  assert("anon can read skills", (await count(pub, "skills")) > 0);
  assert("anon can read career_roles", (await count(pub, "career_roles")) > 0);
  assert("anon can read categories", (await count(pub, "categories")) > 0);

  // 2. RLS blocks anon from per-user tables (0 visible rows even if data exists).
  const anonAssessments = await count(pub, "assessments");
  assert("RLS: anon sees 0 assessments", anonAssessments === 0, `${anonAssessments}`);
  const anonSaved = await count(pub, "saved_certifications");
  assert("RLS: anon sees 0 saved_certifications", anonSaved === 0);

  // 3. Provenance: seeded certs are unverified & sourced.
  const { count: unverified } = await admin
    .from("certifications")
    .select("*", { count: "exact", head: true })
    .eq("verified", false)
    .eq("source", "seed:curated");
  assert("provenance: seed certs are verified=false", (unverified ?? 0) === certs, `${unverified}/${certs}`);

  // 4. Storage buckets exist.
  const { data: buckets } = await admin.storage.listBuckets();
  const names = new Set((buckets ?? []).map((b) => b.id));
  for (const b of ["cv-uploads", "pdf-reports", "user-files"]) {
    assert(`bucket '${b}' exists`, names.has(b));
  }

  // 5. Skills graph is linked.
  assert("certification_skills linked", (await count(admin, "certification_skills")) > 0);
  assert("certification_competencies linked", (await count(admin, "certification_competencies")) > 0);
  assert("role_skills linked", (await count(admin, "role_skills")) > 0);

  // 6. Career graph (module 0002).
  assert("job_families seeded", (await count(admin, "job_families")) > 0);
  assert("role_progressions seeded", (await count(admin, "role_progressions")) > 0);
  assert("role_certifications seeded", (await count(admin, "role_certifications")) > 0);
  const { count: childSkills } = await admin
    .from("skills")
    .select("*", { count: "exact", head: true })
    .not("parent_id", "is", null);
  assert("skills hierarchy linked (parent_id)", (childSkills ?? 0) > 0, `${childSkills} children`);

  console.log(`\n${failures === 0 ? "✅ ALL CHECKS PASSED" : `❌ ${failures} CHECK(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
