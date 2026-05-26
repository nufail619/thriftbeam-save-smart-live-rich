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
          className={`w-full h-12 ${prefix ? "pl-7" : "pl-4"} ${suffix ? "pr-10" : "pr-4"} rounded-xl border border-border bg-background outline-none focus:border-primary text-base`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{suffix}</span>}
      </div>
    </label>
  );
}

export function ResultRow({ label, value, highlight, small = false }: { label: string; value: string; highlight?: "good" | "bad"; small?: boolean }) {
  const color = highlight === "good" ? "text-emerald-300" : highlight === "bad" ? "text-rose-300" : "text-white";
  return (
    <div className={`flex items-baseline justify-between ${small ? "text-sm" : ""}`}>
      <span className="text-white/70">{label}</span>
      <span className={`font-semibold ${color} ${small ? "" : "text-lg"}`}>{value}</span>
    </div>
  );
}

export function ResultPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6 text-white shadow-xl space-y-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #4F46E5 100%)" }}>
      <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <h2 className="text-xl font-bold relative">{title}</h2>
      <div className="relative space-y-3">{children}</div>
    </div>
  );
}
