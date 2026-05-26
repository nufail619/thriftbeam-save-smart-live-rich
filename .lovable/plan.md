# Fix: Posts list shows empty despite backend having posts

## Root cause

The PHP backend returns the list under `data.items` (with `total, page, per_page, pages` siblings), but `src/lib/api/posts.ts` only looks for `data.posts`. So `normalizePosts()` returns `[]` and the table renders empty — even though the request, auth header, and 200 response are all fine.

Verified in code:
- `src/lib/api.ts` already attaches `Authorization: Bearer <tb_token>` and unwraps `body.data`. ✅
- `src/routes/admin._authenticated.posts.index.tsx` calls `postsApi.listAdmin()` which hits `/posts/admin`. ✅
- `postsApi.listAdmin` then does `Array.isArray(res?.posts) ? res.posts : []` — **misses `res.items`**. ❌

## Changes

### `src/lib/api/posts.ts`
1. Update `PostsListResponse` type to include `items?: AdminPost[]` and `pages?: number`.
2. In `listAdmin`, accept either shape:
   - If response is an array → use it.
   - Else read `res.items ?? res.posts ?? []` and normalize each entry.
3. Update `normalizePosts` helper to also fall back to `res.items` so any other caller stays correct.

That's it — one file, two small edits. No UI changes, no auth changes.

## Verification

After the fix, on `/admin/posts`:
- Network: `GET https://thriftbeam.com/api/posts/admin` returns 200 with `Authorization: Bearer …` attached.
- Table renders the 3 existing posts; StatCards reflect their statuses.
- Console clean.

If the request still 401s, the token in `localStorage.tb_token` is the problem (re-login) — not in scope for this fix.
