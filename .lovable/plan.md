## Diagnosis

The live API at `https://api.thriftbeam.com/posts` responds **200 OK** with an **empty `items` array** (no posts in the database yet). Every public route is wired correctly to call the API via `publicPostsApi`, but each one falls back to `seedPosts` from `src/lib/mockData.ts` when the API returns an empty list. That fallback is why the homepage still renders demo articles.

The API base URL is already correct (`https://api.thriftbeam.com`). No `localhost`, `sampleData`, or `fakeData` references exist anywhere.

## Changes

### 1. `src/lib/mockData.ts`
- Delete `seedPosts` (lines ~142–172) and the exported `posts` array (line 173).
- Keep everything else: `categories`, `authors`, `tools`, `Post` type, `getAuthor`, `getCategory`, `getRelated`, `formatDate`, `formatUSD`, `bodyTemplate`, `daysAgo`. These are taxonomy/team/calculator helpers, not blog content.

### 2. `src/routes/index.tsx` (homepage)
- Remove `posts as fallbackPosts` import.
- Replace `const latest = data && data.length ? data : fallbackPosts.slice(0, 6);` with `const latest = data ?? [];`.
- Render an empty state ("No articles published yet — check back soon.") when `!isLoading && latest.length === 0`.
- Keep loading + error UI.

### 3. `src/routes/blog.index.tsx`
- Remove `fallbackPosts` import and all three fallback expressions.
- Drive grid, popular sidebar, and tag list purely from `data?.posts ?? []`.
- Show an empty state when the list is empty and not loading.

### 4. `src/routes/blog.$slug.tsx`
- Remove the `fallbackPosts.find(...)` fallback on line 94.
- On 404 from the API, render the route's `notFoundComponent` (let the error bubble up via React Query / loader) instead of substituting a mock post.

### 5. `src/components/SearchModal.tsx`
- Replace the in-memory `posts` search with `publicPostsApi.list({ q: query, per_page: 8 })` (debounced ~200 ms). Show loading/empty states. Keep result-card markup.

### 6. `src/routes/sitemap[.]xml.ts`
- Replace the static `posts` import with a server-side `publicPostsApi.list({ per_page: 500 })` call so the sitemap reflects real published posts. Keep `categories` and `tools` static (those are not API-driven).

### 7. `src/routes/__root.tsx`
- Audit the `import { posts }` usage (line 19). If it's only used for JSON-LD/OG defaults on the root, drop it; if it builds a structured-data graph, switch to a small static fallback (site name only) — never article data.

### 8. `src/lib/api/publicPosts.ts`
- Replace the two `mockData` imports (`authors`, `categories`) used inside `findAuthor` / `findCategorySlug` with simple pass-through normalization: return the slug/name the API gives us verbatim (lowercased, hyphenated). This decouples the API client from static seed lists so an unknown author/category from the live DB renders correctly instead of silently falling back to `authors[0]`.

## What stays mock (intentional)

- `categories` (6 finance topics) — taxonomy, not content.
- `authors` (editorial team bios) — static team page data.
- `tools` (calculator catalog) — these ARE the calculator pages; they're code, not API data.
- All helper functions and the `Post` type.

## Verification

1. Reload `/` → hero + categories + tools render; "Latest articles" shows the empty state (since API returns 0 posts).
2. `/blog` → empty state, no demo cards.
3. `/blog/<any-slug>` → 404 page.
4. Once posts are added to the MySQL DB, every page populates automatically — no further frontend changes needed.
5. Search across the codebase confirms zero remaining references to `fallbackPosts` or `seedPosts`.
