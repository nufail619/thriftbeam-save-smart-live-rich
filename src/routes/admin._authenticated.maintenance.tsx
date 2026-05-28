import { createFileRoute } from "@tanstack/react-router";
import { Power, Loader2 } from "lucide-react";
import { useSettingsForm } from "@/hooks/useSettingsForm";

export const Route = createFileRoute("/admin/_authenticated/maintenance")({
  component: MaintenancePage,
});

type MaintenanceDraft = {
  enabled: boolean;
  title: string;
  message: string;
  retry_after: number;
  scheduled_end: string;
  allowed_ips: string;
};

function MaintenancePage() {
  const { draft, set, save, saving, isLoading } = useSettingsForm<MaintenanceDraft>("maintenance", {
    enabled: false,
    title: "We'll be right back",
    message: "<p>ThriftBeam is undergoing scheduled maintenance.</p>",
    retry_after: 3600,
    scheduled_end: "",
    allowed_ips: "",
  });

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border p-4">
          <div>
            <p className="font-semibold inline-flex items-center gap-2"><Power className="h-4 w-4" /> Maintenance mode</p>
            <p className="text-xs text-muted-foreground">Show a maintenance page to all visitors.</p>
          </div>
          <input type="checkbox" checked={draft.enabled} onChange={(e) => set("enabled", e.target.checked)} />
        </label>

        <Field label="Title"><input className="input" value={draft.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label="Message (HTML)"><textarea rows={4} className="input min-h-[100px] py-2" value={draft.message} onChange={(e) => set("message", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Retry-after (s)"><input type="number" className="input" value={draft.retry_after} onChange={(e) => set("retry_after", Number(e.target.value))} /></Field>
          <Field label="Scheduled end"><input type="datetime-local" className="input" value={draft.scheduled_end} onChange={(e) => set("scheduled_end", e.target.value)} /></Field>
        </div>
        <Field label="Allowed IPs (one per line)"><textarea rows={3} className="input min-h-[80px] py-2 font-mono" value={draft.allowed_ips} onChange={(e) => set("allowed_ips", e.target.value)} placeholder="203.0.113.7" /></Field>

        <div className="flex justify-end pt-2">
          <button disabled={saving} onClick={save} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-base font-semibold">Preview</h2>
        <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
          <h3 className="text-2xl font-bold">{draft.title}</h3>
          <div className="mt-3 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: draft.message }} />
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
