import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FileText, Plus, Pencil, Trash2, MoreVertical } from "lucide-react";
import EmptyState from "@/components/admin/EmptyState";
import AdminBadge from "@/components/admin/Badge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import Modal from "@/components/admin/Modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePages, pagesApi, slugify } from "@/lib/adminStore";
import { toast } from "sonner";
import type { AdminPageTemplate, AdminPageStatus } from "@/lib/mockAdminData";

export const Route = createFileRoute("/admin/_authenticated/pages")({
  component: PagesPage,
});

const TEMPLATES: AdminPageTemplate[] = ["default", "full-width", "landing", "legal"];

function PagesPage() {
  const pages = usePages();
  const navigate = useNavigate();
  const [newOpen, setNewOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [template, setTemplate] = useState<AdminPageTemplate>("default");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const createPage = () => {
    if (!title.trim()) {
      toast.error("Title required");
      return;
    }
    const page = pagesApi.create({
      title,
      slug: slug || slugify(title),
      template,
      status: "draft",
      content: `<h1>${title}</h1><p>Start writing…</p>`,
      seoTitle: title,
      seoDescription: "",
    });
    setNewOpen(false);
    setTitle(""); setSlug(""); setTemplate("default");
    toast.success("Page created");
    navigate({ to: "/admin/pages/$id/edit", params: { id: page.id } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pages</h1>
          <p className="text-sm text-muted-foreground">Static pages like About, Contact and legal docs.</p>
        </div>
        <button
          type="button"
          onClick={() => setNewOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New page
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        {pages.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={FileText} title="No pages yet" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-2 py-2">Slug</th>
                  <th className="px-2 py-2">Template</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Last edited</th>
                  <th className="w-12 px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link to="/admin/pages/$id/edit" params={{ id: p.id }} className="font-medium hover:text-primary">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">/{p.slug}</td>
                    <td className="px-2 py-3 text-muted-foreground capitalize">{p.template}</td>
                    <td className="px-2 py-3">
                      <AdminBadge variant={p.status === "published" ? "published" : "draft"}>{p.status}</AdminBadge>
                    </td>
                    <td className="px-2 py-3 text-muted-foreground">{p.lastEdited}</td>
                    <td className="px-2 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted" aria-label="Row actions">
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/admin/pages/$id/edit" params={{ id: p.id }}>
                              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setConfirmId(p.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={newOpen} onOpenChange={setNewOpen} title="New page" description="Create a static page.">
        <div className="space-y-3">
          <label className="block text-sm">
            <span className="font-medium">Title</span>
            <input
              autoFocus
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(slugify(e.target.value)); }}
              className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Slug</span>
            <input
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Template</span>
            <select value={template} onChange={(e) => setTemplate(e.target.value as AdminPageTemplate)} className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
              {TEMPLATES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setNewOpen(false)} className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted">Cancel</button>
            <button onClick={createPage} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Create</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(v) => !v && setConfirmId(null)}
        title="Delete page?"
        description="This will permanently delete the page."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (confirmId) { pagesApi.remove(confirmId); toast.success("Deleted"); }
          setConfirmId(null);
        }}
      />
    </div>
  );
}
