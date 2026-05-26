import { api } from "@/lib/api";
import type { Subscriber, SubscriberStatus } from "@/lib/mockAdminData";

function norm(raw: unknown): Subscriber {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = (raw as any)?.subscriber ?? raw ?? {};
  return {
    id: r.id != null ? String(r.id) : "",
    email: r.email ?? "",
    name: r.name ?? undefined,
    status: (r.status as SubscriberStatus) ?? "subscribed",
    source: r.source ?? "form",
    subscribedAt:
      typeof r.subscribed_at === "string"
        ? r.subscribed_at.slice(0, 10)
        : typeof r.created_at === "string"
          ? r.created_at.slice(0, 10)
          : r.subscribedAt ?? "",
  };
}

function list(raw: unknown): Subscriber[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  if (Array.isArray(r)) return r.map(norm);
  const arr = r?.items ?? r?.subscribers ?? r?.data ?? [];
  return Array.isArray(arr) ? arr.map(norm) : [];
}

export const newsletterApi = {
  list: async () => list(await api.get("/newsletter")),
  update: async (id: string, payload: Partial<Subscriber>) =>
    norm(await api.put(`/newsletter/${id}`, payload)),
  remove: (id: string) => api.delete(`/newsletter/${id}`),
  subscribe: async (email: string, source = "site-form") =>
    norm(await api.post("/newsletter", { email: email.trim(), source })),
};
