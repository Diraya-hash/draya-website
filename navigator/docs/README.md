# Draaya Navigator — Design Docs

Every major module is designed before it is built. No feature code is written
until its **PRD** and **TDD** are approved.

- **PRD** (`docs/prd/NNNN-<slug>.md`) — the *what* and *why*: problem, user
  stories, acceptance criteria, UX flow, out-of-scope.
- **TDD** (`docs/tdd/NNNN-<slug>.md`) — the *how*: architecture, database
  changes, API/actions, security, performance, rollout & verification.

## Status legend

`Draft` → `Approved` → `In progress` → `Shipped`

## Index

| # | Module | PRD | TDD | Status |
|---|--------|-----|-----|--------|
| 0001 | Infrastructure First | [prd](prd/0001-infrastructure.md) | [tdd](tdd/0001-infrastructure.md) | Shipped (code); live verify on provision |
| 0002 | Career Knowledge Graph & Ontology | [prd](prd/0002-career-graph.md) | [tdd](tdd/0002-career-graph.md) | Shipped (code); live verify on provision |
| 0003 | Career Path Engine ("become X") | — | — | Planned |
| 0004 | Career Readiness Index (14-dim) + Saudi Market Intelligence | — | — | Planned |
| 0005 | Explainable Recommendation Engine + Career DNA v2 | — | — | Planned |
| 0006 | Career Blueprint report + Executive PDF | — | — | Planned |
| 0007 | Adaptive assessment v2 | — | — | Planned |
| 0008 | Admin CMS + Import System | — | — | Planned (after graph stabilises) |
| 0009 | CV analyzer | — | — | Planned |
| 0010 | Performance pass | — | — | Planned |

> The Career Knowledge Graph (0002) is the foundation the engines (0003–0006)
> consume, so it comes first. Admin CMS (0008) moves after the graph shape
> stabilises, then manages graph entities too.

## Delivery lifecycle (mandatory)

Every major module follows, in order:

**PRD → TDD → Approval → Implementation → Testing → Type-check → Production
build → Commit → Push.**

Never skip a step. Never leave `main` broken.
