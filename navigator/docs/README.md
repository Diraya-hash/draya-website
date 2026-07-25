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
| 0001 | Infrastructure First | [prd](prd/0001-infrastructure.md) | [tdd](tdd/0001-infrastructure.md) | Approved — in progress |
| 0002 | Admin CMS + Import System | — | — | Planned |
| 0003 | Career Intelligence Engine | — | — | Planned |
| 0004 | Career DNA framework | — | — | Planned |
| 0005 | Adaptive assessment | — | — | Planned |
| 0006 | Executive report + Skills-graph viz | — | — | Planned |
| 0007 | Explainable recommendation engine | — | — | Planned |
| 0008 | CV analyzer | — | — | Planned |
| 0009 | Performance pass | — | — | Planned |
| 0010 | Executive PDF export + verification | — | — | Planned |

## Delivery rule

After each module: type-check → production build → fix → commit → push.
Never leave `main` broken.
