import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useSettings, useRedirects, usePosts, usePages, settingsApi, redirectsApi } from "@/lib/adminStore";
import type { Redirect } from "@/lib/mockAdminData";

export const Route = createFileRoute("/admin/_authenticated/seo")({
  component: SeoPage,
});

const TABS = ["Global", "Sitemap", "Robots", "Redirects"] as const;

function SeoPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Global");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-semibold ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === "Global" && <GlobalTab />}
      {tab === "Sitemap" && <SitemapTab />}
      {tab === "Robots" && <RobotsTab />}
      {tab === "Redirects" && <RedirectsTab />}
    </div>
  );
}

function GlobalTab() {
  const s = useSettings().seo;
  return (
    <div className="max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6">
      <Field label="Title template"><input className="input" value={s.titleTemplate} onChange={(e) => settingsApi.update("seo", { titleTemplate: e.target.value })} /></Field>
      <Field label="Default meta description"><textarea rows={3} className="input min-h-[80px] py-2" value={s.metaDescription} onChange={(e) => settingsApi.update("seo", { metaDescription: e.target.value })} /></Field>
      <Field label="Default OG image URL"><input className="input" value={s.ogImage} onChange={(e) => settingsApi.update("seo", { ogImage: e.target.value })} placeholder="https://…" /></Field>
      <Field label="Twitter handle"><input className="input" value={s.twitterHandle} onChange={(e) => settingsApi.update("seo", { twitterHandle: e.target.value })} /></Field>
      <Field label="Organization name"><input className="input" value={s.orgName} onChange={(e) => settingsApi.update("seo", { orgName: e.target.value })} /></Field>
      <Field label="Organization URL"><input className="input" value={s.orgUrl} onChange={(e) => settingsApi.update("seo", { orgUrl: e.target.value })} /></Field>
      <div className="flex justify-end">
        <button onClick={() => toast.success("SEO settings saved")} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Save</button>
      </div>
      <style>{`.input{display:block;width:100%;height:40px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);padding:0 12px;font-size:14px}`}</style>
    </div>
  );
}

function SitemapTab() {
  const posts = usePosts().filter((p) => p.status === "published");
  const pages = usePages().filter((p) => p.status === "published");
  const urls = [
    { loc: "/", mod: "2026-05-26" },
    ...pages.map((p) => ({ loc: `/${p.slug}`, mod: p.lastEdited })),
    ...posts.slice(0, 30).map((p) => ({ loc: `/blog/${p.slug}`, mod: p.date })),
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{urls.length} URLs in sitemap</p>
        <button onClick={() => toast.success("Sitemap regenerated")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold hover:bg-muted">
          <RefreshCw className="h-4 w-4" /> Regenerate
        </button>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <ul className="divide-y divide-border">
          {urls.map((u) => (
            <li key={u.loc} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <code className="font-mono">{u.loc}</code>
              <span className="text-xs text-muted-foreground">{u.mod}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RobotsTab() {
  const s = useSettings().seo;
  return (
    <div className="space-y-4">
      <textarea rows={14} className="w-full rounded-2xl border border-border bg-card p-4 font-mono text-sm" value={s.robotsTxt} onChange={(e) => settingsApi.update("seo", { robotsTxt: e.target.value })} />
      <div className="flex justify-end">
        <button onClick={() => toast.success("robots.txt saved")} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Save</button>
      </div>
    </div>
  );
}

function RedirectsTab() {
  const redirects = useRedirects();
  const [editing, setEditing] = useState<Redirect | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Redirect | null>(null);

  const columns: Column<Redirect>[] = [
    { key: "from", header: "From", render: (r) => <code className="text-sm font-mono">{r.from}</code> },
    { key: "to", header: "To", render: (r) => <code className="text-sm font-mono">{r.to}</code> },
    { key: "code", header: "Code", render: (r) => <span className="text-sm">{r.code}</span> },
    { key: "hits", header: "Hits", accessor: (r) => r.hits, sortable: true, render: (r) => <span className="text-sm">{r.hits}</span> },
    {
      key: "a", header: "", className: "text-right",
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => setEditing(r)} className="text-xs font-semibold text-primary hover:underline">Edit</button>
          <button onClick={() => setDeleting(r)} className="text-xs font-semibold text-destructive hover:underline">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setCreating(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Plus className="h-4 w-4" /> Add redirect
        </button>
      </div>
      <DataTable rows={redirects} columns={columns} rowKey={(r) => r.id} />
      <RedirectModal open={creating || !!editing} onOpenChange={(v) => { if (!v) { setCreating(false); setEditing(null); } }} redirect={editing} />
      <ConfirmDialog
        open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete redirect?" destructive confirmLabel="Delete"
        onConfirm={() => { if (deleting) { redirectsApi.remove(deleting.id); toast.success("Deleted"); } setDeleting(null); }}
      />
    </div>
  );
}

function RedirectModal({ open, onOpenChange, redirect }: { open: boolean; onOpenChange: (v: boolean) => void; redirect: Redirect | null }) {
  const [from, setFrom] = useState(redirect?.from ?? "");
  const [to, setTo] = useState(redirect?.to ?? "");
  const [code, setCode] = useState<301 | 302>(redirect?.code ?? 301);
  if (open && redirect && from !== redirect.from) { setFrom(redirect.from); setTo(redirect.to); setCode(redirect.code); }
  const submit = () => {
    if (!from || !to) { toast.error("Fields required"); return; }
    if (redirect) { redirectsApi.update(redirect.id, { from, to, code }); toast.success("Updated"); }
    else { redirectsApi.create({ from, to, code }); toast.success("Created"); }
    onOpenChange(false); setFrom(""); setTo(""); setCode(301);
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={redirect ? "Edit redirect" : "New redirect"}>
      <div className="space-y-3">
        <Field label="From"><input className="input" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="/old-path" /></Field>
        <Field label="To"><input className="input" value={to} onChange={(e) => setTo(e.target.value)} placeholder="/new-path" /></Field>
        <Field label="Code">
          <select className="input" value={code} onChange={(e) => setCode(Number(e.target.value) as 301 | 302)}>
            <option value={301}>301 — Permanent</option>
            <option value={302}>302 — Temporary</option>
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => onOpenChange(false)} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Cancel</button>
          <button onClick={submit} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Save</button>
        </div>
        <style>{`.input{display:block;width:100%;height:40px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);padding:0 12px;font-size:14px}`}</style>
      </div>
    </Modal>
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
