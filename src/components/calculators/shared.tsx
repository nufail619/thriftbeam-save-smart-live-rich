import { useEffect, useState, type ReactNode } from "react";

export function Field({
  label, value, onChange, prefix, suffix, min = 0, step = 1,
}: { label: string; value: number; onChange: (n: number) => void; prefix?: string; suffix?: string; min?: number; step?: number }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="mt-1.5 relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          step={step}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            onChange(Number.isFinite(n) ? n : 0);
          }}
          className={`w-full h-12 ${prefix ? "pl-7" : "pl-4"} ${suffix ? "pr-10" : "pr-4"} rounded-xl border border-border bg-background outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-base transition-shadow`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{suffix}</span>}
      </div>
    </label>
  );
}

export function ResultRow({ label, value, highlight, small = false }: { label: string; value: string; highlight?: "good" | "bad"; small?: boolean }) {
  const color =
    highlight === "good" ? "text-emerald-600" :
    highlight === "bad" ? "text-rose-600" :
    "text-foreground";
  return (
    <div className={`flex items-baseline justify-between ${small ? "text-sm" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${color} ${small ? "" : "text-lg"}`}>{value}</span>
    </div>
  );
}

export function ResultPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-card space-y-4 flex flex-col">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
        <h2 className="text-xl font-bold text-primary">{title}</h2>
      </div>
      <div className="space-y-3 flex-1">{children}</div>
    </div>
  );
}

/** Client-only wrapper for recharts (avoids SSR hydration mismatch). */
export function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}

export const CHART_TOOLTIP_STYLE = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  color: "#0F172A",
  boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
  fontSize: 13,
} as const;

export const CHART_GRID_STROKE = "#E2E8F0";
export const CHART_AXIS_STROKE = "#64748B";
