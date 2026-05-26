import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { categories, posts as fallbackPosts } from "@/lib/mockData";
import { publicPostsApi } from "@/lib/api/publicPosts";
import PostCard from "@/components/PostCard";
import AdSlot from "@/components/AdSlot";

const searchSchema = z.object({
  category: z.string().optional(),
  page: z.number().int().min(1).optional(),
});

export const Route = createFileRoute("/blog/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Blog — ThriftBeam" },
      { name: "description", content: "All ThriftBeam articles: budgeting, debt payoff, side hustles, frugal living, credit and insurance." },
      { property: "og:title", content: "ThriftBeam Blog" },
      { property: "og:description", content: "Practical personal finance, no fluff." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

const PER_PAGE = 6;

function BlogPage() {
  const { category, page = 1 } = Route.useSearch();
  const [activeCat, setActiveCat] = useState<string | undefined>(category);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["public", "posts", { category: activeCat, page, per_page: PER_PAGE }],
    queryFn: () =>
      publicPostsApi.list({
        category: activeCat,
        page,
        per_page: PER_PAGE,
      }),
  });

  const paged = data?.posts ?? (isError
    ? (activeCat ? fallbackPosts.filter((p) => p.category === activeCat) : fallbackPosts).slice((page - 1) * PER_PAGE, page * PER_PAGE)
    : []);
  const totalPages = Math.max(1, data?.pages ?? 1);
  const current = Math.min(page, totalPages);

  const popular = (data?.posts && data.posts.length ? data.posts : fallbackPosts).slice(0, 5);
  const allTags = Array.from(new Set((data?.posts && data.posts.length ? data.posts : fallbackPosts).flatMap((p) => p.tags))).slice(0, 14);

  return (
    <div className="container-page py-10 md:py-16">
      <header className="mb-8 md:mb-12">
        <p className="text-sm text-primary font-semibold uppercase tracking-wide">Blog</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold">ThriftBeam Blog</h1>
        <p className="mt-3 text-muted-foreground max-w-2xl">Practical money guides, weekly. Real numbers, no hype.</p>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          <FilterChip active={!activeCat} onClick={() => setActiveCat(undefined)}>All</FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.slug} active={activeCat === c.slug} onClick={() => setActiveCat(c.slug)}>{c.name}</FilterChip>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_300px] gap-10">
        <div>
          {isLoading && !data ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading posts…</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {paged.map((p) => <PostCard key={p.slug} post={p} />)}
            </div>
          )}
          {!isLoading && paged.length === 0 && (
            <p className="text-center text-muted-foreground py-16">No posts in this category yet.</p>
          )}

          {totalPages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  to="/blog"
                  search={{ category: activeCat, page: n }}
                  className={`h-10 min-w-10 px-3 rounded-lg inline-flex items-center justify-center text-sm font-semibold ${
                    n === current ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
                  }`}
                >
                  {n}
                </Link>
              ))}
              {current < totalPages && (
                <Link to="/blog" search={{ category: activeCat, page: current + 1 }} className="h-10 px-4 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
                  Next →
                </Link>
              )}
            </nav>
          )}
        </div>

        <aside className="hidden lg:flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-3">Popular posts</h3>
            <ul className="space-y-3">
              {popular.map((p) => (
                <li key={p.slug}>
                  <Link to="/blog/$slug" params={{ slug: p.slug }} className="flex gap-3 group">
                    <img src={p.image} alt="" loading="lazy" width={72} height={48} className="h-12 w-[72px] rounded-lg object-cover flex-shrink-0" />
                    <div className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">{p.title}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <AdSlot size="square" />
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((t) => (
                <span key={t} className="px-2.5 py-1 text-xs rounded-full bg-muted text-foreground">#{t}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 px-4 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        active ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
