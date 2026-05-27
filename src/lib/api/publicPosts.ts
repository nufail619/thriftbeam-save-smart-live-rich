// Public posts client — fetches from /posts (no auth) and adapts to the
// public-site Post shape used by PostCard, blog list, and single post page.

import { api } from "@/lib/api";
import type { Post } from "@/lib/mockData";

function slugify(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function findAuthor(name: string): string {
  return slugify(name);
}

function findCategorySlug(value: string): string {
  return slugify(value);
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

function toISO(d: unknown): string {
  if (typeof d !== "string") {
    try {
      return new Date(d as number).toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
  // "YYYY-MM-DD HH:MM:SS" → treat as UTC so SSR and client agree.
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(d)) return d.replace(" ", "T") + "Z";
  return d;
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
  const date = r.published_at ?? r.date ?? r.created_at ?? new Date().toISOString();

  return {
    slug: r.slug ?? "",
    title: r.title ?? "",
    excerpt: r.excerpt ?? "",
    category: findCategorySlug(r.category ?? r.category_name ?? r.category_slug ?? ""),
    authorSlug: findAuthor(r.author ?? r.author_name ?? ""),
    date: toISO(date),
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
    // Send both `category` and `category_slug` (same for tag) — backend keying varies.
    const expanded: Record<string, unknown> = { ...params };
    if (params.category) expanded.category_slug = params.category;
    if (params.tag) expanded.tag_slug = params.tag;
    const res = await api.get(`/posts${qs(expanded)}`);
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
