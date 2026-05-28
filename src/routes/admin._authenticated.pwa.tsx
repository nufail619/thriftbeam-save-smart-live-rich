import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useSettingsForm } from "@/hooks/useSettingsForm";

export const Route = createFileRoute("/admin/_authenticated/pwa")({
  component: PwaPage,
});

type PwaDraft = {
  service_worker: boolean;
  cache_strategy: "networkFirst" | "cacheFirst" | "staleWhileRevalidate";
  name: string;
  short_name: string;
  description: string;
  theme_color: string;
  background_color: string;
  display: "standalone" | "fullscreen" | "minimal-ui" | "browser";
};

function PwaPage() {
  const { draft, set, save, saving, isLoading } = useSettingsForm<PwaDraft>("pwa", {
    service_worker: true,
    cache_strategy: "networkFirst",
    name: "ThriftBeam",
    short_name: "ThriftBeam",
    description: "Smarter money, every week.",
    theme_color: "#2563EB",
    background_color: "#ffffff",
    display: "standalone",
  });

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-3 text-base font-semibold">Service worker</h3>
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3">
          <span className="text-sm font-medium">Enable service worker</span>
          <input type="checkbox" checked={draft.service_worker} onChange={(e) => set("service_worker", e.target.checked)} />
        </label>
        <div className="mt-3">
          <Field label="Cache strategy">
            <select className="input" value={draft.cache_strategy} onChange={(e) => set("cache_strategy", e.target.value as PwaDraft["cache_strategy"])}>
              <option value="networkFirst">Network first</option>
              <option value="cacheFirst">Cache first</option>
              <option value="staleWhileRevalidate">Stale while revalidate</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h2 className="text-base font-semibold">Manifest</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="App name"><input className="input" value={draft.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Short name"><input className="input" value={draft.short_name} onChange={(e) => set("short_name", e.target.value)} /></Field>
        </div>
        <Field label="Description"><input className="input" value={draft.description} onChange={(e) => set("description", e.target.value)} /></Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Theme color">
            <input type="color" value={draft.theme_color} onChange={(e) => set("theme_color", e.target.value)} className="input h-10 w-full" />
          </Field>
          <Field label="Background">
            <input type="color" value={draft.background_color} onChange={(e) => set("background_color", e.target.value)} className="input h-10 w-full" />
          </Field>
          <Field label="Display">
            <select className="input" value={draft.display} onChange={(e) => set("display", e.target.value as PwaDraft["display"])}>
              <option value="standalone">Standalone</option>
              <option value="fullscreen">Fullscreen</option>
              <option value="minimal-ui">Minimal UI</option>
              <option value="browser">Browser</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-end pt-2">
          <button disabled={saving} onClick={save} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
          </button>
        </div>
      </div>
      <style>{`.input{display:block;width:100%;height:40px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);padding:0 12px;font-size:14px}`}</style>
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
