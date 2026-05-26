import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Upload,
  Grid3x3,
  List,
  Search,
  Image as ImageIcon,
  FileText,
  Copy,
  Trash2,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmptyState from "@/components/admin/EmptyState";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useMedia, mediaApi, formatBytes } from "@/lib/adminStore";
import type { MediaItem, MediaType } from "@/lib/mockAdminData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authenticated/media")({
  component: MediaPage,
});

function MediaPage() {
  const media = useMedia();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [type, setType] = useState<"all" | MediaType>("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return media.filter((m) => {
      if (type !== "all" && m.type !== type) return false;
      if (q && !m.filename.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [media, type, query]);

  const active = media.find((m) => m.id === activeId) ?? null;

  const copyUrl = (url: string) => {
    navigator.clipboard?.writeText(url);
    toast.success("URL copied");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media library</h1>
          <p className="text-sm text-muted-foreground">Images and documents available across the site.</p>
        </div>
        <button
          type="button"
          onClick={() => { const [it] = mediaApi.uploadMock(1); toast.success("Uploaded (mock)"); if (it) setActiveId(it.id); }}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Upload className="h-4 w-4" /> Upload
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
          <button onClick={() => setView("grid")} aria-label="Grid view" className={cn("inline-flex h-7 w-7 items-center justify-center rounded", view === "grid" && "bg-primary text-primary-foreground")}>
            <Grid3x3 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setView("list")} aria-label="List view" className={cn("inline-flex h-7 w-7 items-center justify-center rounded", view === "list" && "bg-primary text-primary-foreground")}>
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="h-9 rounded-md border border-border bg-background px-2 text-sm">
          <option value="all">All types</option>
          <option value="image">Images</option>
          <option value="document">Documents</option>
        </select>
        <div className="ml-auto flex items-center gap-2 rounded-md border border-border bg-background px-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search filename…"
            className="h-8 w-56 bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ImageIcon} title="No media found" description="Upload a file or adjust your filters." />
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveId(m.id)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted text-left"
            >
              {m.type === "image" ? (
                <img src={m.url} alt={m.alt} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
              ) : (
                <FileText className="m-auto h-10 w-10 text-muted-foreground" />
              )}
              <div className="absolute inset-x-0 bottom-0 translate-y-full bg-foreground/85 px-2 py-1 text-[11px] text-background transition group-hover:translate-y-0">
                <p className="truncate font-medium">{m.filename}</p>
                <p className="text-background/70">{m.width ? `${m.width}×${m.height} · ` : ""}{formatBytes(m.size)}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-2">File</th><th className="px-2 py-2">Type</th><th className="px-2 py-2">Size</th><th className="px-2 py-2">Uploaded</th><th className="w-32 px-2 py-2"></th></tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <button onClick={() => setActiveId(m.id)} className="flex items-center gap-3 text-left">
                      {m.type === "image" ? (
                        <img src={m.url} alt="" className="h-10 w-10 rounded-md object-cover" />
                      ) : (
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted"><FileText className="h-5 w-5 text-muted-foreground" /></span>
                      )}
                      <span className="font-medium hover:text-primary">{m.filename}</span>
                    </button>
                  </td>
                  <td className="px-2 py-3 text-muted-foreground capitalize">{m.type}</td>
                  <td className="px-2 py-3 text-muted-foreground">{formatBytes(m.size)}</td>
                  <td className="px-2 py-3 text-muted-foreground">{m.uploadedAt}</td>
                  <td className="px-2 py-3 text-right">
                    {m.url && (
                      <button onClick={() => copyUrl(m.url)} className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted" aria-label="Copy URL">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button onClick={() => setConfirmId(m.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10" aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(v) => !v && setActiveId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="truncate">{active?.filename}</DialogTitle>
          </DialogHeader>
          {active && (
            <div className="space-y-4">
              {active.type === "image" && active.url ? (
                <img src={active.url} alt={active.alt} className="max-h-[420px] w-full rounded-lg object-contain" />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-xs text-muted-foreground">Type</dt><dd className="capitalize">{active.type}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Size</dt><dd>{formatBytes(active.size)}</dd></div>
                {active.width && <div><dt className="text-xs text-muted-foreground">Dimensions</dt><dd>{active.width}×{active.height}</dd></div>}
                <div><dt className="text-xs text-muted-foreground">Uploaded</dt><dd>{active.uploadedAt}</dd></div>
              </dl>
              <label className="block text-sm">
                <span className="font-medium">Alt text</span>
                <input
                  defaultValue={active.alt}
                  onBlur={(e) => { mediaApi.update(active.id, { alt: e.target.value }); toast.success("Alt text updated"); }}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {active.url && (
                  <button onClick={() => copyUrl(active.url)} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium hover:bg-muted">
                    <Copy className="h-3.5 w-3.5" /> Copy URL
                  </button>
                )}
                <button onClick={() => setConfirmId(active.id)} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 text-sm font-medium text-destructive hover:bg-destructive/15">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(v) => !v && setConfirmId(null)}
        title="Delete file?"
        description="This file will be removed from the library."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (confirmId) { mediaApi.remove(confirmId); toast.success("Deleted"); if (activeId === confirmId) setActiveId(null); }
          setConfirmId(null);
        }}
      />
    </div>
  );
}
