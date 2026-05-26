import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import RichEditor from "@/components/admin/RichEditor";
import SeoPanel from "@/components/admin/SeoPanel";
import { pagesApi, slugify } from "@/lib/adminStore";
import type { AdminPage, AdminPageStatus, AdminPageTemplate } from "@/lib/mockAdminData";

export const Route = createFileRoute("/admin/_authenticated/pages/$id/edit")({
  component: EditPageRoute,
});

const TEMPLATES: AdminPageTemplate[] = ["default", "full-width", "landing", "legal"];

function EditPageRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const existing = pagesApi.get(id);
  const [page, setPage] = useState<AdminPage | null>(existing ?? null);

  useEffect(() => {
    if (!existing) navigate({ to: "/admin/pages", replace: true });
  }, [existing, navigate]);

  if (!page) return null;

  const update = (patch: Partial<AdminPage>) => setPage({ ...page, ...patch });

  const save = (status?: AdminPageStatus) => {
    const payload = status ? { ...page, status } : page;
    pagesApi.update(id, payload);
    if (status) setPage(payload);
    toast.success("Saved");
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit page</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate({ to: "/admin/pages" })} className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted">Cancel</button>
          <button onClick={() => save("draft")} className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted">Save draft</button>
          <button onClick={() => save("published")} className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Publish</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <input
            value={page.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Page title"
            className="h-14 w-full rounded-xl border border-border bg-card px-4 text-2xl font-bold outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
            <span className="text-xs text-muted-foreground">/</span>
            <input
              value={page.slug}
              onChange={(e) => update({ slug: slugify(e.target.value) })}
              className="h-7 w-full bg-transparent text-sm outline-none"
            />
          </div>
          <RichEditor value={page.content} onChange={(html) => update({ content: html })} />
        </div>
        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Settings</h2>
            <div className="mt-3 space-y-3 text-sm">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Template</span>
                <select value={page.template} onChange={(e) => update({ template: e.target.value as AdminPageTemplate })} className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
                  {TEMPLATES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Status</span>
                <select value={page.status} onChange={(e) => update({ status: e.target.value as AdminPageStatus })} className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
            </div>
          </section>
          <SeoPanel
            title={page.seoTitle}
            description={page.seoDescription}
            slug={page.slug}
            onChange={(p) => update(p)}
          />
        </aside>
      </div>
    </div>
  );
}
