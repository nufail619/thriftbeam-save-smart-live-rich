import { api } from "@/lib/api";
import type { AdminComment, CommentStatus } from "@/lib/mockAdminData";

function norm(raw: unknown): AdminComment {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = (raw as any)?.comment ?? raw ?? {};
  const author = r.author ?? r.name ?? r.author_name ?? "Anonymous";
  const email = r.email ?? r.author_email ?? "";
  return {
    id: r.id != null ? String(r.id) : "",
    author,
    email,
    body: r.body ?? r.content ?? "",
    postTitle: r.postTitle ?? r.post_title ?? r.post?.title ?? "",
    postSlug: r.postSlug ?? r.post_slug ?? r.post?.slug ?? "",
    date:
      typeof r.created_at === "string"
        ? r.created_at.slice(0, 10)
        : r.date ?? new Date().toISOString().slice(0, 10),
    status: (r.status as CommentStatus) ?? "pending",
    gravatar:
      r.gravatar ??
      r.avatar ??
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author || email || "c")}`,
  };
}

function list(raw: unknown): AdminComment[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  if (Array.isArray(r)) return r.map(norm);
  const arr = r?.items ?? r?.comments ?? r?.data ?? [];
  return Array.isArray(arr) ? arr.map(norm) : [];
}

export type PublicCommentPayload = {
  post_id?: string;
  post_slug?: string;
  author: string;
  email: string;
  body: string;
};

export const commentsApi = {
  list: async (params: { status?: "all" | CommentStatus; postSlug?: string } = {}) => {
    const sp = new URLSearchParams();
    if (params.status && params.status !== "all") sp.set("status", params.status);
    if (params.postSlug) sp.set("post_slug", params.postSlug);
    const q = sp.toString();
    return list(await api.get(`/comments${q ? `?${q}` : ""}`));
  },
  approvedFor: async (postSlug: string) =>
    list(await api.get(`/comments?status=approved&post_slug=${encodeURIComponent(postSlug)}`)),
  setStatus: async (id: string, status: CommentStatus) =>
    norm(await api.put(`/comments/${id}`, { status })),
  remove: (id: string) => api.delete(`/comments/${id}`),
  submit: async (payload: PublicCommentPayload) => norm(await api.post("/comments", payload)),
};
