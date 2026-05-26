import { api } from "@/lib/api";
import type { AdminPost, AdminPostStatus } from "@/lib/mockAdminData";

export type PostListParams = {
  status?: "all" | AdminPostStatus;
  category?: string;
  author?: string;
  q?: string;
  page?: number;
  per_page?: number;
};

export type PostsListResponse = {
  posts: AdminPost[];
  total?: number;
  page?: number;
  per_page?: number;
};

function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "" || v === "all") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const postsApi = {
  listAdmin: (params: PostListParams = {}) =>
    api.get<PostsListResponse | AdminPost[]>(`/posts/admin${qs(params)}`),
  get: (id: string) => api.get<AdminPost>(`/posts/${id}`),
  getBySlug: (slug: string) => api.get<AdminPost>(`/posts/slug/${slug}`),
  create: (payload: Partial<AdminPost>) => api.post<AdminPost>("/posts", payload),
  update: (id: string, payload: Partial<AdminPost>) => api.put<AdminPost>(`/posts/${id}`, payload),
  remove: (id: string) => api.delete<{ id: string }>(`/posts/${id}`),
  setStatus: (id: string, status: AdminPostStatus) =>
    api.put<AdminPost>(`/posts/${id}`, { status }),
};

export function normalizePosts(res: PostsListResponse | AdminPost[]): AdminPost[] {
  if (Array.isArray(res)) return res;
  return res?.posts ?? [];
}
