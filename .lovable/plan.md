# Light-Only Theme Conversion

Strip dark mode entirely and apply the new premium blue palette across the whole site. Layouts and content stay the same — only colors and a few section backgrounds change.

## 1. Kill dark mode

- `src/styles.css`: remove the `.dark { ... }` token block and any `dark:` variants. Keep only the `:root` token set.
- `src/routes/__root.tsx`: remove the inline `themeScript` that reads `tb_theme` and toggles `.dark` on `<html>`.
- `src/components/Navbar.tsx`: remove the theme toggle button (Sun/Moon icon) and any `tb_theme` localStorage read/write. Drop related state and imports.
- Global search-and-remove of any remaining `dark:` Tailwind variants and `localStorage.*tb_theme` references across `src/`.

## 2. New design tokens (`src/styles.css`, `:root` only)

Replace existing color tokens with oklch equivalents of:

- `--background` #FFFFFF
- `--foreground` #0F172A
- `--muted-foreground` #64748B
- `--primary` #2563EB / `--primary-foreground` #FFFFFF
- `--accent` (coral) #FB7185 / `--accent-foreground` #FFFFFF
- `--surface` #F8FAFC, `--surface-2` #F1F5F9 (new tokens)
- `--card` #FFFFFF, `--card-foreground` #0F172A
- `--border` #E2E8F0, `--input` #E2E8F0, `--ring` #2563EB
- `--success` #10B981, `--warning` #F59E0B, `--destructive` #EF4444
- Shadows: `--shadow-card` `0 1px 3px rgba(0,0,0,0.05)`, `--shadow-card-hover` `0 8px 24px rgba(37,99,235,0.08)`
- Hero mesh utility (`hero-mesh`) rewritten to a soft white → light-blue → very-light-coral radial gradient on white.

## 3. Component recolor (no layout changes)

- **Hero (`src/routes/index.tsx`)**: white background + new soft mesh; headline `#0F172A`; subtext + trust badges `#64748B`; primary CTA blue, secondary CTA white/blue-outline.
- **Tools teaser band**: switch from dark navy to `--surface` (#F8FAFC); card gets `border-l-4 border-primary`, dark text, blue button.
- **Footer (`src/components/Footer.tsx`)**: background `--surface-2` (#F1F5F9), text `#0F172A`, muted links `#64748B`, social icons in blue, top border `#E2E8F0`.
- **Newsletter band**: pale coral `#FFE4E6` background, dark text, solid coral button.
- **CookieConsent**: white card, dark text, primary blue button + white/blue-outline secondary.
- **AnnouncementBar**: keep slim; recolor to blue background with white text (or surface-2 with blue text — pick the one that reads cleaner against the new white nav).
- **Cards (PostCard, CategoryCard, calculator cards, etc.)**: white bg, `1px solid var(--border)`, `--shadow-card`; hover swaps to `--shadow-card-hover` and `border-color: var(--primary)`.
- **Buttons (shadcn `button.tsx` variants)**:
  - `default` → blue solid, white text
  - `outline` → white bg, blue border, blue text
  - add/repurpose an `accent` variant → coral solid, white text (used sparingly on CTAs)
- **Blog detail, About, Contact, Legal, Tools, 404**: recolor any remaining dark surfaces or `bg-slate-900`-style classes to `--surface` / white. No structural edits.

## 4. Section rhythm

Across homepage, blog index, tools index, and about: alternate section backgrounds white → `--surface` → white → `--surface` so separation comes from tone, not dark blocks. Implement by setting `bg-background` / `bg-[hsl(var(--surface))]` (or a `bg-surface` utility) on existing section wrappers — no markup restructuring.

## 5. QA pass

- Grep for `dark:`, `tb_theme`, `bg-slate-900`, `bg-[#0F172A]`, `text-white` on non-CTA elements, and the `Moon`/`Sun` lucide imports — fix any stragglers.
- Walk each route at 390px and desktop to confirm contrast, hover states, and that no section is still dark.
- Confirm build passes and preview renders without the prior SSR error (the `themeScript` removal also eliminates a hydration mismatch risk).

## Out of scope

- No content, copy, route, or component-structure changes.
- No backend or data changes.
- Logo wordmark stays "Thrift" dark + "Beam" in the new primary blue (was indigo).
