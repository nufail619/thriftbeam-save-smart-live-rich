import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Upload, Search, Database, RefreshCw, Activity, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/admin/Modal";
import { usePosts, usePages, useUsers } from "@/lib/adminStore";

export const Route = createFileRoute("/admin/_authenticated/tools")({
  component: ToolsPage,
});

type Tool = "import" | "export" | "replace" | "optimize" | "thumbs" | "health" | null;

function ToolsPage() {
  const [open, setOpen] = useState<Tool>(null);

  const tools: { id: Exclude<Tool, null>; title: string; desc: string; icon: LucideIcon }[] = [
    { id: "import", title: "Import", desc: "WordPress XML or Markdown ZIP.", icon: Upload },
    { id: "export", title: "Export", desc: "Posts, pages, users as JSON or CSV.", icon: Download },
    { id: "replace", title: "Search & Replace", desc: "Bulk text find/replace.", icon: Search },
    { id: "optimize", title: "Database Optimize", desc: "Defragment and clean.", icon: Database },
    { id: "thumbs", title: "Regenerate Thumbnails", desc: "Rebuild image variants.", icon: RefreshCw },
    { id: "health", title: "Health Check", desc: "Run site diagnostics.", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">Utility tools for maintenance and migration.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => (
          <button key={t.id} onClick={() => setOpen(t.id)} className="rounded-2xl border border-border bg-card p-5 text-left hover:bg-muted/30">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><t.icon className="h-5 w-5" /></span>
            <h3 className="mt-3 font-semibold">{t.title}</h3>
            <p className="text-sm text-muted-foreground">{t.desc}</p>
          </button>
        ))}
      </div>

      <ImportModal open={open === "import"} onClose={() => setOpen(null)} />
      <ExportModal open={open === "export"} onClose={() => setOpen(null)} />
      <ReplaceModal open={open === "replace"} onClose={() => setOpen(null)} />
      <ProgressModal open={open === "optimize"} onClose={() => setOpen(null)} title="Database Optimize" />
      <ProgressModal open={open === "thumbs"} onClose={() => setOpen(null)} title="Regenerate Thumbnails" />
      <HealthModal open={open === "health"} onClose={() => setOpen(null)} />
    </div>
  );
}

function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [text, setText] = useState("");
  return (
    <Modal open={open} onOpenChange={(v) => !v && onClose()} title="Import content">
      <textarea rows={6} className="w-full rounded-lg border border-border bg-card p-3 font-mono text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste WordPress XML or Markdown…" />
      <div className="mt-3 flex justify-end gap-2">
        <button onClick={onClose} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Cancel</button>
        <button onClick={() => { toast.success("Imported (mock)"); setText(""); onClose(); }} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Import</button>
      </div>
    </Modal>
  );
}

function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const posts = usePosts();
  const pages = usePages();
  const users = useUsers();
  const download = (data: unknown, name: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded");
  };
  return (
    <Modal open={open} onOpenChange={(v) => !v && onClose()} title="Export content">
      <div className="space-y-2">
        <button onClick={() => download(posts, "posts.json")} className="block w-full rounded-lg border border-border p-3 text-left text-sm font-semibold hover:bg-muted">Export posts ({posts.length})</button>
        <button onClick={() => download(pages, "pages.json")} className="block w-full rounded-lg border border-border p-3 text-left text-sm font-semibold hover:bg-muted">Export pages ({pages.length})</button>
        <button onClick={() => download(users, "users.json")} className="block w-full rounded-lg border border-border p-3 text-left text-sm font-semibold hover:bg-muted">Export users ({users.length})</button>
      </div>
    </Modal>
  );
}

function ReplaceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  return (
    <Modal open={open} onOpenChange={(v) => !v && onClose()} title="Search & Replace">
      <div className="space-y-3">
        <input value={find} onChange={(e) => setFind(e.target.value)} placeholder="Find" className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm" />
        <input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="Replace with" className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm" />
        <div className="flex justify-end gap-2">
          <button onClick={() => toast(`Dry run: 14 matches found`)} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Dry run</button>
          <button onClick={() => { toast.success("Replaced 14 occurrences"); onClose(); }} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Apply</button>
        </div>
      </div>
    </Modal>
  );
}

function ProgressModal({ open, onClose, title }: { open: boolean; onClose: () => void; title: string }) {
  const [progress, setProgress] = useState(0);
  const start = () => {
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(t); toast.success(`${title} complete`); return 100; }
        return p + 10;
      });
    }, 150);
  };
  return (
    <Modal open={open} onOpenChange={(v) => !v && onClose()} title={title}>
      <div className="space-y-3">
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{progress}% complete</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Close</button>
          <button onClick={start} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Run</button>
        </div>
      </div>
    </Modal>
  );
}

function HealthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const checks = [
    { label: "PHP version", pass: true, info: "8.3" },
    { label: "Database", pass: true, info: "MySQL 8.0" },
    { label: "Disk space", pass: true, info: "62% used" },
    { label: "Cron jobs", pass: true, info: "On schedule" },
    { label: "REST API", pass: true, info: "Reachable" },
  ];
  return (
    <Modal open={open} onOpenChange={(v) => !v && onClose()} title="Health Check">
      <ul className="space-y-2">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
            <span>{c.label}</span>
            <span className={`font-semibold ${c.pass ? "text-[color:var(--success)]" : "text-destructive"}`}>{c.info}</span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
