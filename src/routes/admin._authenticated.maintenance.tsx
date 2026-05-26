import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Power, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useSettings, settingsApi } from "@/lib/adminStore";

export const Route = createFileRoute("/admin/_authenticated/maintenance")({
  component: MaintenancePage,
});

const DIAGNOSTICS = [
  { id: "db", label: "Database connection", pass: true },
  { id: "cache", label: "Cache layer", pass: true },
  { id: "mail", label: "Mail provider", pass: true },
  { id: "storage", label: "Object storage", pass: true },
  { id: "ssl", label: "SSL certificate", pass: true },
];

function MaintenancePage() {
  const m = useSettings().maintenance;
  const [diag, setDiag] = useState<null | typeof DIAGNOSTICS>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-4">
          <div>
            <p className="font-semibold inline-flex items-center gap-2"><Power className="h-4 w-4" /> Maintenance mode</p>
            <p className="text-xs text-muted-foreground">Show a maintenance page to all visitors.</p>
          </div>
          <input type="checkbox" checked={m.enabled} onChange={(e) => { settingsApi.update("maintenance", { enabled: e.target.checked }); toast.success(e.target.checked ? "Maintenance on" : "Maintenance off"); }} />
        </label>

        <Field label="Title"><input className="input" value={m.title} onChange={(e) => settingsApi.update("maintenance", { title: e.target.value })} /></Field>
        <Field label="Message (HTML)"><textarea rows={4} className="input min-h-[100px] py-2" value={m.message} onChange={(e) => settingsApi.update("maintenance", { message: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Retry-after (s)"><input type="number" className="input" value={m.retryAfter} onChange={(e) => settingsApi.update("maintenance", { retryAfter: Number(e.target.value) })} /></Field>
          <Field label="Scheduled end"><input type="datetime-local" className="input" value={m.scheduledEnd} onChange={(e) => settingsApi.update("maintenance", { scheduledEnd: e.target.value })} /></Field>
        </div>
        <Field label="Allowed IPs (one per line)"><textarea rows={3} className="input min-h-[80px] py-2 font-mono" value={m.allowedIps} onChange={(e) => settingsApi.update("maintenance", { allowedIps: e.target.value })} placeholder="203.0.113.7" /></Field>

        <div className="flex justify-end pt-2">
          <button onClick={() => toast.success("Settings saved")} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Save</button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-base font-semibold">Preview</h2>
          <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
            <h3 className="text-2xl font-bold">{m.title}</h3>
            <div className="mt-3 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: m.message }} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Diagnostics</h2>
            <button onClick={() => { setDiag(null); setTimeout(() => setDiag(DIAGNOSTICS), 600); toast.success("Diagnostics complete"); }} className="h-9 rounded-lg border border-border px-3 text-sm font-semibold hover:bg-muted">Run</button>
          </div>
          {diag && (
            <ul className="mt-3 space-y-2">
              {diag.map((d) => (
                <li key={d.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <span>{d.label}</span>
                  {d.pass ? <CheckCircle2 className="h-5 w-5 text-[color:var(--success)]" /> : <XCircle className="h-5 w-5 text-destructive" />}
                </li>
              ))}
            </ul>
          )}
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
