# Phase 3 — Polish & QA

Legal/marketing pages (About, Contact, Privacy, Disclaimer) already exist and are theme-consistent. Phase 3 is the final polish pass per the original plan: search refinement, 404 styling, accessibility, and mobile QA — plus light touch-ups on the existing pages where audit findings warrant.

## 1. Page audits (About, Contact, Privacy, Disclaimer)

Read each route end-to-end and confirm:
- Distinct `head()` metadata (title, description, og:title, og:description, canonical) — already in place; verify no copy-paste of home meta.
- Single `h1`, ordered heading hierarchy, semantic landmarks, alt text on images.
- All interactive elements (FAQ `<details>`, social links, form fields) keyboard-reachable with visible focus rings.

Specific touch-ups expected:
- **Contact form**: replace inline `<style>` block with Tailwind utility classes on inputs (border, focus ring uses `ring-primary/30`); add `aria-label` to social icon links instead of generic "Social"; add `htmlFor`/`id` pairing on `FormField`.
- **Privacy / Disclaimer**: confirm `LegalLayout` TOC anchor links have `focus-visible` styling and that `scroll-mt-24` clears the sticky navbar at mobile widths too (bump to `scroll-mt-28` if needed).
- **About**: image `loading="lazy"` is set; verify team avatars have meaningful alt (name).

## 2. Search refinement (`SearchModal.tsx`)

Current modal works but is thin. Refinements:
- Add result highlighting — bold the matched substring in title.
- Group results by category when query is empty (show 2 per top category, "Recent" label).
- Empty-state copy: add small CTA ("Browse all posts →" linking `/blog`).
- A11y: add `role="dialog"`, `aria-modal="true"`, `aria-label="Search"`; trap focus inside modal; restore focus to trigger on close.
- Add small "↵ to open" hint next to ESC kbd; arrow-key navigation through results with Enter to open.
- Debounce filtering is unnecessary (in-memory) but memoize `results` with `useMemo`.

## 3. 404 styling (`__root.tsx` `NotFoundComponent`)

Current 404 is functional but plain. Upgrade:
- Add a large display-style numeral ("404") with gradient text using brand tokens.
- Add a secondary action: "Browse articles" linking `/blog` alongside "Back to Home".
- Add a small "Popular right now" list (3 featured posts from `mockData`) so users land somewhere useful.
- Add `<head>` meta with `noindex` for the 404 response.
- Apply same polish to `ErrorComponent` (keep retry + home, add subtle icon).

## 4. Accessibility pass (site-wide)

Run a focused audit and fix:
- **Icon-only buttons**: every `<button>`/`<a>` with just a Lucide icon gets `aria-label` (Navbar search/menu/theme toggle, Footer socials, Contact socials, SearchModal close, mobile hamburger).
- **Color contrast**: scan for any `text-muted-foreground` on `bg-surface` combos that drop below 4.5:1 — adjust token if needed.
- **Focus rings**: ensure all interactive elements show `focus-visible:ring-2 focus-visible:ring-primary/40` (buttons, links, form inputs, FAQ summaries, cookie banner buttons).
- **Skip link**: add a "Skip to content" link in `__root.tsx` that becomes visible on focus and jumps to `<main id="main">`.
- **Forms**: associate every label/input via `htmlFor`/`id` (Contact form, Newsletter signup).
- **Headings**: verify no skipped levels on any route.
- **Reduced motion**: ensure animations respect `prefers-reduced-motion` (announcement bar marquee, hover lifts).

## 5. Mobile QA sweep

Browser-test at 320, 375, 414, 768 px on each route:
- `/`, `/blog`, `/blog/[slug]`, `/tools`, `/tools/[slug]` (one calculator), `/about`, `/contact`, `/privacy`, `/disclaimer`, and an unmatched URL for 404.

For each, confirm:
- No horizontal scroll, no overlapping elements.
- Tap targets ≥ 44×44.
- Navbar hamburger opens/closes; SearchModal usable on mobile.
- Cookie banner doesn't trap viewport.
- Sticky TOC on `LegalLayout` is hidden on mobile (already `hidden lg:block`); confirm prose width and section padding feel right.
- Charts on calculators don't overflow on 320px.
- Contact form inputs aren't zoomed by iOS Safari (font-size ≥ 16px on inputs).

Screenshot deltas reported back in chat.

## Out of scope

- No new routes, content sections, or backend.
- No design-system rework — only token-aligned polish.
- No homepage / tools logic changes.
- No analytics or consent backend (CookieConsent UI only).

## Files expected to change

- `src/components/SearchModal.tsx` — refinement + a11y
- `src/routes/__root.tsx` — 404 + error polish, skip link, single `<main id="main">`
- `src/routes/contact.tsx` — Tailwind input classes, label associations, social aria-labels
- `src/components/LegalLayout.tsx` — focus styles on TOC, scroll-margin tweak
- `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `src/components/NewsletterSignup.tsx`, `src/components/CookieConsent.tsx` — aria-labels, focus rings, label associations as needed
- `src/styles.css` — reduced-motion media query if any animation lacks it
