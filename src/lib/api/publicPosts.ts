// Public posts client — fetches from /posts (no auth) and adapts to the
// public-site Post shape used by PostCard, blog list, and single post page.

import { api } from "@/lib/api";
import type { Post } from "@/lib/mockData";
import { authors, categories } from "@/lib/mockData";

function findAuthor(name: string): string {
  const a = authors.find((x) => x.name.toLowerCase() === (name ?? "").toLowerCase());
  return a?.slug ?? authors[0]?.slug ?? "";
}

function findCategorySlug(value: string): string {
  if (!value) return categories[0]?.slug ?? "";
  const lower = String(value).toLowerCase();
  const bySlug = categories.find((c) => c.slug.toLowerCase() === lower);
  if (bySlug) return bySlug.slug;
  const byName = categories.find((c) => c.name.toLowerCase() === lower);
  if (byName) return byName.slug;
  return lower.replace(/\s+/g, "-");
}

function parseTags(t: unknown): string[] {
  if (Array.isArray(t)) return t.map(String);
  if (typeof t === "string") {
    try {
      const parsed = JSON.parse(t);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      // fall through
    }
    return t.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export function normalizeToPublicPost(raw: unknown): Post {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = (raw as any)?.post ?? raw ?? {};
  const image =
    r.featuredImage ??
    r.featured_image ??
    r.image ??
    r.thumbnail ??
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&h=675&q=70&fm=webp";
  const date =
    r.published_at ??
    r.date ??
    (typeof r.created_at === "string" ? r.created_at : new Date().toISOString());

  return {
    slug: r.slug ?? "",
    title: r.title ?? "",
    excerpt: r.excerpt ?? "",
    category: findCategorySlug(r.category ?? r.category_name ?? r.category_slug ?? ""),
    authorSlug: findAuthor(r.author ?? r.author_name ?? ""),
    date: typeof date === "string" ? date : new Date(date as number).toISOString(),
    readTime: Number(r.readingTime ?? r.reading_time ?? r.readTime ?? 5),
    image,
    tags: parseTags(r.tags),
    body: r.content ?? r.body ?? "",
    featured: Boolean(r.featured),
  };
}

function unwrapList(raw: unknown): unknown[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  if (Array.isArray(r)) return r;
  return r?.items ?? r?.posts ?? r?.data ?? [];
}

function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export type PublicListParams = {
  category?: string;
  tag?: string;
  q?: string;
  page?: number;
  per_page?: number;
};

export type PublicListResult = {
  posts: Post[];
  total: number;
  page: number;
  perPage: number;
  pages: number;
};

export const publicPostsApi = {
  list: async (params: PublicListParams = {}): Promise<PublicListResult> => {
    const res = await api.get(`/posts${qs(params)}`);
    const items = unwrapList(res).map(normalizeToPublicPost);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = res as any;
    return {
      posts: items,
      total: Number(r?.total ?? items.length),
      page: Number(r?.page ?? params.page ?? 1),
      perPage: Number(r?.per_page ?? params.per_page ?? items.length),
      pages: Number(r?.pages ?? Math.max(1, Math.ceil((Number(r?.total ?? items.length)) / (Number(r?.per_page ?? params.per_page ?? items.length) || 1)))),
    };
  },
  latest: async (per_page = 6): Promise<Post[]> => {
    const res = await api.get(`/posts${qs({ per_page })}`);
    return unwrapList(res).map(normalizeToPublicPost);
  },
  bySlug: async (slug: string): Promise<Post> =>
    normalizeToPublicPost(await api.get(`/posts/slug/${encodeURIComponent(slug)}`)),
};
