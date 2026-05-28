
# Live API Integration — Full Rewire

This is a large, multi-area change. I'll deliver it in 12 grouped phases that map 1:1 to your spec. The existing `src/lib/api.ts` client (token in `tb_token`, Bearer header, 401 → `/admin/login`, `{ok,data}` envelope unwrap) already matches your contract, so all new code builds on it.

## Phase 1 — Global SettingsProvider
- New `src/lib/api/siteSettings.ts`: `siteSettingsApi.getAll()` → `GET /settings`, `update(key, value)` → `PUT /settings/{key}`.
- New `src/context/SettingsContext.tsx`:
  - TanStack Query `['site-settings']`, `staleTime: 0`, `refetchInterval: 60_000`, `refetchOnWindowFocus: true`.
  - `useSettings()` hook returning grouped settings + `isLoading` + `refresh()`.
  - Side-effect `useEffect` applies `theme.accent_color`, `theme.secondary_color` as CSS vars on `documentElement`, toggles `dark` class from `theme.mode`, and injects `theme.custom_css` into a managed `<style id="tb-custom-css">`.
- Mount `<SettingsProvider>` inside `RootComponent` in `src/routes/__root.tsx` (inside the existing `QueryClientProvider`).

## Phase 2 — Wire public components to settings
Replace hardcoded content in:
- `AnnouncementBar` → `settings.announcement.{enabled,text,link,background,textColor}`.
- `Navbar` → `settings.navbar.links[]` + `settings.site.title`.
- `index.tsx` hero block → `settings.hero.{title,subtitle,cta_text,cta_url}`.
- `Footer` → `settings.footer.copyright`, `settings.footer.social.*`.
- `CookieConsent` → `settings.cookies.*`; on accept `POST /cookies/log`.
- Analytics injectors (new `src/components/AnalyticsScripts.tsx` mounted in root): conditional GA, FB Pixel, AdSense based on `settings.analytics.*`.

## Phase 3 — MaintenanceWrapper
- New `src/components/MaintenanceWrapper.tsx`: if `settings.maintenance.enabled` AND route does not start with `/admin` AND no valid `tb_token` user, render `MaintenancePage` (using `settings.maintenance.message`). Otherwise render children.
- Apply inside `__root.tsx` around `<Outlet />` (admin routes self-exempt by path check).

## Phase 4 — Admin Dashboard real data
- Extend `src/lib/api/dashboard.ts` to match new shape (`stats`, `visitors_30d`, `top_categories`, `recent_posts`, `pending_comments`).
- Rewrite `admin._authenticated.index.tsx`: `useQuery(['dashboard'], dashboardApi.get, { staleTime: 0, refetchInterval: 30_000, refetchOnWindowFocus: true })`. Loading skeletons, error toast, empty states. Delete `mockStats`/`mockChartData`.
- Add "Clear Site Cache" button (Phase 9).

## Phase 5 — Admin settings pages wired to API
Pattern per page (`useQuery(['settings', key])` + `useMutation(PUT /settings/{key})` + on success: toast, `invalidateQueries(['site-settings'])`, `invalidateQueries(['dashboard'])`):
- General → `/settings/site`
- Theme → `/settings/theme`
- Maintenance → `/settings/maintenance`
- Announcement → `/settings/announcement`
- Navbar → `/settings/navbar`
- Footer → `/settings/footer`
- Hero → `/settings/hero`
- SEO → `/settings/seo`
- Cookies → `/settings/cookies`
- PWA → `/settings/pwa`
- Notifications → `/settings/notifications`
- Analytics → `/settings/analytics`

Existing `admin._authenticated.settings.tsx` keeps generic flat editor; new dedicated pages get structured forms.

## Phase 6 — Posts real-time
- Public `publicPostsApi` queries on home + blog: `staleTime: 0`, `refetchOnWindowFocus: true`, `refetchOnMount: 'always'`.
- Admin create/update/delete success: invalidate `['posts']`, `['homepage']`, `['dashboard']`, call `POST /cache/clear`, toast "Published! Live on site in 5 seconds."

## Phase 7 — Pages CMS
- `src/lib/api/pages.ts`: `list()` GET `/pages`, `get(slug)` GET `/pages/{slug}`, `update(slug, body)` PUT `/pages/{slug}`.
- Admin `pages.index.tsx` + `pages.$id.edit.tsx`: list + edit (title, content via RichEditor, meta_title, meta_description).
- Frontend routes `about`, `contact`, `privacy`, `disclaimer`, plus new `terms.tsx`: fetch corresponding page via TanStack Query and render `dangerouslySetInnerHTML` from sanitized `page.content`.

## Phase 8 — Analytics page
- `admin._authenticated.analytics.tsx`: GET `/analytics`, show "Connect Google Analytics" or "Connected ✓" based on `ga_id`. Pull view counts from `/dashboard`. Delete fake charts/numbers (keep a minimal real chart driven by `visitors_30d`).

## Phase 9 — Cache management
- Dashboard button + `admin._authenticated.cache.tsx`: `POST /cache/clear` → on success `queryClient.clear()` + toast.

## Phase 10 — Remove all remaining mock data
Sweep and delete from:
- `src/lib/mockAdminData.ts` (remove file; migrate types to per-feature `*.ts`).
- `src/lib/adminStore.ts` (drop mock seeds; keep only UI state).
- Admin routes still importing mocks: `posts.index`, `users`, `seo`, `media`, `pages.index`, `integrations`, `newsletter`, `notifications`, `comments`, `backup`, `pages.$id.edit`.
- API client files (`users.ts`, `comments.ts`, `newsletter.ts`, `pages.ts`, `media.ts`, `posts.ts`, `publicPosts.ts`) — drop residual mock fallbacks; keep type defs.
- Public surfaces: `PostCard`, `CategoryCard`, `SearchModal`, `Footer`, `about.tsx`, `sitemap[.]xml.ts`, `blog.*`, `tools.*` — switch any sample arrays to API or to the curated taxonomy that's explicitly app data (categories list, calculator catalog stay — they are config, not mock content).

Hardcoded author names (Sara Okafor / Maya Chen / James Rivera / Priya Shah) removed everywhere.

## Phase 11 — Error handling + UX
- All mutations: try/catch + `toast.error(err.message)`.
- All queries: render `<Skeleton>` while `isLoading`, empty-state component with helpful copy when empty.
- 401 already handled in `apiFetch` (existing behavior).

## Phase 12 — Auth flow
- `admin.login.tsx` confirmed to `POST /auth/login`, store via existing `saveAuth(token, user)`.
- `_authenticated.tsx` guard: if no `tb_token`, redirect to `/admin/login?redirect=…`.
- Logout button: `clearAuth()` + `queryClient.clear()` + redirect `/`.

## What stays (intentional, not mock)
- `categories` array (taxonomy), `tools` catalog (calculator pages are code, not API data), `authors` removed unless backend exposes a `/team` endpoint — I'll replace About page bios with `/pages/about` content.

## Verification checklist
1. Reload `/` → header, hero, footer, announcement, cookies all reflect `/settings`; change in admin → visible within 60s (or instant via `refresh()`).
2. Toggle Maintenance → public site shows maintenance page, `/admin` still reachable.
3. Dashboard shows live stats; auto-refresh every 30s.
4. Each settings page: load → edit → save → toast → refetch confirms persistence.
5. Create post in admin → appears on `/` and `/blog` within seconds after cache clear.
6. `/about`, `/contact`, `/privacy-policy`, `/disclaimer`, `/terms` render content from `/pages/{slug}`.
7. `rg "mock|sample|fake|dummy|Sara Okafor|Maya Chen"` in `src/` returns zero data references.
8. Login → token stored, admin loads; logout clears + redirects; 401 anywhere redirects to login.

## Notes / risks
- This is ~30 file edits. I'll proceed in the phase order above so each phase is independently verifiable.
- Unknown API response shapes for some `/settings/{key}` groups — I'll code defensively (treat missing fields as defaults) and surface raw JSON in a debug panel only in dev.
- `custom_css` injection is XSS-trusted by admin-only origin; safe because only authenticated admins can write it.
