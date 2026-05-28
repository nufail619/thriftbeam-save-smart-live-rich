import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useSettingsForm } from "@/hooks/useSettingsForm";

export const Route = createFileRoute("/admin/_authenticated/theme")({
  component: ThemePage,
});

const FONTS = ["Inter", "Manrope", "Plus Jakarta Sans", "DM Sans"];

type ThemeDraft = {
  primary_color: string;
  accent_color: string;
  font_family: string;
  radius: number;
  mode: "light" | "dark";
};

function ThemePage() {
  const { draft, set, save, saving, isLoading } = useSettingsForm<ThemeDraft>("theme", {
    primary_color: "#2563EB",
    accent_color: "#10B981",
    font_family: "Inter",
    radius: 12,
    mode: "light",
  });

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading theme…</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-base font-semibold">Live preview</h2>
        <div className="overflow-hidden rounded-xl border border-border" style={{ background: draft.mode === "dark" ? "#0f172a" : "#ffffff" }}>
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: draft.mode === "dark" ? "rgba(255,255,255,0.1)" : "var(--color-border)" }}>
            <div className="flex items-center gap-2">
              <span className="inline-block h-7 w-7 rounded-lg" style={{ background: draft.primary_color, borderRadius: draft.radius }} />
              <span className="font-bold" style={{ color: draft.mode === "dark" ? "#fff" : "#111", fontFamily: draft.font_family }}>ThriftBeam</span>
            </div>
            <button className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: draft.primary_color, borderRadius: draft.radius }}>Subscribe</button>
          </div>
          <div className="p-6" style={{ color: draft.mode === "dark" ? "#e5e7eb" : "#111", fontFamily: draft.font_family }}>
            <h1 className="text-3xl font-bold tracking-tight">Smarter money, every week.</h1>
            <p className="mt-2 text-sm opacity-80">Practical guides, calculators, and weekly newsletters.</p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: draft.primary_color, borderRadius: draft.radius }}>Get started</button>
              <button className="rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: draft.accent_color, borderRadius: draft.radius }}>Learn more</button>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Preview updates instantly. Click Save to push live.</p>
      </div>

      <div className="lg:col-span-2 space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold">Controls</h2>
        <Field label="Primary color">
          <div className="flex gap-2">
            <input type="color" value={draft.primary_color} onChange={(e) => set("primary_color", e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-border" />
            <input value={draft.primary_color} onChange={(e) => set("primary_color", e.target.value)} className="input flex-1 font-mono" />
          </div>
        </Field>
        <Field label="Accent color">
          <div className="flex gap-2">
            <input type="color" value={draft.accent_color} onChange={(e) => set("accent_color", e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-border" />
            <input value={draft.accent_color} onChange={(e) => set("accent_color", e.target.value)} className="input flex-1 font-mono" />
          </div>
        </Field>
        <Field label="Font family">
          <select value={draft.font_family} onChange={(e) => set("font_family", e.target.value)} className="input">
            {FONTS.map((f) => <option key={f}>{f}</option>)}
          </select>
        </Field>
        <Field label={`Border radius — ${draft.radius}px`}>
          <input type="range" min={0} max={24} value={draft.radius} onChange={(e) => set("radius", Number(e.target.value))} className="w-full" />
        </Field>
        <Field label="Mode">
          <div className="flex gap-2">
            {(["light", "dark"] as const).map((m) => (
              <button key={m} onClick={() => set("mode", m)} className={`h-9 flex-1 rounded-lg text-sm font-semibold capitalize ${draft.mode === m ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}>{m}</button>
            ))}
          </div>
        </Field>
        <div className="flex justify-end pt-2">
          <button disabled={saving} onClick={save} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
          </button>
        </div>
        <style>{`.input{display:block;width:100%;height:40px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);padding:0 12px;font-size:14px}`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
