import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Database, Download } from "lucide-react";
import { toast } from "sonner";
import DataTable, { type Column } from "@/components/admin/DataTable";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useBackups, useSettings, backupsApi, settingsApi, formatBytes } from "@/lib/adminStore";
import type { BackupSnapshot } from "@/lib/mockAdminData";

export const Route = createFileRoute("/admin/_authenticated/backup")({
  component: BackupPage,
});

function BackupPage() {
  const backups = useBackups();
  const b = useSettings().backup;
  const [restoring, setRestoring] = useState<BackupSnapshot | null>(null);
  const [deleting, setDeleting] = useState<BackupSnapshot | null>(null);
  const [creating, setCreating] = useState(false);

  const create = () => {
    setCreating(true);
    setTimeout(() => { backupsApi.create("manual"); toast.success("Backup created"); setCreating(false); }, 800);
  };

  const columns: Column<BackupSnapshot>[] = [
    { key: "date", header: "Date", accessor: (b) => b.createdAt, sortable: true, render: (b) => <span className="text-sm">{b.createdAt}</span> },
    { key: "size", header: "Size", accessor: (b) => b.size, sortable: true, render: (b) => <span className="text-sm">{formatBytes(b.size)}</span> },
    { key: "type", header: "Type", render: (b) => <span className="text-xs uppercase tracking-wider text-muted-foreground">{b.type}</span> },
    { key: "status", header: "Status", render: (b) => <span className="text-xs font-semibold text-[color:var(--success)] capitalize">{b.status}</span> },
    {
      key: "a", header: "", className: "text-right",
      render: (bk) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.success("Download started")} className="text-xs font-semibold text-primary hover:underline">Download</button>
          <button onClick={() => setRestoring(bk)} className="text-xs font-semibold text-foreground hover:underline">Restore</button>
          <button onClick={() => setDeleting(bk)} className="text-xs font-semibold text-destructive hover:underline">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">Schedule</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Frequency">
            <select className="input" value={b.frequency} onChange={(e) => settingsApi.update("backup", { frequency: e.target.value as typeof b.frequency })}>
              <option value="off">Off</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </Field>
          <Field label={`Retention — ${b.retention} days`}>
            <input type="range" min={1} max={90} value={b.retention} onChange={(e) => settingsApi.update("backup", { retention: Number(e.target.value) })} className="w-full" />
          </Field>
          <Field label="Destination">
            <select className="input" value={b.destination} onChange={(e) => settingsApi.update("backup", { destination: e.target.value as typeof b.destination })}>
              <option value="local">Local</option>
              <option value="s3">Amazon S3</option>
              <option value="dropbox">Dropbox</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="flex justify-between">
        <p className="text-sm text-muted-foreground inline-flex items-center gap-2"><Database className="h-4 w-4" /> {backups.length} snapshots</p>
        <button onClick={create} disabled={creating} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
          <Download className="h-4 w-4" /> {creating ? "Creating…" : "Create backup now"}
        </button>
      </div>

      <DataTable rows={backups} columns={columns} rowKey={(b) => b.id} />

      <ConfirmDialog
        open={!!restoring} onOpenChange={(v) => !v && setRestoring(null)}
        title="Restore snapshot?" description="This will overwrite current site data." confirmLabel="Restore"
        onConfirm={() => { toast.success("Restore complete"); setRestoring(null); }}
      />
      <ConfirmDialog
        open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete snapshot?" destructive confirmLabel="Delete"
        onConfirm={() => { if (deleting) { backupsApi.remove(deleting.id); toast.success("Deleted"); } setDeleting(null); }}
      />

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
