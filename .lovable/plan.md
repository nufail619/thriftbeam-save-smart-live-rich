# ThriftBeam — Build Plan

A premium personal finance blog with a strict design system, 8 page types, 5 working calculators, dark mode, search, and cookie consent. Built on the existing TanStack Start stack (file-based routes in `src/routes/`). Forms are UI-only (mock); no backend.

I'll ship this in **3 phases**, each verified before moving on.

---

## Phase 1 — Foundation + Content Surface

**Design system (`src/styles.css`)**
- Inter from Google Fonts (preloaded, single font).
- Replace token values with the exact ThriftBeam palette in oklch equivalents of:
  - Indigo `#4F46E5` (primary), Coral `#FB7185` (accent)
  - BG `#FFFFFF` / `#0F172A`, Surface `#F8FAFC` / `#1E293B`
  - Text `#0F172A` / `#F1F5F9`, muted `#64748B`, border `#E2E8F0` / `#334155`
  - Success/warning/error tokens
- `--radius` 16px (cards) with button variant at 12px.
- Max-width container, section padding tokens (80px / 48px), shadow + gradient utilities.
- Dark mode via `.dark` on `<html>`; persisted to `localStorage` key `tb_theme`.

**Global components (`src/components/`)**
- `AnnouncementBar` (dismissible, sessionStorage)
- `Navbar` (sticky, transparent over hero → blur+solid on scroll, hamburger sheet on mobile, search icon, theme toggle)
- `Footer` (4 columns → 2 → 1, mini newsletter)
- `CookieConsent` (slide-up banner + customize modal with 4 toggles, `tb_cookies` 90 days)
- `SearchModal` (Cmd+K, filters mock posts)
- `NewsletterSignup`, `AdSlot` (banner/square/skyscraper/in-article variants)
- `Breadcrumbs`, `PostCard`, `CategoryCard`, `Avatar`, `Badge`

**Mock data (`src/lib/mockData.ts`)**
- 6 categories (icon + color), 3 authors, 5 tools, 15 blog posts with H2/H3 body, unsplash WebP URLs.

**Routes**
- `__root.tsx`: shell with Navbar + AnnouncementBar + `<Outlet/>` + Footer + CookieConsent + theme provider; site-wide meta + Organization JSON-LD.
- `/` (`index.tsx`): hero with indigo→coral gradient mesh, 2 CTAs, trust badges, 6 category grid, 3 featured posts, 6 latest posts grid, tools teaser dark band, newsletter coral band.
- `/blog` (`blog.index.tsx`): header + filter chips, responsive grid, pagination, desktop sidebar (popular, tags, AdSlot 300x250).
- `/blog/$slug` (`blog.$slug.tsx`): breadcrumbs, reading progress bar, header w/ share buttons (FB/Twitter/LinkedIn/Copy), 16:9 hero, sticky TOC desktop, prose body with AdSlots after intro/mid/end, tags, author bio, related posts (3), mock comments + reply form, sidebar (TOC, popular, 300x600). Article JSON-LD + BreadcrumbList.

**Performance/SEO baseline applied throughout**
- All `<img>` get `loading="lazy"`, `decoding="async"`, explicit width/height.
- Per-route `head()` with unique title/description/og.
- Canonical only on leaf routes.

---

## Phase 2 — Tools + Calculators

- `/tools` (`tools.index.tsx`): header + 5 calculator cards.
- `/tools/$slug` (`tools.$slug.tsx`): shared layout — breadcrumbs, input card (left), indigo-gradient results panel (right) with live calc, AdSlots above/below, "How this works", related calculators.
- Per-calculator components in `src/components/calculators/`:
  - `BudgetCalculator` — 50/30/20 split + Recharts pie.
  - `DebtPayoff` — months, total interest, Recharts line of remaining balance.
  - `SavingsGoal` — months to goal, total interest, growth line chart.
  - `EmergencyFund` — target by months-of-expenses, time to reach.
  - `CreditCardInterest` — months/interest, side-by-side comparison if payment doubled.
- Pure JS math, USD `Intl.NumberFormat`, input validation, no external math libs. Add `recharts` via `bun add`.

---

## Phase 3 — Static pages + polish

- `/about`: mission hero, story 2-col, values 3-card grid, team 3 cards, CTA band w/ newsletter.
- `/contact`: 2-col (form left with toast on submit, info card right), FAQ accordion (5).
- `/privacy`, `/disclaimer`: prose layout with sticky TOC sidebar on desktop, sections as specified.
- 404: friendly message + "Back to Home" — extend existing `notFoundComponent` in `__root.tsx` with ThriftBeam styling.
- Final QA pass: Lighthouse-style checks (no layout shift, lazy images, no console.log), 320px mobile sweep, dark mode parity per page, all `head()` meta unique.

---

## Technical Notes

- **Routing**: TanStack Start file-based routes (not React Router). Same URLs as your spec; navigation via `<Link to=...>`.
- **Forms**: UI-only. Newsletter + contact submit triggers `sonner` toast; no persistence.
- **Icons**: `lucide-react` only.
- **State**: theme + cookie consent + dismissed announcement in `localStorage`/`sessionStorage`. No global store needed.
- **Charts**: `recharts` (added in Phase 2).
- **Search**: client-side filter over `mockData` (title + category), Cmd+K via global keydown listener in Navbar.
- **AdSense**: `<AdSlot>` renders dashed-border placeholders labeled "Advertisement" at the specified sizes.
- **No backend**: skipping Lovable Cloud per your choice.

After each phase I'll confirm it builds cleanly and the preview renders before starting the next phase.

