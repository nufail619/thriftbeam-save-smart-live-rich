import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import RichEditor from "@/components/admin/RichEditor";
import SeoPanel from "@/components/admin/SeoPanel";
import { pagesApi } from "@/lib/api/pages";
import type { AdminPage, AdminPageStatus, AdminPageTemplate } from "@/lib/mockAdminData";

export const Route = createFileRoute("/admin/_authenticated/pages/$id/edit")({
  component: EditPageRoute,
});

const TEMPLATES: AdminPageTemplate[] = ["default", "full-width", "landing", "legal"];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
}

function EditPageRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pages", id],
    queryFn: () => pagesApi.get(id),
  });

  const [page, setPage] = useState<AdminPage | null>(null);
  useEffect(() => { if (data) setPage(data); }, [data]);

  const updateMut = useMutation({
    mutationFn: (payload: Partial<AdminPage>) => pagesApi.update(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData(["pages", id], updated);
      qc.invalidateQueries({ queryKey: ["pages"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading page…</div>;
  }
  if (isError || !page) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load page: {(error as Error)?.message ?? "Not found"}.{" "}
        <button className="underline" onClick={() => navigate({ to: "/admin/pages" })}>Back to pages</button>
      </div>
    );
  }

  const update = (patch: Partial<AdminPage>) => setPage((p) => p ? { ...p, ...patch } : p);

  const save = async (status?: AdminPageStatus) => {
    if (!page) return;
    const payload = status ? { ...page, status } : page;
    try {
      const updated = await updateMut.mutateAsync(payload);
      setPage(updated);
      toast.success(status === "published" ? "Published" : "Saved");
    } catch {/* toast handled */}
  };

  const saving = updateMut.isPending;

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit page</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate({ to: "/admin/pages" })} className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted">Cancel</button>
          <button disabled={saving} onClick={() => save("draft")} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save draft
          </button>
          <button disabled={saving} onClick={() => save("published")} className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Publish
          </button>
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
