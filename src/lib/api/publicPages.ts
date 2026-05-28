// Public pages client — fetches static page content from GET /pages/{slug}
// No auth required. Used by About, Privacy, Disclaimer, Terms, etc.

import { api } from "@/lib/api";

export type PublicPage = {
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
};

function normalize(raw: unknown, fallbackSlug: string): PublicPage {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = (raw as any)?.page ?? (raw as any)?.data ?? raw ?? {};
  return {
    slug: r.slug ?? fallbackSlug,
    title: r.title ?? "",
    content: r.content ?? "",
    metaTitle: r.meta_title ?? r.metaTitle ?? "",
    metaDescription: r.meta_description ?? r.metaDescription ?? "",
  };
}

export const publicPagesApi = {
  bySlug: async (slug: string): Promise<PublicPage> => {
    const res = await api.get(`/pages/${encodeURIComponent(slug)}`);
    return normalize(res, slug);
  },
};
