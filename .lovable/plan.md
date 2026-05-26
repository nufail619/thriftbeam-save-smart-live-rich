# ThriftBeam Admin Panel — Phase A (Foundation)

Per the brief, the build ships in 3 phases with verification between each. This plan covers **Phase A only**. Phases B (content) and C (settings) will be planned after A is verified working.

## Guardrails (apply to all 3 phases)

- **Do not touch the public site.** No edits to `src/routes/{index,blog.*,tools.*,about,contact,privacy,disclaimer}.tsx`, `__root.tsx`, or any existing component under `src/components/` outside the new `src/components/admin/` folder. Existing tokens in `src/styles.css` are reused, not modified.
- **No backend.** All data is mock; CRUD mutates in-memory via Zustand. The PHP backend will be wired later.
- **Same stack.** TanStack Start file routes, TanStack Router, sonner, Recharts, lucide-react, react-hook-form + zod, Tailwind tokens.
- **Admin theme is light only.** Reuses existing Inter font, `--primary` blue, coral accent. Admin-specific surfaces (`#F8FAFC` content bg, `#E2E8F0` borders) are added as scoped CSS vars (`--admin-bg`, `--admin-border`, `--admin-sidebar`) in `src/styles.css` under a single block — no token rename, no dark-mode work.
- **Lazy-loaded routes.** Each admin route file is split automatically by the TanStack Router plugin (no exported components in route files).

## Phase A scope

### Routes (file-based, under `src/routes/admin/`)

```
src/routes/admin/
  _authenticated.tsx   → pathless layout: auth guard + AdminShell wrapper
  _authenticated/
    index.tsx          → /admin (dashboard)
  login.tsx            → /admin/login (public)
```

Sidebar links for routes that don't exist yet (Posts, Pages, etc.) render but navigate to a placeholder route component shown as "Coming in Phase B/C" — keeps the sidebar truthful without 404s. These placeholders are stub files under `src/routes/admin/_authenticated/` and are replaced with real screens in later phases.

### Mock auth

- `src/lib/adminAuth.ts` — pure functions: `login(email, password)`, `logout()`, `getToken()`, `getUser()`, `recordFailedAttempt()`, `isLockedOut()`.
- Hardcoded creds: `admin@thriftbeam.com` / `admin123`.
- On success: write `tb_token` (fake JWT-shaped string: `header.payload.signature` base64) and `tb_user` JSON `{ id, name, email, role: "admin" }` to `localStorage`.
- Lockout: store `tb_attempts` (array of timestamps) — 5 failures within 15 min triggers lockout; UI shows countdown to oldest-attempt + 15min.
- Guard in `_authenticated.tsx` via `beforeLoad` reading `localStorage` (client only — `typeof window` check returns `{}` during SSR; client renders auth state after hydration; if no token, `throw redirect({ to: '/admin/login', search: { redirect: location.href } })`).
- Logout clears storage + navigates to `/admin/login`.

### Layout (`src/components/admin/`)

- **AdminShell.tsx** — flex container: `<AdminSidebar />` + `<div>{<AdminTopbar />}{<main>{children}</main>}</div>`. Uses `--admin-bg` for content area.
- **AdminSidebar.tsx** — vertical nav, grouped per brief (Overview / Content / Audience / Marketing / Settings) with uppercase `text-xs` dividers. Active item: `bg-primary text-primary-foreground rounded-xl`. Desktop: fixed `w-64`. Mobile: off-canvas drawer toggled from topbar hamburger (uses existing `Sheet` from `src/components/ui/sheet.tsx`).
- **AdminTopbar.tsx** — sticky `h-16` white bar: hamburger (mobile) · page title (derived from current route via `useRouterState`) · "View site →" link to `/` (opens in new tab) · user avatar dropdown (uses existing `DropdownMenu`) with Profile (disabled placeholder) and Logout.

### Reusable primitives (`src/components/admin/`)

- **StatCard.tsx** — icon, label, big number, delta (+/- % with arrow, green/red).
- **DataTable.tsx** — generic `<T>` table: columns config, sortable headers (asc/desc), client-side search, pagination (20/page), optional row selection (checkbox + bulk-action slot), empty state slot. Built on existing `src/components/ui/table.tsx`.
- **Modal.tsx** — thin wrapper over existing `Dialog`.
- **ConfirmDialog.tsx** — over existing `AlertDialog`: title, description, destructive variant.
- **Badge.tsx** — admin status badge variants: `published` `draft` `scheduled` `pending` `approved` `spam` `trash`. Built on existing `ui/badge.tsx`.
- **EmptyState.tsx** — icon, title, body, optional CTA button.

### Login page (`/admin/login`)

- Centered card on `--admin-bg`. ThriftBeam wordmark at top (text, no asset dependency).
- Form: email, password (with show/hide toggle), "Remember me" (no-op checkbox), Sign In.
- react-hook-form + zod schema (email format, min 1 password).
- "Forgot password?" link → `toast("Password reset coming soon")`.
- On submit: call `adminAuth.login`; on success → `navigate({ to: search.redirect ?? '/admin' })`; on failure → error toast + increment attempts; if locked out → disable form + show countdown timer (updates every second via `setInterval`).
- If already authenticated (token present), `beforeLoad` redirects to `/admin`.

### Dashboard (`/admin`)

- 4 `StatCard`s (responsive grid 1/2/4): Total Posts 47, Total Views 24,891, Subscribers 10,234, Comments Pending 12 — each with mock delta.
- 2-col section (stacks on mobile):
  - Recharts `LineChart` — "Visitors last 30 days" (30 mock data points, blue stroke, no fill, light grid).
  - Recharts `BarChart` — "Top categories by views" (6 mock categories, blue bars).
- Recent posts table (5 rows) using `DataTable`: Title, Category, Status (Badge), Date, Actions (Edit/View — actions are stubs that toast "Coming soon" until Phase B).
- Pending comments mini-list (3 items): avatar (initials), name, excerpt, post title, Approve/Reject quick actions (toast feedback, no state change yet).

### Mock data (Phase A subset)

`src/lib/mockAdminData.ts` — start with what the dashboard needs; expand in B/C:
- `mockPosts` (10 sample posts for the recent-posts table + sidebar counts — full 47 in Phase B).
- `mockPendingComments` (3).
- `mockAnalytics` — 30 days of visitor counts + 6 category buckets.
- `mockDashboardStats` — the 4 KPI numbers.

### Verification checklist (run before declaring Phase A done)

1. `/admin/login` renders; submitting wrong creds shows error toast and increments attempts; 5 wrong attempts disables the form with a visible countdown.
2. Correct creds redirect to `/admin`; `localStorage.tb_token` and `tb_user` are set.
3. Visiting `/admin` (or any `/admin/*`) without a token redirects to `/admin/login?redirect=...`; after login, redirects back to original URL.
4. Dashboard shows 4 stat cards, both charts render, recent posts table and pending comments list show mock data.
5. Sidebar groups + active highlight work on desktop; hamburger drawer works at the current 390px viewport.
6. Logout from avatar dropdown clears storage and returns to login.
7. Public site smoke test: `/`, `/blog`, `/blog/$slug`, `/tools/$slug`, `/about`, `/contact` all still hydrate with no console errors (no regressions from the new shared `styles.css` additions).
8. No edits to any pre-existing file outside `src/styles.css` (scoped admin-var block only) and `src/routeTree.gen.ts` (auto-regenerated).

## Files created in Phase A

- `src/routes/admin/login.tsx`
- `src/routes/admin/_authenticated.tsx`
- `src/routes/admin/_authenticated/index.tsx`
- `src/routes/admin/_authenticated/{posts,pages,comments,media,users,newsletter,seo,analytics,integrations,cookies,cache,theme,backup,maintenance,pwa,tools,settings,notifications}.tsx` — stub "Coming soon" pages so sidebar links resolve
- `src/components/admin/{AdminShell,AdminSidebar,AdminTopbar,StatCard,DataTable,Modal,ConfirmDialog,Badge,EmptyState}.tsx`
- `src/lib/adminAuth.ts`
- `src/lib/mockAdminData.ts`

## Files edited in Phase A

- `src/styles.css` — append a single block of admin-scoped CSS vars (`--admin-bg`, `--admin-border`, `--admin-sidebar`). No existing token changes.
- `src/routeTree.gen.ts` — auto-regenerated by the plugin (not hand-edited).

## Out of scope for Phase A

Posts CRUD + rich editor, Pages/Comments/Media, all Settings screens, Users, Newsletter, SEO/Analytics/Integrations, Cookies/Cache/Theme/Backup/Maintenance/PWA/Tools/Notifications. Sidebar entries exist but point at "Coming soon" stubs.

After Phase A is verified working, I'll plan Phase B (content management) and then Phase C (settings).
