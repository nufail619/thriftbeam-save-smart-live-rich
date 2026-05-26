import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock, Facebook, Twitter, Linkedin, Link2, MessageCircle, Loader2 } from "lucide-react";
import { getAuthor, getCategory, getRelated, formatDate, posts as fallbackPosts, type Post } from "@/lib/mockData";
import { publicPostsApi } from "@/lib/api/publicPosts";
import { commentsApi } from "@/lib/api/comments";
import Breadcrumbs from "@/components/Breadcrumbs";
import PostCard from "@/components/PostCard";
import AdSlot from "@/components/AdSlot";
import NewsletterSignup from "@/components/NewsletterSignup";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Post — ThriftBeam` },
      { property: "og:url", content: `/blog/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
  }),
  notFoundComponent: () => (
    <div className="container-page py-20 text-center">
      <h1 className="text-3xl font-bold">Post not found</h1>
      <Link to="/blog" className="mt-4 inline-block text-primary font-semibold">← Back to blog</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold">Couldn't load this post</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: PostPage,
});

type Heading = { id: string; text: string; level: 2 | 3 };

function extractHeadings(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const replaced = html.replace(/<h([23])>(.*?)<\/h\1>/g, (_, lvl, text) => {
    const id = String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    headings.push({ id, text, level: Number(lvl) as 2 | 3 });
    return `<h${lvl} id="${id}">${text}</h${lvl}>`;
  });
  return { html: replaced, headings };
}

function PostPage() {
  const { slug } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["public", "post", slug],
    queryFn: () => publicPostsApi.bySlug(slug),
    retry: false,
  });

  // Comments
  const commentsQuery = useQuery({
    queryKey: ["public", "comments", slug],
    queryFn: () => commentsApi.approvedFor(slug),
  });
  const comments = commentsQuery.data ?? [];

  const submitMut = useMutation({
    mutationFn: (payload: { name: string; email: string; body: string }) =>
      commentsApi.submit({ post_slug: slug, author: payload.name, email: payload.email, body: payload.body }),
    onSuccess: () => {
      toast.success("Comment submitted for review");
      qc.invalidateQueries({ queryKey: ["public", "comments", slug] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isLoading) {
    return <div className="container-page py-20 flex items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading post…</div>;
  }
  if (isError || !data) {
    // Fallback to mock if backend not yet seeded
    const fallback = fallbackPosts.find((p) => p.slug === slug);
    if (!fallback) {
      return (
        <div className="container-page py-20 text-center">
          <h1 className="text-3xl font-bold">Post not found</h1>
          <p className="mt-2 text-muted-foreground">{(error as Error)?.message}</p>
          <Link to="/blog" className="mt-4 inline-block text-primary font-semibold">← Back to blog</Link>
        </div>
      );
    }
    return <PostBody post={fallback} comments={[]} commentsLoading={false} onSubmit={(p) => submitMut.mutate(p)} submitting={submitMut.isPending} progress={progress} tocOpen={tocOpen} setTocOpen={setTocOpen} />;
  }

  return <PostBody post={data} comments={comments} commentsLoading={commentsQuery.isLoading} onSubmit={(p) => submitMut.mutate(p)} submitting={submitMut.isPending} progress={progress} tocOpen={tocOpen} setTocOpen={setTocOpen} />;
}

function PostBody({
  post,
  comments,
  commentsLoading,
  onSubmit,
  submitting,
  progress,
  tocOpen,
  setTocOpen,
}: {
  post: Post;
  comments: Array<{ id: string; author: string; body: string; date: string }>;
  commentsLoading: boolean;
  onSubmit: (p: { name: string; email: string; body: string }) => void;
  submitting: boolean;
  progress: number;
  tocOpen: boolean;
  setTocOpen: (v: boolean) => void;
}) {
  const author = getAuthor(post.authorSlug);
  const category = getCategory(post.category);
  const related = getRelated(post, 3);
  const { html, headings } = extractHeadings(post.body || "");

  function share(network: string) {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const links: Record<string, string> = {
      facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    if (network === "copy") { navigator.clipboard.writeText(url); toast.success("Link copied"); return; }
    window.open(links[network], "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <style>{`.article-body p { text-align: left; } @media (min-width: 768px) { .article-body p { text-align: justify; hyphens: auto; } }`}</style>
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-transparent">
        <div className="h-full bg-primary transition-[width] duration-100" style={{ width: `${progress}%` }} />
      </div>

      <article className="container-page py-8 md:py-12">
        <Breadcrumbs items={[
          { label: "Home", to: "/" },
          { label: "Blog", to: "/blog" },
          ...(category ? [{ label: category.name }] : []),
          { label: post.title },
        ]} />

        <header className="mt-6 max-w-3xl">
          {category && (
            <Link to="/blog" search={{ category: category.slug }} className="inline-flex px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {category.name}
            </Link>
          )}
          <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight leading-tight">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {author && (
              <div className="flex items-center gap-2">
                <img src={author.avatar} alt="" loading="lazy" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
                <span className="font-medium text-foreground">{author.name}</span>
              </div>
            )}
            <span>·</span>
            <span>{formatDate(post.date)}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readTime} min read</span>
          </div>
          <div className="mt-5 flex gap-2">
            <ShareBtn label="Facebook" onClick={() => share("facebook")}><Facebook className="h-4 w-4" /></ShareBtn>
            <ShareBtn label="Twitter" onClick={() => share("twitter")}><Twitter className="h-4 w-4" /></ShareBtn>
            <ShareBtn label="LinkedIn" onClick={() => share("linkedin")}><Linkedin className="h-4 w-4" /></ShareBtn>
            <ShareBtn label="Copy link" onClick={() => share("copy")}><Link2 className="h-4 w-4" /></ShareBtn>
          </div>
        </header>

        <div className="mt-8 rounded-2xl overflow-hidden border border-border">
          <img src={post.image} alt={post.title} width={1200} height={675} className="w-full aspect-video object-cover" decoding="async" />
        </div>

        <div className="mt-10 grid lg:grid-cols-[1fr_300px] gap-10">
          <div className="min-w-0 prose-container lg:mx-0">
            {headings.length > 0 && (
              <details open={tocOpen} onToggle={(e) => setTocOpen((e.target as HTMLDetailsElement).open)} className="lg:hidden rounded-xl border border-border bg-card mb-6">
                <summary className="px-4 py-3 font-semibold cursor-pointer select-none">Table of contents</summary>
                <ul className="px-4 pb-4 space-y-1.5 text-sm">
                  {headings.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
                      <a href={`#${h.id}`} className="text-muted-foreground hover:text-primary">{h.text}</a>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <div className="prose-tb max-w-none article-body" dangerouslySetInnerHTML={{ __html: html }} />

            <div className="my-10"><AdSlot size="banner" /></div>

            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((t) => (<span key={t} className="px-3 py-1 rounded-full bg-muted text-sm">#{t}</span>))}
            </div>

            {author && (
              <div className="mt-10 rounded-2xl border border-border bg-surface p-6 flex flex-col sm:flex-row gap-4 items-start">
                <img src={author.avatar} alt={author.name} width={64} height={64} className="h-16 w-16 rounded-full object-cover" />
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{author.role}</p>
                  <h3 className="font-bold text-lg">{author.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{author.bio}</p>
                </div>
              </div>
            )}

            <div className="mt-8 rounded-2xl bg-primary/5 border border-primary/20 p-6">
              <h3 className="font-bold text-xl">Like this post? Get more like it.</h3>
              <p className="mt-1 text-sm text-muted-foreground">One actionable money guide every Sunday.</p>
              <div className="mt-4"><NewsletterSignup /></div>
            </div>

            {related.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Related posts</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((p) => <PostCard key={p.slug} post={p} />)}
                </div>
              </section>
            )}

            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6 inline-flex items-center gap-2">
                <MessageCircle className="h-5 w-5" /> Comments ({comments.length})
              </h2>
              {commentsLoading ? (
                <div className="text-sm text-muted-foreground"><Loader2 className="inline mr-2 h-4 w-4 animate-spin" /> Loading comments…</div>
              ) : (
                <ul className="space-y-5">
                  {comments.length === 0 ? (
                    <li className="text-sm text-muted-foreground">Be the first to comment.</li>
                  ) : comments.map((c) => (
                    <li key={c.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between text-sm">
                        <strong>{c.author}</strong>
                        <span className="text-muted-foreground text-xs">{c.date}</span>
                      </div>
                      <p className="mt-2 text-sm">{c.body}</p>
                    </li>
                  ))}
                </ul>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.target as HTMLFormElement;
                  const fd = new FormData(f);
                  const name = String(fd.get("name") ?? "").trim();
                  const email = String(fd.get("email") ?? "").trim();
                  const body = String(fd.get("body") ?? "").trim();
                  if (!name || !email || !body) return;
                  onSubmit({ name, email, body });
                  f.reset();
                }}
                className="mt-6 space-y-3"
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  <input name="name" required placeholder="Your name" className="w-full h-11 px-4 rounded-xl border border-border bg-background outline-none focus:border-primary" />
                  <input name="email" required type="email" placeholder="you@example.com" className="w-full h-11 px-4 rounded-xl border border-border bg-background outline-none focus:border-primary" />
                </div>
                <textarea name="body" required placeholder="Share your thoughts…" rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary resize-y" />
                <button disabled={submitting} className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-60">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Post comment
                </button>
              </form>
            </section>
          </div>

          <aside className="hidden lg:flex flex-col gap-6">
            {headings.length > 0 && (
              <div className="sticky top-20 rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">On this page</h3>
                <ul className="space-y-1.5 text-sm">
                  {headings.map((h) => (
                    <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
                      <a href={`#${h.id}`} className="text-muted-foreground hover:text-primary block py-0.5">{h.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <AdSlot size="skyscraper" />
          </aside>
        </div>
      </article>
    </>
  );
}

function ShareBtn({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={label} className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-border hover:bg-muted hover:border-primary hover:text-primary transition-colors">
      {children}
    </button>
  );
}

function notFoundFn() { throw notFound(); }
void notFoundFn;
