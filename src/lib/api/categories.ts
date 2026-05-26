import { api } from "@/lib/api";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

function norm(raw: unknown): Category {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = (raw as any)?.category ?? raw ?? {};
  return {
    id: r.id != null ? String(r.id) : "",
    name: r.name ?? "",
    slug: r.slug ?? "",
    description: r.description ?? "",
  };
}

function list(raw: unknown): Category[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  if (Array.isArray(r)) return r.map(norm);
  const arr = r?.items ?? r?.categories ?? r?.data ?? [];
  return Array.isArray(arr) ? arr.map(norm) : [];
}

export const categoriesApi = {
  list: async () => list(await api.get("/categories")),
  create: async (payload: Partial<Category>) => norm(await api.post("/categories", payload)),
  update: async (id: string, payload: Partial<Category>) =>
    norm(await api.put(`/categories/${id}`, payload)),
  remove: (id: string) => api.delete(`/categories/${id}`),
};
