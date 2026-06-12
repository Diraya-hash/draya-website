# Draya | دراية — Corporate Website

A bilingual (Arabic/English) corporate website for **Draya**, a Saudi consulting firm specializing in Learning & Development, Talent Management, Leadership Development, Career Development, and Learning Needs Analysis.

## Tech Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS 3**
- **IBM Plex Sans Arabic** via `next/font` (Arabic + Latin)

## Internationalization

- Arabic (`ar`) is the **default locale** with full **RTL** support; English (`en`) is secondary (LTR).
- `middleware.ts` redirects `/` (and any un-prefixed path) to `/ar/...`.
- All routes live under `app/[locale]/`, and `<html lang dir>` is set per locale.
- Content lives in typed dictionaries: `lib/dictionaries/ar.ts` and `lib/dictionaries/en.ts` (the `en` dictionary is type-checked against the `ar` shape, so missing translations fail the build).

## Pages

| Route | Page |
|---|---|
| `/{locale}` | Home — hero, stats, services preview, why us, CTA |
| `/{locale}/services` | Services — 5 detailed service sections with deliverables |
| `/{locale}/about` | About — story, mission/vision, values, 5-stage methodology |
| `/{locale}/insights` | Insights — featured article + article grid |
| `/{locale}/contact` | Contact — form + contact information |

## Project Structure

```
app/
  globals.css            # Tailwind layers + shared component classes
  [locale]/
    layout.tsx           # Root layout (html dir/lang, fonts, navbar, footer)
    page.tsx             # Home
    services/page.tsx
    about/page.tsx
    insights/page.tsx
    contact/page.tsx
components/
  Navbar.tsx             # Sticky nav, mobile menu, language switcher
  Footer.tsx
  Logo.tsx
  SectionHeading.tsx
  ServiceIcon.tsx
  ArrowIcon.tsx          # Direction-aware arrow (flips in RTL)
  ContactForm.tsx        # Client component with placeholder submit
lib/
  i18n.ts                # Locale config and helpers
  dictionaries/          # ar.ts (source of truth), en.ts, index.ts
middleware.ts            # Locale detection / redirect to /ar
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/ar`.

## Notes

- The contact form submit is a placeholder; wire it to an API route or email service when ready.
- Brand palette: deep navy `#0B1F3A` + gold `#B68A35` on warm sand/white backgrounds.
