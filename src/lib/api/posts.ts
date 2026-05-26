import { api } from "@/lib/api";
import { AUTHORS, CATEGORIES, type AdminPost, type AdminPostStatus } from "@/lib/mockAdminData";

export type PostListParams = {
  status?: "all" | AdminPostStatus;
  category?: string;
  author?: string;
  q?: string;
  page?: number;
  per_page?: number;
};

export type PostsListResponse = {
  posts?: AdminPost[];
  items?: AdminPost[];
  total?: number;
  page?: number;
  per_page?: number;
  pages?: number;
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

// Tolerant: accepts {post: {...}} wrapper, snake_case fields, stringified tags.
export function normalizePost(raw: unknown): AdminPost {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  const p = r?.post ?? r ?? {};
  let tags: string[] = [];
  if (Array.isArray(p.tags)) tags = p.tags.map(String);
  else if (typeof p.tags === "string") {
    try {
      const parsed = JSON.parse(p.tags);
      tags = Array.isArray(parsed) ? parsed.map(String) : p.tags.split(",").map((s: string) => s.trim()).filter(Boolean);
    } catch {
      tags = p.tags.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
  }
  const created = typeof p.created_at === "string" ? p.created_at.slice(0, 10) : "";
  return {
    id: p.id != null ? String(p.id) : "",
    title: p.title ?? "",
    slug: p.slug ?? "",
    author: p.author ?? p.author_name ?? AUTHORS[0],
    category: p.category ?? p.category_name ?? CATEGORIES[0],
    status: (p.status as AdminPostStatus) ?? "draft",
    views: Number(p.views ?? 0),
    date: p.date ?? p.published_at ?? created ?? "",
    thumbnail: p.thumbnail ?? p.featured_image ?? "",
    excerpt: p.excerpt ?? "",
    content: p.content ?? "",
    tags,
    featuredImage: p.featuredImage ?? p.featured_image ?? p.thumbnail ?? "",
    seoTitle: p.seoTitle ?? p.seo_title ?? "",
    seoDescription: p.seoDescription ?? p.seo_description ?? "",
    readingTime: Number(p.readingTime ?? p.reading_time ?? 3),
  };
}

function toApiPayload(p: Partial<AdminPost>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...p };
  if (p.featuredImage !== undefined) out.featured_image = p.featuredImage;
  if (p.seoTitle !== undefined) out.seo_title = p.seoTitle;
  if (p.seoDescription !== undefined) out.seo_description = p.seoDescription;
  if (p.readingTime !== undefined) out.reading_time = p.readingTime;
  return out;
}

export const postsApi = {
  listAdmin: async (params: PostListParams = {}): Promise<PostsListResponse> => {
    const res = await api.get<PostsListResponse | AdminPost[]>(`/posts/admin${qs(params)}`);
    if (Array.isArray(res)) return { posts: res.map(normalizePost), items: res.map(normalizePost) };
    const r = (res ?? {}) as PostsListResponse;
    const raw = Array.isArray(r.items) ? r.items : Array.isArray(r.posts) ? r.posts : [];
    const normalized = raw.map(normalizePost);
    return { ...r, posts: normalized, items: normalized };
  },
  get: async (id: string) => normalizePost(await api.get(`/posts/${id}`)),
  getBySlug: async (slug: string) => normalizePost(await api.get(`/posts/slug/${slug}`)),
  create: async (payload: Partial<AdminPost>) => normalizePost(await api.post("/posts", toApiPayload(payload))),
  update: async (id: string, payload: Partial<AdminPost>) =>
    normalizePost(await api.put(`/posts/${id}`, toApiPayload(payload))),
  remove: (id: string) => api.delete<{ id: string }>(`/posts/${id}`),
  setStatus: async (id: string, status: AdminPostStatus) =>
    normalizePost(await api.put(`/posts/${id}`, { status })),
};

export function normalizePosts(res: PostsListResponse | AdminPost[]): AdminPost[] {
  if (Array.isArray(res)) return res;
  return res?.items ?? res?.posts ?? [];
}

