# Phase 2 QA — Findings & Fixes

I audited `/tools` and each calculator route. The pages, routing, SEO heads, breadcrumbs, related-tools section, ad slots, and form inputs all work correctly. Two real issues found, both centered on the result panel.

## Findings

1. **Theme violation — dark indigo `ResultPanel`**
   `src/components/calculators/shared.tsx` renders the result column as a deep indigo gradient (`linear-gradient(135deg, #4F46E5 → #6366F1)`) with white text. This directly contradicts the "light theme only, remove all dark sections" rule applied in the previous turn. Every calculator inherits it.

2. **Charts are not rendering**
   Confirmed visually on `/tools/budget-calculator` (pie chart area is blank inside the indigo panel) and `/tools/debt-payoff` (line chart area is blank). No console errors. Recharts is installed (`^2.15.4`). Likely cause: `ResponsiveContainer` inside the panel's stacked `space-y-3` flow doesn't get a measurable height in some SSR/hydration ordering, OR the chart strokes (`rgba(255,255,255,0.15)` grid, white axis text) hide against the indigo bg when the chart does paint. Either way the chart slot reads as broken.

3. **Hard-coded dark styling baked into chart configs**
   - Tooltip `contentStyle={{ background: "#0F172A", ... }}` in Budget, Savings, Debt.
   - Axis/grid stroke `rgba(255,255,255,…)` in Debt, Savings.
   - `EmergencyFundCalculator` progress bar track uses `bg-white/15`.
   - `CreditCardInterestCalculator` "scenario" cards use `bg-white/10`.
   All of these only read correctly on a dark surface.

4. **`ResultRow` text colors hard-coded**
   Uses `text-white`, `text-white/70`, `text-emerald-300`, `text-rose-300`. Needs to be theme-aware.

5. **Minor — `Field` numeric input**
   On iOS, leading `$`/`%` prefix overlaps with the spinner. Not blocking, but worth a small fix when we're already in the file.

Everything else (tools index grid, breadcrumbs, related-tools cards, ad slots, head metadata, 404 + error boundaries) checks out at 1440 desktop.

## Fix plan

### 1. Rebuild `ResultPanel` as light-theme card
`src/components/calculators/shared.tsx`:

- Replace the indigo gradient with the same light card treatment used elsewhere: `bg-card border border-border rounded-2xl p-6 shadow-card`.
- Add a soft brand accent: small `bg-primary/5` top band or a `text-primary` title color so the result side still feels like the "answer" zone. Keep title bold, body using `text-foreground` / `text-muted-foreground`.
- Remove the `absolute -top-20 -right-20 ... bg-white/10 blur-3xl` decoration.

### 2. Theme-correct `ResultRow`
- Label: `text-muted-foreground`.
- Value: `text-foreground`.
- Highlights: `good` → `text-emerald-600`, `bad` → `text-rose-600` (keeps semantic meaning, readable on white).

### 3. Recolor every chart for light bg
For each chart inside the calculators:

- `CartesianGrid` stroke → `hsl(var(--border))` (or `#E2E8F0`).
- `XAxis` / `YAxis` stroke + tick → `#64748B` (muted-foreground).
- `Tooltip contentStyle` → `{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, color: "#0F172A", boxShadow: "0 8px 24px rgba(15,23,42,0.08)" }`.
- Pie/Line strokes: keep brand colors but make sure the donut slices use `#2563EB` (primary), `#FB7185` (accent), `#10B981` (success-green) — already accent + green, just swap indigo for primary blue.
- BudgetCalculator `Legend` wrapperStyle → `{ color: "#0F172A" }`.

### 4. Fix the not-rendering chart
- Wrap each chart container in an explicit min-height so `ResponsiveContainer` always has space pre-hydration:
  `<div className="mt-4 h-56 w-full min-h-[224px]">`.
- Ensure the parent panel uses `flex flex-col` so the chart row doesn't get collapsed by `space-y-*` interactions on first paint.
- If after that a chart still doesn't render, gate it behind a small `useIsClient` mount guard inside the calculator file (recharts + SSR is a known footgun).

### 5. Light-bg fixes in individual calculators
- `EmergencyFundCalculator`: progress track `bg-surface-2` (or `bg-muted`), fill `bg-primary`. Replace the `border-white/10` divider with `border-border`.
- `CreditCardInterestCalculator`: scenario sub-cards → `bg-surface border border-border rounded-xl p-4`; the small uppercase eyebrow → `text-muted-foreground`; error messages → `text-rose-600`.
- `SavingsGoalCalculator` "not possible" message → `text-rose-600`.

### 6. `shared.tsx` `Field` polish
- Bump input height consistency (`h-12` already), keep prefix/suffix.
- Add `pr-3` when no suffix to give the native spinner room on Safari (small, optional).

### 7. Re-QA after fixes
Walk all five tool routes at 1440 desktop and 390 mobile:
- `/tools/budget-calculator` — pie chart visible, legend readable, totals correct.
- `/tools/debt-payoff` — line chart visible on white, balance trends down.
- `/tools/savings-goal` — line chart visible, "years to goal" shows.
- `/tools/emergency-fund` — progress bar fills smoothly, target updates with months toggle.
- `/tools/credit-card-interest` — both scenario cards readable, "you save" highlight green.
Also confirm `/tools` index card hover still lifts and related-tools grid stays 4-up at `lg`.

## Out of scope
- No copy changes to "How this works" / tips.
- No new calculators.
- No new routes, SEO, or backend.
- Homepage / blog / legal pages untouched.
