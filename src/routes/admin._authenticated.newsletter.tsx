import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, UserCheck, UserX, MailWarning, Plus, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import StatCard from "@/components/admin/StatCard";
import DataTable, { type Column } from "@/components/admin/DataTable";
import AdminBadge from "@/components/admin/Badge";
import Modal from "@/components/admin/Modal";
import { useSubscribers, useCampaigns, subscribersApi, campaignsApi } from "@/lib/adminStore";
import type { Subscriber, NewsletterCampaign } from "@/lib/mockAdminData";

export const Route = createFileRoute("/admin/_authenticated/newsletter")({
  component: NewsletterPage,
});

function NewsletterPage() {
  const [tab, setTab] = useState<"subs" | "camp">("subs");
  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-border">
        {(["subs", "camp"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-semibold ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
            {t === "subs" ? "Subscribers" : "Campaigns"}
          </button>
        ))}
      </div>
      {tab === "subs" ? <SubscribersTab /> : <CampaignsTab />}
    </div>
  );
}

function SubscribersTab() {
  const subs = useSubscribers();
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const stats = {
    total: subs.length,
    subscribed: subs.filter((s) => s.status === "subscribed").length,
    unsubscribed: subs.filter((s) => s.status === "unsubscribed").length,
    bounced: subs.filter((s) => s.status === "bounced").length,
  };

  const columns: Column<Subscriber>[] = [
    { key: "email", header: "Email", accessor: (s) => s.email, sortable: true, render: (s) => <span className="text-sm font-medium">{s.email}</span> },
    { key: "name", header: "Name", render: (s) => <span className="text-sm text-muted-foreground">{s.name ?? "—"}</span> },
    {
      key: "status", header: "Status",
      render: (s) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
          s.status === "subscribed" ? "bg-[color:var(--success)]/10 text-[color:var(--success)]" :
          s.status === "bounced" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
        }`}>{s.status}</span>
      ),
    },
    { key: "source", header: "Source", render: (s) => <span className="text-xs text-muted-foreground">{s.source}</span> },
    { key: "date", header: "Date", accessor: (s) => s.subscribedAt, sortable: true, render: (s) => <span className="text-sm text-muted-foreground">{s.subscribedAt}</span> },
    {
      key: "actions", header: "", className: "text-right",
      render: (s) => (
        <button onClick={() => { subscribersApi.remove(s.id); toast.success("Removed"); }} className="text-xs font-semibold text-destructive hover:underline">Delete</button>
      ),
    },
  ];

  const exportCsv = () => {
    const csv = ["email,name,status,source,date", ...subs.map((s) => `${s.email},${s.name ?? ""},${s.status},${s.source},${s.subscribedAt}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  };

  const doImport = () => {
    const emails = importText.split(/[\n,]+/).map((s) => s.trim()).filter((s) => /\S+@\S+/.test(s));
    if (!emails.length) { toast.error("No valid emails"); return; }
    subscribersApi.bulkCreate(emails);
    toast.success(`Imported ${emails.length} subscribers`);
    setImportText(""); setImportOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button onClick={() => setImportOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold hover:bg-muted">
          <Upload className="h-4 w-4" /> Import
        </button>
        <button onClick={exportCsv} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold hover:bg-muted">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} icon={Mail} />
        <StatCard label="Subscribed" value={stats.subscribed} icon={UserCheck} />
        <StatCard label="Unsubscribed" value={stats.unsubscribed} icon={UserX} />
        <StatCard label="Bounced" value={stats.bounced} icon={MailWarning} />
      </div>

      <DataTable rows={subs} columns={columns} rowKey={(s) => s.id} searchable searchAccessor={(s) => `${s.email} ${s.name ?? ""}`} pageSize={15} />

      <Modal open={importOpen} onOpenChange={setImportOpen} title="Import subscribers" description="Paste emails separated by commas or new lines.">
        <textarea value={importText} onChange={(e) => setImportText(e.target.value)} rows={6}
          placeholder="alice@example.com&#10;bob@example.com"
          className="w-full rounded-lg border border-border bg-card p-3 text-sm font-mono" />
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={() => setImportOpen(false)} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Cancel</button>
          <button onClick={doImport} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Import</button>
        </div>
      </Modal>
    </div>
  );
}

function CampaignsTab() {
  const campaigns = useCampaigns();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const submit = (status: NewsletterCampaign["status"]) => {
    if (!subject) { toast.error("Subject required"); return; }
    campaignsApi.create({
      subject, body, status,
      sentAt: status === "sent" ? new Date().toISOString().slice(0, 10) : null,
      recipients: status === "sent" ? 9900 : 0,
      openRate: 0, clickRate: 0,
    });
    toast.success(status === "sent" ? "Campaign sent" : status === "scheduled" ? "Scheduled" : "Draft saved");
    setSubject(""); setBody(""); setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> New campaign
        </button>
      </div>
      <ul className="space-y-3">
        {campaigns.map((c) => (
          <li key={c.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{c.subject}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.sentAt ?? "—"} · {c.recipients.toLocaleString()} recipients</p>
              </div>
              <AdminBadge variant={c.status === "sent" ? "published" : c.status === "scheduled" ? "scheduled" : "draft"}>{c.status}</AdminBadge>
            </div>
            {c.status === "sent" && (
              <div className="mt-3 flex gap-6 text-sm">
                <span><span className="font-semibold">{c.openRate}%</span> <span className="text-muted-foreground">open</span></span>
                <span><span className="font-semibold">{c.clickRate}%</span> <span className="text-muted-foreground">click</span></span>
              </div>
            )}
          </li>
        ))}
      </ul>

      <Modal open={open} onOpenChange={setOpen} title="New campaign">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Body (HTML)</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="w-full rounded-lg border border-border bg-card p-3 text-sm font-mono" />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => submit("draft")} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Save draft</button>
            <button onClick={() => submit("scheduled")} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Schedule</button>
            <button onClick={() => submit("sent")} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Send now</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
