# Root Cause

`src/routes/admin._authenticated.posts.tsx` declares the path `/admin/_authenticated/posts` AND has child routes (`posts.new.tsx`, `posts.$id.edit.tsx`). In TanStack file-based routing, when a parent route has children, the parent component becomes a layout and **must render `<Outlet />`** for children to display.

`PostsPage` does not render `<Outlet />` — it renders the full list UI directly. Result: navigating to `/admin/posts/new` or `/admin/posts/$id/edit` matches the child route, but the parent layout has no slot to render it, so the page stays on the Posts list (or appears "broken/doesn't open").

Same bug exists for `admin._authenticated.pages.tsx` (parent of `pages.$id.edit.tsx`).

# Fix

Rename the two parent route files so they become pure leaf index routes, making the existing child files siblings under `_authenticated` rather than nested children:

1. `src/routes/admin._authenticated.posts.tsx` → `src/routes/admin._authenticated.posts.index.tsx`
   - Change `createFileRoute("/admin/_authenticated/posts")` → `createFileRoute("/admin/_authenticated/posts/")`
2. `src/routes/admin._authenticated.pages.tsx` → `src/routes/admin._authenticated.pages.index.tsx`
   - Change `createFileRoute("/admin/_authenticated/pages")` → `createFileRoute("/admin/_authenticated/pages/")`

The TanStack Router Vite plugin will regenerate `routeTree.gen.ts` so `/admin/posts/new`, `/admin/posts/$id/edit`, and `/admin/pages/$id/edit` route directly under `_authenticated` with no missing-Outlet layout in between.

No component code changes needed — `PostEditor`, `RichEditor`, `MediaPickerModal`, `SeoPanel`, and `adminStore` are all wired correctly; they just never got mounted.

# Verification

After the rename + restart:
1. `/admin/posts` still renders the list (now from the `.index` file).
2. Click "New post" → `/admin/posts/new` opens `PostEditor` (mode=new).
3. Click row title or Edit → `/admin/posts/$id/edit` opens `PostEditor` (mode=edit, prefilled).
4. Tiptap toolbar (bold, H2, link, image, list, quote, code, undo/redo) all work.
5. Image button opens `MediaPickerModal`; selecting inserts `<img>`.
6. SEO panel updates title/description with live counters and preview.
7. Save Draft / Publish fire `sonner` toast and update the list via `postsApi`.
8. Same check for `/admin/pages/$id/edit`.
9. Console clean — no React/Tiptap/hydration errors.
