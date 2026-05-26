# Desktop Full-Width Layout

Make desktop (≥1024px) span edge-to-edge with comfortable padding. Mobile (<768px) and tablet (768–1023px) stay byte-identical.

## 1. Container utility (`src/styles.css`)

Update `.container-page` so the 1200px cap only applies below `lg`:

```css
@utility container-page {
  width: 100%;
  max-width: 1200px;          /* mobile + tablet keep current cap */
  margin-inline: auto;
  padding-inline: 1.25rem;    /* unchanged mobile */
}
@media (min-width: 768px) {   /* unchanged tablet */
  .container-page { padding-inline: 2rem; }
}
@media (min-width: 1024px) {  /* desktop: drop cap, widen padding */
  .container-page { max-width: none; padding-inline: 3rem; }
}
@media (min-width: 1280px) {
  .container-page { padding-inline: 4rem; }
}
@media (min-width: 1536px) {
  .container-page { padding-inline: 5rem; }
}
```

Add a sibling utility for reading-heavy bodies so prose still caps at ~768px:

```css
@utility prose-container {
  width: 100%;
  max-width: 768px;
  margin-inline: auto;
}
```

Because every section (navbar, hero, category grid, featured, latest, tools teaser, newsletter band, footer) already uses `container-page`, no per-section markup change is needed for them to go edge-to-edge on desktop.

## 2. Grid adjustments

Bump column counts at `2xl` (1536px+) only — `lg`/`xl` keep current 3-col layout, mobile/tablet untouched.

- Category grid (homepage + `/blog` sidebar if present): `md:grid-cols-2 lg:grid-cols-3` → add `2xl:grid-cols-4`.
- Latest articles grid: same change, `lg:grid-cols-3 2xl:grid-cols-4`.
- Featured posts: leave at 3 columns.
- Footer: leave at 4 columns (already `lg:grid-cols-4`).

Files to touch (grid classes only, no structural changes):
- `src/routes/index.tsx` — category grid + latest articles grid
- `src/routes/blog.index.tsx` — post grid (apply same `2xl:grid-cols-4` bump)
- `src/routes/tools.index.tsx` — only if it uses a 3-col grid; mirror the bump

## 3. Reading-heavy pages keep narrow prose

On these routes the outer section wrappers stay `container-page` (now full-width on desktop), but the prose body is wrapped in `prose-container` so line length stays comfortable:

- `src/routes/blog.$slug.tsx` — wrap the article body / TOC layout's text column with `prose-container` (sticky TOC stays in the side column of the full-width section).
- `src/routes/privacy.tsx`, `src/routes/disclaimer.tsx`, `src/routes/about.tsx` — wrap main prose block with `prose-container`. Hero/section bands above/below remain edge-to-edge.
- `LegalLayout.tsx` — apply `prose-container` to its content slot.

## 4. Navbar stretch

`src/components/Navbar.tsx` already uses `container-page` for the inner row, so it automatically becomes edge-to-edge on desktop. Adjust the inner flex so nav links sit centered while logo/icons hug the edges on `lg+`:

```tsx
<div className="container-page flex h-16 items-center gap-4">
  <Link …>Logo</Link>                                 {/* left */}
  <nav className="hidden md:flex items-center gap-1 lg:mx-auto">…</nav>  {/* centered on lg+ */}
  <div className="flex items-center gap-1 lg:ml-auto">…</div>             {/* right */}
</div>
```

On mobile/tablet the existing `justify-between` behavior is preserved by replacing it with `gap-4` + `ml-auto` on the icons cluster (icons stay right-aligned because nav is hidden below `md`, and on `md` `lg:mx-auto`/`lg:ml-auto` don't apply so layout is unchanged).

## 5. QA

- Visual check at 320, 414, 768 (must look identical to current).
- Visual check at 1024, 1440, 1920 (edge-to-edge with growing side padding; grids reflow at 1536).
- Walk `/`, `/blog`, `/blog/$slug`, `/tools`, `/about`, `/privacy`, `/disclaimer`, `/contact`.

## Out of scope

No color, copy, component, route, or backend changes.
