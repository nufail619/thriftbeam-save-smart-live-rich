# Fix post-create → edit redirect crash

## Diagnosis (from code review)

The error boundary fires on `/admin/posts/:id/edit` after `POST /posts` returns. Likely root causes, in order of probability:

1. **Response shape mismatch on create.** `PostEditor.save()` does `navigate({ params: { id: created.id } })`. If the PHP backend returns `{ ok, data: { post: {...} } }` (wrapper) instead of `{ ok, data: {...post} }`, `created.id` is `undefined` → URL becomes `/admin/posts/undefined/edit` → `GET /posts/undefined` → 404 → error UI. Same risk for `GET /posts/:id` returning `{ post }` wrapper — `data.title` etc. are then undefined and `PostEditor` crashes on `post.title.trim()` / `post.tags.map`.
2. **Field shape mismatch.** Backend likely returns snake_case (`featured_image`, `seo_title`, `reading_time`, `tags` as string/JSON) while `AdminPost` is camelCase. Missing `tags` array → `TagInput` crashes on `.map`.
3. **`id` type.** Backend may return numeric `id`; route param is a string. Works for navigation, but strict equality checks elsewhere can break — confirm.
4. **CORS preflight.** Browser sends `OPTIONS /posts` with `Authorization, Content-Type` headers. If backend doesn't echo `Access-Control-Allow-Headers: Authorization, Content-Type`, the PUT/POST is blocked even though GET works.

## Step 1 — Live diagnosis

Need test admin credentials (or please log in once in the preview so the browser tool inherits the session). Then:

- Browser-navigate to `/admin/posts`, click "New post", save → capture the `POST /posts` response body and the failing `GET /posts/:id` response.
- Inspect `OPTIONS` preflight headers for `/posts` and `/posts/:id`.
- Read the actual error from the React error boundary via console.

## Step 2 — Code fixes

### `src/lib/api/posts.ts`
Add a tolerant normalizer that accepts both shapes and maps snake_case → camelCase:

```ts
function normalizePost(raw: any): AdminPost {
  const p = raw?.post ?? raw;  // unwrap { post: {...} }
  return {
    id: String(p.id),
    title: p.title ?? "",
    slug: p.slug ?? "",
    author: p.author ?? AUTHORS[0],
    category: p.category ?? CATEGORIES[0],
    status: p.status ?? "draft",
    views: p.views ?? 0,
    date: p.date ?? p.published_at ?? p.created_at?.slice(0,10) ?? "",
    thumbnail: p.thumbnail ?? p.featured_image ?? "",
    excerpt: p.excerpt ?? "",
    content: p.content ?? "",
    tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === "string" ? JSON.parse(p.tags || "[]") : []),
    featuredImage: p.featuredImage ?? p.featured_image ?? "",
    seoTitle: p.seoTitle ?? p.seo_title ?? "",
    seoDescription: p.seoDescription ?? p.seo_description ?? "",
    readingTime: p.readingTime ?? p.reading_time ?? 3,
  };
}
```

Apply `normalizePost` to `get`, `getBySlug`, `create`, `update`, `setStatus` return values. Add inverse mapper for outbound payload (camelCase → snake_case) if backend requires snake_case on write.

### `src/components/admin/PostEditor.tsx`
- After `createMut.mutateAsync`, guard: `if (!created?.id) { toast.error("Server didn't return an id"); return; }`.
- Replace bare `post.tags.map` / `post.title.trim()` with `?? ""` / `?? []` fallbacks so a partially-loaded post doesn't throw.

### `src/routes/admin._authenticated.posts.$id.edit.tsx`
- Already has an error path; widen to show `error.message` from `ApiError` and log the raw response in dev so future shape drift is obvious.

## Step 3 — CORS verification

From the browser, confirm response to `OPTIONS https://thriftbeam.com/api/posts/1` includes:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept
```

If `Authorization` is missing from `Allow-Headers`, frontend can't fix it — flag back to backend owner. Frontend already sends the correct headers.

## Step 4 — Verify

1. Create new post → redirected to `/admin/posts/<real-id>/edit`, editor populated, no console errors.
2. Edit existing post → save → list reflects changes, query cache updated.
3. Network tab: `OPTIONS` returns 204 with CORS headers; `POST/GET/PUT` return `{ ok: true, data }`.

## Out of scope
Backend changes (PHP). If the response truly returns `{ post: {...} }` and the team prefers fixing it server-side, the normalizer above remains a useful defensive layer.

## What I need from you
Either (a) test admin email + password, or (b) log in once in the preview and ping me — then I'll run the live diagnosis before applying fixes.
