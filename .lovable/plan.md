
# Phase C — Settings & Management

Replace all remaining "Coming Soon" stubs with fully functional, mock-driven admin screens. Reuse existing primitives (`DataTable`, `Modal`, `ConfirmDialog`, `Badge`, `EmptyState`, `StatCard`, `RichEditor`, `SeoPanel`) and the `adminStore` pattern. Public site untouched.

## 1. Mock data + store extensions

Extend `src/lib/mockAdminData.ts` and `src/lib/adminStore.ts`:

- `AdminUser` (id, name, email, role: admin/editor/author/subscriber, avatar, status, lastLogin, postsCount) — seed ~12 users.
- `Subscriber` (id, email, name?, status: subscribed/unsubscribed/bounced, source, subscribedAt) — seed ~80.
- `NewsletterCampaign` (id, subject, status: draft/scheduled/sent, sentAt, recipients, openRate, clickRate) — seed ~6.
- `Integration` (id, name, category, connected, apiKey?, lastSync) — Google Analytics, Search Console, Mailchimp, Sendgrid, Stripe, Cloudflare, Algolia, Disqus.
- `CookieCategory` (id, name, description, required, enabled) — necessary, analytics, marketing, preferences.
- `Notification` (id, type, title, body, read, createdAt) — seed ~15.
- `SiteSettings` singleton (general, seo, analytics, theme, maintenance, pwa, cache, backup) — single mutable object exposed through `settingsApi`.
- `BackupSnapshot` (id, createdAt, size, type: auto/manual, status).
- `Add `usersApi`, `subscribersApi`, `campaignsApi`, `integrationsApi`, `notificationsApi`, `settingsApi`, `backupsApi` to `adminStore.ts`.

## 2. Screens

### Users — `/admin/users`
- StatCard row: Total, Admins, Editors, Subscribers.
- `DataTable`: avatar, name+email, role (`Badge`), status, posts count, last login, actions.
- "Add User" modal (name, email, role, password) and Edit modal (same fields, no password).
- Delete via `ConfirmDialog`. Role change inline via Select.

### Newsletter — `/admin/newsletter`
- Two tabs: **Subscribers** and **Campaigns**.
- Subscribers: StatCard (Total, Subscribed, Unsubscribed, Bounced), search + status filter, `DataTable` (email, name, status, source, date, actions), Import CSV button (mock-parses textarea), Export CSV (mock toast), bulk unsubscribe/delete.
- Campaigns: list view with cards (subject, status `Badge`, recipients, open/click rates, sent date). "New Campaign" → modal with subject + Tiptap body + audience select + Send/Schedule/Save Draft.

### SEO — `/admin/seo`
- Tabs: **Global**, **Sitemap**, **Robots**, **Redirects**.
- Global: form (site title template, default meta description, default OG image picker via MediaPicker, Twitter handle, JSON-LD organization fields).
- Sitemap: read-only list of generated URLs from posts/pages with last-modified, "Regenerate" button (toast).
- Robots: monospaced textarea editor with default content + Save.
- Redirects: `DataTable` (from, to, type 301/302, hits, actions) + Add/Edit modal.

### Analytics — `/admin/analytics`
- Date range picker (7d/30d/90d/custom).
- StatCards: Visitors, Pageviews, Avg. Session, Bounce Rate.
- Charts (recharts): visitors over time (Area), top pages (Bar), traffic sources (Pie), devices (Donut).
- Real-time card: active users + recent activity feed.

### Integrations — `/admin/integrations`
- Grid of integration cards (icon, name, description, status `Badge`, Connect/Disconnect/Configure button).
- Configure opens modal with relevant fields (API key, etc.) — saved into store.

### Cookies — `/admin/cookies`
- Banner preview (left) + settings form (right).
- Form fields: banner text, accept-button label, decline-button label, position select, theme toggle, cookie categories list (toggle enabled, edit description).
- "Reset to defaults" + Save.

### Cache — `/admin/cache`
- StatCards: Cache Size, Hit Rate, Cached Pages, Last Cleared.
- Toggles: Page cache, Browser cache, Object cache, Minify HTML/CSS/JS, Lazy-load images.
- Buttons: "Clear All Cache", "Clear Page Cache", "Preload Cache" — all toast + simulated progress.

### Theme — `/admin/theme`
- Two-column: live preview iframe-style card on left (renders site nav/hero swatches), controls on right.
- Controls: primary color (hex picker), accent color, font select (Inter/Manrope/Plus Jakarta), border-radius slider, dark/light mode toggle (admin-scoped preview only — does NOT touch global site styles), logo + favicon upload via MediaPicker.
- Save persists into `settingsApi.theme` (no side effects on public site).

### Backup — `/admin/backup`
- Schedule form: frequency select (off/daily/weekly), retention slider, storage destination select.
- "Create Backup Now" button → simulated progress, adds row.
- `DataTable` of snapshots: date, size, type, status, actions (Download mock / Restore via `ConfirmDialog` / Delete).

### Maintenance — `/admin/maintenance`
- Toggle: Maintenance mode on/off.
- Form: custom title, custom message (Tiptap), retry-after, allowed-IPs textarea, scheduled-end datetime.
- Preview card showing how the maintenance page will render.
- "Run Diagnostics" button → mock checks list (DB, cache, mail, storage) with pass/fail icons.

### PWA & Push — `/admin/pwa`
- Manifest form: app name, short name, description, theme color, background color, display mode, icon upload (MediaPicker).
- Service worker toggle + cache strategy select.
- Push notifications: subscriber count StatCard, send test push form (title, body, URL).

### Tools — `/admin/tools`
- Grid of tool cards, each opens a modal:
  - Import (WordPress XML / Markdown ZIP — textarea or file mock).
  - Export (Posts/Pages/Users as JSON or CSV — generates downloadable blob client-side).
  - Search & Replace (find/replace text + dry-run/apply).
  - Database Optimize (mock progress bar).
  - Regenerate Thumbnails (mock progress).
  - Health Check (lists checks with status).

### General Settings — `/admin/settings`
- Tabbed form: **General**, **Reading**, **Writing**, **Discussion**, **Permalinks**.
- General: site title, tagline, admin email, timezone, date format, language.
- Reading: posts per page, homepage displays (latest posts / static page select), excerpt length.
- Writing: default category, default post format, markdown toggle.
- Discussion: allow comments toggle, moderation rules, blacklist textarea.
- Permalinks: structure select with preview (e.g. `/blog/%postname%`).
- Each tab has its own Save button writing to `settingsApi`.

### Notifications — `/admin/notifications`
- Left column: notification list grouped by date with unread dots, filter (All/Unread/System/Comments/Users), "Mark all read", "Clear all".
- Right column: detail panel for selected notification.
- Also wire bell icon in `AdminTopbar` to badge unread count + dropdown preview (top 5).

## 3. New shared components

- `src/components/admin/ColorPicker.tsx` (text+swatch input).
- `src/components/admin/FilterBar.tsx` (search + selects).
- `src/components/admin/ToolCard.tsx`.
- `src/components/admin/IntegrationCard.tsx`.
- `src/components/admin/SettingsSection.tsx` (titled form section).

## 4. Routing

Rewrite every existing stub under `src/routes/admin._authenticated.{users,newsletter,seo,analytics,integrations,cookies,cache,theme,backup,maintenance,pwa,tools,settings,notifications}.tsx`. No new route files needed (everything fits in single-route screens; tabs are in-component).

## 5. Topbar wiring

Update `AdminTopbar.tsx` to read live unread count from `notificationsApi` and add a dropdown for the latest five. (Scope is limited to the topbar; existing chrome/layout untouched.)

## 6. Constraints

- Public site routes/components: zero changes.
- Tokens only from `src/styles.css` admin namespace.
- All mutations go through `adminStore` + emit `sonner` toast.
- Destructive actions through `ConfirmDialog`.
- No real network calls; CSV imports/exports use client-side Blob.
- Theme/General/SEO/etc. settings live in mock store only — they do NOT alter the public site styling or metadata.

## Verification

1. Add/edit/delete a user; role change reflects in row badge.
2. Newsletter: import 5 mock subscribers via textarea → list updates; create a draft campaign → appears under Campaigns.
3. SEO: edit redirects + global form, switch tabs, values persist in-session.
4. Analytics: change date range → charts re-render with regenerated mock series.
5. Integrations: Connect Google Analytics → badge flips to Connected, persists.
6. Cookies: toggle a category, banner preview reflects it.
7. Cache: click Clear All → progress toast, "Last Cleared" StatCard updates.
8. Theme: change primary color → preview swatches update only (verify `/`, `/blog` unchanged).
9. Backup: create snapshot → new row, delete with confirm.
10. Maintenance: toggle on → preview shows maintenance card; public site routes still render normally.
11. PWA: edit manifest fields, send test push → toast.
12. Tools: Export posts as JSON → file downloads.
13. Settings: switch tabs, save each section, values persist.
14. Notifications: mark all read → topbar badge clears; click item → detail panel.
15. Public routes `/`, `/blog`, `/tools/$slug`, `/about`, `/contact`, `/privacy`, `/disclaimer` render unchanged.

