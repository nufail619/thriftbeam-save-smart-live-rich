import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plug } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/admin/Modal";
import { useIntegrations, integrationsApi } from "@/lib/adminStore";
import type { Integration } from "@/lib/mockAdminData";

export const Route = createFileRoute("/admin/_authenticated/integrations")({
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const integrations = useIntegrations();
  const [configuring, setConfiguring] = useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState("");

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Connect ThriftBeam to third-party services.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((i) => (
          <div key={i.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Plug className="h-5 w-5" />
              </span>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                i.connected ? "bg-[color:var(--success)]/10 text-[color:var(--success)]" : "bg-muted text-muted-foreground"
              }`}>{i.connected ? "Connected" : "Disconnected"}</span>
            </div>
            <h3 className="mt-3 font-semibold">{i.name}</h3>
            <p className="text-xs text-muted-foreground">{i.category}</p>
            <p className="mt-2 text-sm text-muted-foreground">{i.description}</p>
            {i.connected && i.lastSync && <p className="mt-2 text-xs text-muted-foreground">Last sync: {i.lastSync}</p>}
            <div className="mt-4 flex gap-2">
              <button onClick={() => { integrationsApi.toggle(i.id); toast.success(i.connected ? "Disconnected" : "Connected"); }}
                className={`h-9 flex-1 rounded-lg text-sm font-semibold ${i.connected ? "border border-border bg-card hover:bg-muted" : "bg-primary text-primary-foreground hover:opacity-90"}`}>
                {i.connected ? "Disconnect" : "Connect"}
              </button>
              <button onClick={() => { setConfiguring(i); setApiKey(i.apiKey ?? ""); }} className="h-9 rounded-lg border border-border px-3 text-sm font-semibold hover:bg-muted">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!configuring} onOpenChange={(v) => !v && setConfiguring(null)} title={configuring ? `Configure ${configuring.name}` : ""}>
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">API key</span>
            <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm font-mono" placeholder="sk_xxx…" />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setConfiguring(null)} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Cancel</button>
            <button onClick={() => { if (configuring) { integrationsApi.update(configuring.id, { apiKey }); toast.success("Saved"); } setConfiguring(null); }} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
