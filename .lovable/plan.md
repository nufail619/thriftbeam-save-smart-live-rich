# Phase 2 — Connect remaining admin + all public site to backend

Same pattern as Phase 1: per-resource client in `src/lib/api/*.ts` with a defensive `normalize*()` (snake→camel, tolerant of wrappers), TanStack Query in route components, skeleton loaders, toast errors, optimistic invalidation. No UI/layout/styling changes.

## 0. Login page cleanup
- `src/routes/admin.login.tsx`: remove the "Demo credentials" `<p>` block (lines 191–194) and the `placeholder="admin@thriftbeam.com"` (use generic `"you@example.com"`).

## 1. New API clients (`src/lib/api/`)
Create one file per resource, each exporting a typed client + normalizer:

- `categories.ts` — list/create/update/remove → `/categories`
- `users.ts` — list/create/update/remove → `/users` (no password echo)
- `media.ts` — list/update/remove → `/media`; `upload(file, onProgress)` uses existing `api.upload` (XHR with progress events already wired in `src/lib/api.ts`)
- `comments.ts` — list/setStatus/remove → `/comments`
- `newsletter.ts` — admin list/update/remove + public `subscribe(email)` → `/newsletter`
- `pages.ts` — list/get/create/update/remove → `/pages`
- `settings.ts` — `getAll()` → `/settings`; `update(key, value)` → `PUT /settings/:key`
- `contact.ts` — public `send({name,email,message})` → `POST /contact`
- `public.ts` — `latestPosts({per_page})`, `listPosts({category,tag,q,page})`, `getPostBySlug(slug)` reusing `postsApi.getBySlug` and a new lightweight `listPublic()` against `GET /posts`

All normalizers tolerate `{items|data|<resource>:[…]}` shapes and map snake_case → camelCase for known fields.

## 2. Admin routes — swap mock store → Query/Mutation
For each route below: replace `adminStore` reads with `useQuery`, replace writes with `useMutation` + `qc.invalidateQueries`, keep all JSX/markup/animations intact, add a `Loader2`/skeleton state and `toast.error(err.message)` for failures.

- `admin._authenticated.users.tsx` → `usersApi`
- `admin._authenticated.media.tsx` → `mediaApi`; upload UI calls `mediaApi.upload(file, onProgress)`, drive existing progress bar from XHR pct
- `admin._authenticated.comments.tsx` → `commentsApi`
- `admin._authenticated.newsletter.tsx` → `newsletterApi`
- `admin._authenticated.pages.index.tsx` + `admin._authenticated.pages.$id.edit.tsx` → `pagesApi` (mirror Posts pattern; new-page flow saves then `navigate` to edit)
- `admin._authenticated.settings.tsx` → `settingsApi.getAll()` for hydration, `settingsApi.update(key,val)` on save
- Categories: surfaced in the Post editor's category select + `admin._authenticated.posts.index.tsx` filter — switch both to `useQuery(["categories"], categoriesApi.list)` with the existing `CATEGORIES` mock as fallback only while loading

## 3. Public site
- `routes/index.tsx` — hero/latest posts grid: `useQuery(["public","latest"], () => publicApi.latestPosts({per_page:6}))`. Keep skeleton placeholders already present.
- `routes/blog.index.tsx` — `useQuery(["public","posts",filters], …)` driven by URL search params (category/tag/q/page) via existing controls.
- `routes/blog.$slug.tsx` — `useQuery(["public","post",slug], () => publicApi.getPostBySlug(slug))` for body; `useQuery(["public","comments",slug])` for approved comments list under the post; comment form posts to `commentsApi.submitPublic({postId,name,email,body})` → `POST /comments`, then invalidate.
- `components/NewsletterSignup.tsx` — submit via `newsletterApi.subscribe(email)`, success/error toasts, disable button while pending.
- `routes/contact.tsx` — submit via `contactApi.send(values)`, success state + toast.

## 4. Defensive behavior
- All clients re-use the shared `api` helper (Bearer header, 401 → redirect, envelope unwrap) — no direct `fetch` anywhere.
- Normalizers return safe defaults so missing optional fields never crash the UI (`tags: []`, `views: 0`, etc.).
- Public endpoints don't send Authorization — `api.ts` already skips the header when no token is present, so no change needed.

## 5. QA pass (after build)
Open published preview and verify in order:
1. `/admin/login` — no demo credential hint visible; sign in works.
2. Categories CRUD via Post editor and Posts filter.
3. Users page lists + create/edit/delete.
4. Media: upload an image, progress bar advances, item appears in grid; delete works.
5. Comments: list loads, approve/spam/trash mutate, counts update.
6. Newsletter admin: list loads, delete works.
7. Pages: list, create, edit, save, delete.
8. Settings: load values, change one, save, refresh persists.
9. `/` shows real latest posts (6).
10. `/blog` filters update results; pagination works.
11. `/blog/:slug` renders real post; comment submit returns success and shows pending message.
12. Newsletter signup on home/footer succeeds.
13. `/contact` submit succeeds.

Report each ✓ / ✗ with the failing toast message if any.

## Technical notes
- All new files are pure client modules; no server functions, no Cloud usage (the backend is external PHP).
- Keeps `mockAdminData.ts` types as the canonical TS shapes — clients return those types after normalization, so route components don't need refactoring beyond swapping the data source.
- Estimated edits: ~9 new `src/lib/api/*.ts` files, ~10 route file modifications, 2 component modifications, 1 login cleanup.
