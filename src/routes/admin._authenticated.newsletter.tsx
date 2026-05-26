import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, UserCheck, UserX, MailWarning, Download, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import StatCard from "@/components/admin/StatCard";
import DataTable, { type Column } from "@/components/admin/DataTable";
import { newsletterApi } from "@/lib/api/newsletter";
import type { Subscriber } from "@/lib/mockAdminData";

export const Route = createFileRoute("/admin/_authenticated/newsletter")({
  component: NewsletterPage,
});

function NewsletterPage() {
  return (
    <div className="space-y-6">
      <SubscribersTab />
    </div>
  );
}

function SubscribersTab() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["newsletter"],
    queryFn: () => newsletterApi.list(),
  });
  const subs: Subscriber[] = data ?? [];
  const invalidate = () => qc.invalidateQueries({ queryKey: ["newsletter"] });

  const removeMut = useMutation({
    mutationFn: (id: string) => newsletterApi.remove(id),
    onSuccess: invalidate,
    onError: (e) => toast.error((e as Error).message),
  });

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
        <button
          onClick={async () => {
            try { await removeMut.mutateAsync(s.id); toast.success("Removed"); } catch {/* toast handled */}
          }}
          className="text-xs font-semibold text-destructive hover:underline"
        >
          Delete
        </button>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Newsletter</h1>
          <p className="text-sm text-muted-foreground">Email subscribers from across the site.</p>
        </div>
        <button onClick={exportCsv} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold hover:bg-muted">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {isError && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Failed to load subscribers: {(error as Error).message}</span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} icon={Mail} />
        <StatCard label="Subscribed" value={stats.subscribed} icon={UserCheck} />
        <StatCard label="Unsubscribed" value={stats.unsubscribed} icon={UserX} />
        <StatCard label="Bounced" value={stats.bounced} icon={MailWarning} />
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</div>
      ) : (
        <DataTable rows={subs} columns={columns} rowKey={(s) => s.id} searchable searchAccessor={(s) => `${s.email} ${s.name ?? ""}`} pageSize={15} />
      )}
    </div>
  );
}
