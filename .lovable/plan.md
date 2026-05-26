# Connect Frontend to Production PHP Backend

API base: `https://thriftbeam.com/api`. Response envelope: `{ ok: true, data }` or `{ error }`. Token in `localStorage.tb_token`.

## Phase 1 — Foundation + Auth + Posts

### 1. `src/lib/api.ts` (new) — typed fetch client

- `API_BASE = "https://thriftbeam.com/api"`
- `apiFetch<T>(path, { method, body, headers, formData })`:
  - Prepends base URL
  - Reads `tb_token` from localStorage; attaches `Authorization: Bearer <token>` only when token is a non-empty string of length > 10 and not the literal `"undefined"`
  - JSON-encodes object bodies and sets `Content-Type: application/json`; if `formData` passed, sends as-is with no content-type header (browser sets boundary)
  - Parses JSON response; if `res.status === 401`: clear `tb_token` + `tb_user`, `window.location.assign("/admin/login")`, throw `ApiError`
  - If `!res.ok` or `body.ok === false` / `body.error`: throw `ApiError(body.error || res.statusText, res.status)`
  - Returns `body.data as T` (auto-unwrap)
- Helpers: `api.get`, `api.post`, `api.put`, `api.delete`, `api.upload(path, file, extraFields?)`
- `saveAuth(token, user)`: validates `typeof token === "string" && token.length > 10` before writing; throws otherwise

### 2. Admin login (`src/routes/admin.login.tsx` + `src/lib/adminAuth.ts`)

- Replace mock `login()` body with `await api.post("/auth/login", { email, password })` → expect `{ token, user }`
- On success: `saveAuth(token, user)`, toast, navigate to `search.redirect ?? "/admin"`
- On failure: preserve existing lockout / attempt-counting UX (lockout stays client-side; it's UX-only)
- Keep `getToken`, `getUser`, `logout`, `isAuthenticated` working against localStorage

### 3. TanStack Query wiring

- Confirm `QueryClient` is provided in `__root.tsx` (already in template per integration card). If missing, add `<QueryClientProvider>` wrap in root component only.
- No router-context changes needed; admin pages use `useQuery`/`useMutation` directly.

### 4. Admin dashboard (`admin._authenticated.index.tsx`)

- `useQuery({ queryKey: ["admin","dashboard"], queryFn: () => api.get("/dashboard") })`
- Render skeletons (reuse existing StatCard layout with shimmer) while `isLoading`
- On error: toast + inline error state; keep layout intact

### 5. Posts CRUD

- `src/lib/api/posts.ts`:
  - `listAdminPosts(params)` → `GET /posts/admin`
  - `getPost(id)` → `GET /posts/:id` (or use existing edit endpoint backend exposes)
  - `createPost(payload)` → `POST /posts`
  - `updatePost(id, payload)` → `PUT /posts/:id`
  - `deletePost(id)` → `DELETE /posts/:id`
- `admin._authenticated.posts.index.tsx`: `useQuery(["posts","admin", filters])`; skeleton rows; delete via `useMutation` + `invalidateQueries`
- `admin._authenticated.posts.new.tsx`: `useMutation(createPost)` → on success navigate to edit page + toast
- `admin._authenticated.posts.$id.edit.tsx`: `useQuery(["posts", id])` for initial data; `useMutation(updatePost)` for Save Draft / Publish; invalidate list on success
- Remove `postsApi` direct calls from these three routes; keep `adminStore` file alive only for screens not yet migrated in Phase 1

### 6. Verification gate (stop before Phase 2)

- Login with real creds → dashboard loads real numbers
- Posts list renders from API; create + edit + delete round-trip works
- 401 from any call redirects to `/admin/login` and clears storage
- No console errors

---

## Phase 2 — Remaining admin + public

Same pattern (`src/lib/api/<resource>.ts` + `useQuery`/`useMutation` in route file). Skeletons for loading, toasts for errors, `invalidateQueries` on mutations.

| Area | Endpoints |
|---|---|
| Categories | `GET/POST /categories`, `PUT/DELETE /categories/:id` |
| Users | `GET/POST /users`, `PUT/DELETE /users/:id` |
| Media | `GET /media`, `POST /media` (FormData, `file` field, real progress via `XMLHttpRequest` wrapper in `api.upload`), `PUT/DELETE /media/:id` |
| Comments | `GET /comments`, `PUT /comments/:id` (status), `DELETE /comments/:id` |
| Newsletter (admin) | `GET /newsletter`, `PUT/DELETE /newsletter/:id` |
| Pages | `GET/POST /pages`, `PUT/DELETE /pages/:id` |
| Settings | `GET /settings`, `PUT /settings/:key` |
| Public home (`index.tsx`) | `GET /posts?per_page=6` |
| Public blog list (`blog.index.tsx`) | `GET /posts` with category/tag/search/page filters via `loaderDeps` + Query |
| Public blog post (`blog.$slug.tsx`) | `GET /posts/slug/:slug` |
| Newsletter signup component | `POST /newsletter` |
| Contact form (`contact.tsx`) | `POST /contact` |
| Comment submit (on blog post) | `POST /comments` |

### Media upload specifics

- `api.upload(path, file, fields?)`: uses `XMLHttpRequest` so we can emit progress events; resolves with unwrapped `data` (filename + URL); rejects with `ApiError` on non-2xx or `{ok:false}`
- `MediaPickerModal` + media admin page show real progress bar; on success swap in returned URL

### Mock data fallback

- Keep `src/lib/mockData.ts` / `mockAdminData.ts` files; use them only for skeleton dimensions/placeholders during `isLoading`, never as random content
- Remove `adminStore`'s in-memory subscribe pattern once all consumers migrate; delete file at end of Phase 2

## Technical notes

- All API calls are client-side from components via TanStack Query — no server functions, no SSR fetches (admin is auth-gated; public pages can stay CSR for now to avoid CORS/SSR origin concerns until backend confirms CORS for the lovable.app preview origin)
- `ApiError extends Error { status: number }` so callers can branch on 401/403/422
- Token validation rule (`length > 10`, not `"undefined"`) enforced in both `saveAuth` and `apiFetch` read path
- No UI/layout/design changes — only swap data sources inside hooks/route loaders
- All toasts via existing `sonner` instance; all skeletons via existing admin skeleton components

## Out of scope

- CORS configuration on the PHP backend (assumed already permitting the preview + custom domain)
- Refresh-token flow (not specified; 401 = logout)
- Optimistic updates (can add later per screen)
