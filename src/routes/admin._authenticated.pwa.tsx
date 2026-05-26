import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Smartphone, Send } from "lucide-react";
import { toast } from "sonner";
import StatCard from "@/components/admin/StatCard";
import { useSettings, settingsApi } from "@/lib/adminStore";

export const Route = createFileRoute("/admin/_authenticated/pwa")({
  component: PwaPage,
});

function PwaPage() {
  const p = useSettings().pwa;
  const [title, setTitle] = useState("Hello from ThriftBeam");
  const [body, setBody] = useState("New post just published.");
  const [url, setUrl] = useState("/blog");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Push subscribers" value={p.pushSubscribers} icon={Smartphone} />
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-base font-semibold">Service worker</h3>
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm font-medium">Enable service worker</span>
            <input type="checkbox" checked={p.serviceWorker} onChange={(e) => settingsApi.update("pwa", { serviceWorker: e.target.checked })} />
          </label>
          <div className="mt-3">
            <Field label="Cache strategy">
              <select className="input" value={p.cacheStrategy} onChange={(e) => settingsApi.update("pwa", { cacheStrategy: e.target.value as typeof p.cacheStrategy })}>
                <option value="networkFirst">Network first</option>
                <option value="cacheFirst">Cache first</option>
                <option value="staleWhileRevalidate">Stale while revalidate</option>
              </select>
            </Field>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h2 className="text-base font-semibold">Manifest</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="App name"><input className="input" value={p.name} onChange={(e) => settingsApi.update("pwa", { name: e.target.value })} /></Field>
          <Field label="Short name"><input className="input" value={p.shortName} onChange={(e) => settingsApi.update("pwa", { shortName: e.target.value })} /></Field>
        </div>
        <Field label="Description"><input className="input" value={p.description} onChange={(e) => settingsApi.update("pwa", { description: e.target.value })} /></Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Theme color">
            <input type="color" value={p.themeColor} onChange={(e) => settingsApi.update("pwa", { themeColor: e.target.value })} className="input h-10 w-full" />
          </Field>
          <Field label="Background">
            <input type="color" value={p.backgroundColor} onChange={(e) => settingsApi.update("pwa", { backgroundColor: e.target.value })} className="input h-10 w-full" />
          </Field>
          <Field label="Display">
            <select className="input" value={p.display} onChange={(e) => settingsApi.update("pwa", { display: e.target.value as typeof p.display })}>
              <option value="standalone">Standalone</option>
              <option value="fullscreen">Fullscreen</option>
              <option value="minimal-ui">Minimal UI</option>
              <option value="browser">Browser</option>
            </select>
          </Field>
        </div>
        <div className="flex justify-end pt-2">
          <button onClick={() => toast.success("Manifest saved")} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Save</button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h2 className="text-base font-semibold">Send test push</h2>
        <Field label="Title"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        <Field label="Body"><input className="input" value={body} onChange={(e) => setBody(e.target.value)} /></Field>
        <Field label="URL"><input className="input" value={url} onChange={(e) => setUrl(e.target.value)} /></Field>
        <div className="flex justify-end pt-2">
          <button onClick={() => toast.success("Test push sent")} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Send className="h-4 w-4" /> Send
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
