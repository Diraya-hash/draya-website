# PRD 0002 — Career Knowledge Graph & Skills Ontology

**Status:** Draft — awaiting approval
**Author:** Draaya engineering
**Related TDD:** [tdd/0002-career-graph.md](../tdd/0002-career-graph.md)

## Vision context (why this module comes first)

We are becoming a **Career Intelligence Platform**, not a certification
directory. The product must understand people, skills, jobs, industries,
competencies, certifications, progression, salary, learning, and market demand —
**as one connected graph**. Every later capability (path engine, readiness,
Saudi intelligence, explainable recommendations, the career blueprint) is a
*traversal or scoring over this graph*. So the graph is the foundation and must
exist before the engines.

### The graph we are building

```
Industry → Job Family → Job Role → Competency → Skill (hierarchical)
                              │         │
                              │         └→ Certification → Learning Resource
                              ├→ Promotion (next Role)
                              └→ Salary Benchmark
```

### Module decomposition (the full vision, sequenced)

| Module | Delivers |
|--------|----------|
| **0002 (this)** | The **graph + skills ontology + job architecture** data model, a graph query layer, a real multi-ladder seed, and a read-only **Career Explorer** to prove it. |
| 0003 | **Career Path Engine** — "I want to become X" → current→missing skills → required certs → learning plan → timeline → promotion sequence. |
| 0004 | **Career Readiness Index v2** (14 dimensions) + **Saudi Market Intelligence** layer (sector demand, Vision 2030 alignment, local vs global salary). |
| 0005 | **Explainable Recommendation Engine** + **Career DNA v2** — weighted scoring with per-recommendation "why" (missing skills/competencies, impact, salary, promotion probability). |
| 0006 | **Career Blueprint** report + executive PDF (the 5-year plan). |
| 0007 | Adaptive assessment v2. 0008 Admin CMS + Import. 0009 CV analyzer. 0010 Perf. |

This PRD scopes **0002 only**. It deliberately excludes scoring/engines.

## Problem

Skills today are a **flat list**, certifications map to 6 coarse competencies,
and roles are isolated rows. There is no hierarchy (Leadership → Coaching,
Mentoring, …), no job architecture (Learning Specialist → … → Chief Learning
Officer), and no connective tissue between industry, role, competency, skill,
certification, learning, promotion, and salary. Without this graph, "become an
HR Director" or "what am I missing for Data Scientist?" cannot be answered in a
principled, explainable way.

## User stories

- **As a professional**, I can browse a **career ladder** for my field (e.g.,
  Learning Specialist → Learning Manager → Head of Learning → CLO) and see, for
  any role: responsibilities, required skills (with levels), recommended
  certifications, typical experience, next promotions, and expected salary.
- **As a professional**, I can explore the **skill hierarchy** — open
  "Leadership" and see Coaching, Mentoring, Feedback, Delegation, Performance
  Management, Team Development beneath it.
- **As the platform (future engines)**, I can query the graph: "skills for role
  X", "roles that need skill Y", "certifications that teach skill Z", "promotion
  targets from role X" — the primitives the Path/Recommendation engines need.
- **As product**, the graph is seeded with **real** ladders end-to-end, so
  0003+ can be built and demoed against real structure.

## Acceptance criteria

1. **Skills ontology is hierarchical**: skills have parent/child links; at least
   three top-level clusters fully expanded (e.g., Leadership, AI, Data) matching
   the examples in the brief.
2. **Competency ↔ skill mapping**: every skill maps to one of the readiness
   competencies, so skill levels can roll up into competency scores (used by
   0004).
3. **Job architecture** exists: `industry → job_family → job_role`, and each role
   defines **responsibilities, required skills (with level), recommended
   certifications, typical experience, promotion targets, expected salary**.
4. **Promotion ladders**: role→role progression edges seeded for ≥3 real ladders
   (HR/L&D, Data/AI, Cybersecurity), each ≥4 levels deep.
5. **Graph is fully linked**: from any seeded role you can traverse to its
   family, industry, competencies, skills (with hierarchy), recommended certs,
   those certs' learning resources, promotion targets, and salary benchmark.
6. **Graph query layer** (`lib/graph/*`) exposes typed functions for the above,
   with the same guarded-fallback discipline as `lib/data/*`.
7. **Read-only Career Explorer** UI at `/[locale]/careers` (browse families &
   roles) and `/[locale]/careers/[role]` (role detail with the graph), using the
   **existing Draaya design system unchanged**. Bilingual + RTL.
8. No scoring/recommendation logic in this module (deferred to 0003+).
9. Testing: explorer verified against the live DB; graph queries return the
   seeded ladders. `tsc` + `next build` pass. Committed & pushed.

## UX flow

1. User opens **Careers** from the nav → sees job families grouped by industry.
2. Picks a family (e.g., *Learning & Development*) → sees its roles as a ladder.
3. Opens a role (e.g., *Learning Manager*) → role page shows: summary,
   responsibilities, required skills (grouped by competency, with levels),
   recommended certifications (linking to existing cert data), typical
   experience, **promotion targets** (clickable → next role), and salary range.
4. Skills shown as an expandable tree (parent → children).

*No auth required to browse (catalog is public-read). Personalised overlays
("your gap for this role") arrive with the Path Engine (0003).*

## Out of scope (this module)

- Any scoring: readiness, compatibility, gap %, recommendations, "why".
- The "become X" path engine (0003), Saudi intelligence (0004), blueprint (0006).
- Editing the graph (Admin CMS, 0008) — this module seeds it in code.
- Exhaustive coverage — we seed **real, deep** slices (3 ladders), not every job.

## Success measures

- A product reviewer can navigate three real career ladders end-to-end and reach
  every connected entity (skill tree, certs, promotions, salary) with no dead
  ends.
- 0003 can be built purely against `lib/graph/*` without touching the schema.
