# Phase B — Content Management

Build out Posts CRUD, Pages, Comments moderation, and Media library. All mock-data driven, all using existing admin primitives (`DataTable`, `Modal`, `ConfirmDialog`, `Badge`, `EmptyState`, `StatCard`). Public site untouched.

## 1. Mock data layer

Extend `src/lib/mockAdminData.ts` and add a new `src/lib/adminStore.ts`:

- Generate 47 full posts (expand `mockRecentPosts` to full set with `excerpt`, `content` HTML, `tags`, `featuredImage`, `seoTitle`, `seoDescription`, `readingTime`).
- Add `AdminPage` type (id, title, slug, status, lastEdited, template) with ~8 mock pages (About, Contact, Privacy, Disclaimer, Terms, etc.).
- Add `AdminComment` extending `PendingComment` with `status: pending|approved|spam|trash`, `postSlug`, `gravatar`. Seed ~25 comments across statuses.
- Add `MediaItem` (id, url, filename, type, size, dimensions, uploadedAt, alt). Seed ~30 Unsplash items across image/document mocks.
- `adminStore.ts`: in-memory store (module singleton) with subscribe-style hook `useAdminStore<T>()` for posts/pages/comments/media. All CRUD operations mutate the in-memory arrays and notify subscribers. Persists nothing — resets on reload, which matches "mock only".

## 2. Posts module

### `/admin/posts` (rewrite stub)
- Header: "Posts" + "New Post" button → `/admin/posts/new`.
- `StatCard` row: Total, Published, Drafts, Scheduled.
- Filter bar: search input, status tabs (All / Published / Draft / Scheduled / Trash), category select, author select.
- `DataTable` columns: checkbox, Thumbnail, Title (+ slug subtext), Author, Category, Status (`Badge`), Views, Date, Actions (Edit / View / Duplicate / Trash via dropdown).
- Bulk actions bar appears when rows selected: Publish, Draft, Trash, Delete.
- Empty state when filtered to zero.

### `/admin/posts/new` and `/admin/posts/$id/edit` (new route file)
Shared `PostEditor` component:
- Two-column layout: main editor (title input, slug auto-generated + editable, rich editor, excerpt textarea) + sidebar (Publish box with status/visibility/date, Category select, Tags multi-input, Featured Image picker → opens Media modal, SEO panel with title/description/preview).
- Rich editor: use **Tiptap** (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-placeholder`). Toolbar: H2/H3, bold, italic, link, bullet/ordered list, blockquote, code, image (opens Media picker), undo/redo. Output HTML stored on the post.
- Sticky action bar: Save Draft, Preview (no-op toast), Publish. Confirms via toast.
- Autosave indicator (debounced 2s, mock).

### `/admin/posts/$id/edit`
New file `admin._authenticated.posts.$id.edit.tsx` reuses `PostEditor` with loaded post.

## 3. Pages module — `/admin/pages`

- `DataTable` of pages: Title, Slug, Template, Status, Last Edited, Actions.
- "New Page" button → modal with title/slug/template select; create stores entry.
- Edit opens a simpler editor (title, slug, template select, Tiptap body, SEO panel) at `/admin/pages/$id/edit` (new file). Same Tiptap as posts.
- Delete via `ConfirmDialog`.

## 4. Comments module — `/admin/comments`

- Stat row: Pending, Approved, Spam, Trash counts.
- Status tabs filter the list.
- List view (not table) — comment card showing avatar, author + email, post title (linked), date, full body, action row: Approve / Unapprove / Reply / Spam / Trash / Delete.
- Reply opens inline textarea; submit shows toast (mock).
- Bulk select with bulk actions bar.

## 5. Media library — `/admin/media`

- Header: "Media" + "Upload" button (opens dropzone modal, mock-creates entries from a small built-in URL list, generates fake size/dimensions).
- View toggle: Grid / List.
- Filter: type (image/document/all), search by filename.
- Grid: square thumbnails with hover overlay (filename, dimensions, copy URL, delete).
- Click item → details drawer/modal: large preview, metadata, alt-text editor, copy URL, delete (`ConfirmDialog`).
- Reusable `<MediaPickerModal>` exported for use by Posts/Pages featured-image and rich-editor image insert.

## 6. Shared admin components to add

- `src/components/admin/PostEditor.tsx`
- `src/components/admin/RichEditor.tsx` (Tiptap wrapper)
- `src/components/admin/MediaPickerModal.tsx`
- `src/components/admin/MediaGrid.tsx`
- `src/components/admin/SeoPanel.tsx`
- `src/components/admin/TagInput.tsx`
- `src/components/admin/FilterBar.tsx`

## 7. Dependencies

Install via bun:
- `@tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-placeholder`

## 8. Routing

New route files:
- `admin._authenticated.posts.$id.edit.tsx`
- `admin._authenticated.pages.$id.edit.tsx`

Rewrite existing stubs:
- `admin._authenticated.posts.tsx`
- `admin._authenticated.posts.new.tsx`
- `admin._authenticated.pages.tsx`
- `admin._authenticated.comments.tsx`
- `admin._authenticated.media.tsx`

## 9. Out of scope (deferred to Phase C)

Users, Newsletter, SEO global, Analytics, Integrations, Cookies, Cache, Theme, Backup, Maintenance, PWA, Tools, Settings, Notifications — all remain "Coming Soon" stubs.

## 10. Constraints

- Public site routes/components: zero changes.
- Design tokens only — reuse admin tokens already in `src/styles.css`.
- No real network calls; all mutations through `adminStore`.
- Every destructive action goes through `ConfirmDialog`.
- Every successful mutation fires a toast via existing `sonner`.

## Verification

After build:
1. Create a new post via editor → appears at top of `/admin/posts`.
2. Edit existing post inline → changes persist in-session.
3. Trash → confirm → row removed from default view, visible under Trash tab.
4. Bulk publish 3 drafts → all flip to Published.
5. Pages: create + edit + delete work.
6. Comments: approve / spam / trash transitions update counts in stat row.
7. Media: upload mock, pick from MediaPicker inside post editor, set as featured image, insert into Tiptap body.
8. Public routes `/`, `/blog`, `/tools/$slug` render unchanged.
