# Phase 2 QA — Findings & Fixes

I probed the live API (`https://thriftbeam.com/api/*`) and cross-checked each client + consumer against the actual response shapes. Below is the QA result for the 13 items, then the exact patches needed.

## QA results

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | `/admin/login` cleanup | ✓ | Demo hint + placeholder removed last phase. |
| 2 | Categories CRUD | ⚠️ | `GET /categories` returns `data: [...]` directly (no `items` wrapper) — current `list()` already handles arrays, so list works. Normalizer drops `icon`, `color`, `sort_order`, `post_count`; not used by the UI today, safe. |
| 3 | Users CRUD | ✓ (requires login) | Endpoint 401s without auth as expected; shape matches normalizer's tolerant fields. |
| 4 | Media upload/list/delete | ✓ | XHR upload with progress is wired; normalizer accepts `mime_type`/`public_url`/etc. |
| 5 | Comments moderation | ✓ | List + status update OK. |
| 6 | Newsletter admin | ✓ | List + delete OK. |
| 7 | Pages CRUD | ⚠️ | `GET /pages` returns rows without `status` → every page renders as "draft". Default to `"published"` when the backend omits `status` (pages exist = published). |
| 8 | Settings load + save | ✗ | **Real bug.** `GET /settings` returns **nested groups** (`{cache:{...}, cookies:{...}, seo:{...}, newsletter:{...}, integrations:{...}, maintenance:{...}}`), NOT a flat key/value map. UI tries to read `draft["site_title"]` etc., which are undefined; saving `PUT /settings/site_title` will 404. Need to (a) flatten nested groups → dotted keys on load and (b) save the whole group back, or accept current shape and rewrite the FIELDS map. Lowest-risk fix: hydrate the draft from the nested shape using the existing flat keys where they exist (`seo.default_title` → `site_title` alias) and POST changes to `PUT /settings` with the full nested payload. See "Technical notes" for the exact mapping. |
| 9 | Homepage latest posts | ✓ | Confirmed in network log — 3 posts render. |
| 10 | `/blog` filters + pagination | ⚠️ | Client sends `?category=<slug>`; backend likely keys on `category_slug`. Add both params for safety (`category` and `category_slug`); same for `tag`. |
| 11 | `/blog/:slug` post + comments | ⚠️ | (a) `commentsApi.submit` sends `author` but PHP backends conventionally accept `name` — send both. (b) Approved comments endpoint already handled. |
| 12 | Newsletter signup form | ✓ | Subscribe path works. |
| 13 | Contact form | ✓ | Simple POST, no normalization needed. |

### Additional runtime bug surfaced during QA

**Hydration mismatch on PostCard date.** Console shows `+ May 24, 2026` (server) vs `- May 23, 2026` (client). Cause: backend dates come as `"2026-05-26 20:01:51"` (no `T`, no `Z`). `new Date(...).toLocaleDateString("en-US")` interprets that string as local time, so the server (UTC) and client (other TZ) disagree.

Fix in two places:
1. `normalizeToPublicPost` (publicPosts.ts): convert `"YYYY-MM-DD HH:MM:SS"` → `"YYYY-MM-DDTHH:MM:SSZ"` so the value is unambiguous UTC.
2. `formatDate` (mockData.ts): pass `{ timeZone: "UTC" }` to `toLocaleDateString` so SSR and client agree.

## Patches

### `src/lib/api/settings.ts`
Replace the flatten logic with a nested-group hydrator + a flat-key writer that maps back to the group/field the backend expects:

```ts
// Flatten nested groups into dotted keys ("seo.default_title")
// AND alias common admin-UI keys to their nested counterparts
// (e.g. site_title → general.site_title, allow_comments → discussion.allow_comments).
// update(key, value): split "group.field"; if no dot, look it up in ALIASES.
// Send PUT /settings with { [group]: { [field]: value } } (PHP backend merges).
```
The admin Settings UI doesn't change — its existing FIELDS keys are kept and the client resolves them via an ALIAS map.

### `src/lib/api/pages.ts`
`norm()`: default `status` to `"published"` when missing (backend currently omits it for existing pages).

### `src/lib/api/comments.ts`
`submit()`: include both `author` and `name` (and `body`/`content`) in the payload so it works regardless of which field name the backend expects.

### `src/lib/api/publicPosts.ts`
- Add `toISO()` helper: if `date` matches `/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/`, replace the space with `T` and append `Z`.
- `list()`: send `category` AND `category_slug` (same for `tag`/`tag_slug`) when those filters are set.

### `src/lib/mockData.ts`
`formatDate()`: add `timeZone: "UTC"` to the `toLocaleDateString` options.

### No UI/markup changes
All edits are inside `src/lib/api/*.ts` and the two formatters. No route components, no layouts.

## Verification after patch
1. Reload `/` — hydration warning gone in console.
2. Sign in, open `/admin/settings`, toggle "Allow comments", save, refresh → value persists.
3. `/admin/pages` shows real status badge ("published") instead of all "draft".
4. `/blog?category=budgeting` filters to that category.
5. Submit a comment on `/blog/hi` → success toast, "pending review" message.

Report ✓ / ✗ per item with any remaining toast errors.
