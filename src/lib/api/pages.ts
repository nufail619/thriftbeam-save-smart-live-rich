import { api } from "@/lib/api";
import type { AdminPage, AdminPageStatus, AdminPageTemplate } from "@/lib/mockAdminData";

function norm(raw: unknown): AdminPage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = (raw as any)?.page ?? raw ?? {};
  return {
    id: r.id != null ? String(r.id) : "",
    title: r.title ?? "",
    slug: r.slug ?? "",
    template: (r.template as AdminPageTemplate) ?? "default",
    status: (r.status as AdminPageStatus) ?? "published",
    lastEdited:
      typeof r.updated_at === "string"
        ? r.updated_at.slice(0, 10)
        : r.lastEdited ?? new Date().toISOString().slice(0, 10),
    content: r.content ?? "",
    seoTitle: r.seoTitle ?? r.seo_title ?? "",
    seoDescription: r.seoDescription ?? r.seo_description ?? "",
  };
}

function list(raw: unknown): AdminPage[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  if (Array.isArray(r)) return r.map(norm);
  const arr = r?.items ?? r?.pages ?? r?.data ?? [];
  return Array.isArray(arr) ? arr.map(norm) : [];
}

function payload(p: Partial<AdminPage>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...p };
  if (p.seoTitle !== undefined) out.seo_title = p.seoTitle;
  if (p.seoDescription !== undefined) out.seo_description = p.seoDescription;
  return out;
}

export const pagesApi = {
  list: async () => list(await api.get("/pages")),
  get: async (id: string) => norm(await api.get(`/pages/${id}`)),
  create: async (p: Partial<AdminPage>) => norm(await api.post("/pages", payload(p))),
  update: async (id: string, p: Partial<AdminPage>) =>
    norm(await api.put(`/pages/${id}`, payload(p))),
  remove: (id: string) => api.delete(`/pages/${id}`),
};
