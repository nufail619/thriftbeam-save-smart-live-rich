import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Clock, Facebook, Twitter, Linkedin, Link2, MessageCircle } from "lucide-react";
import { getPost, getAuthor, getCategory, getRelated, formatDate, posts } from "@/lib/mockData";
import Breadcrumbs from "@/components/Breadcrumbs";
import PostCard from "@/components/PostCard";
import AdSlot from "@/components/AdSlot";
import NewsletterSignup from "@/components/NewsletterSignup";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Post — ThriftBeam" }] };
    const cat = getCategory(loaderData.category)?.name;
    return {
      meta: [
        { title: `${loaderData.title} — ThriftBeam` },
        { name: "description", content: loaderData.excerpt },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.excerpt },
        { property: "og:image", content: loaderData.image },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${params.slug}` },
        { property: "article:section", content: cat ?? "" },
        { name: "twitter:image", content: loaderData.image },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: loaderData.title,
            description: loaderData.excerpt,
            image: [loaderData.image],
            datePublished: loaderData.date,
            author: { "@type": "Person", name: getAuthor(loaderData.authorSlug)?.name ?? "ThriftBeam" },
            publisher: { "@type": "Organization", name: "ThriftBeam" },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-20 text-center">
      <h1 className="text-3xl font-bold">Post not found</h1>
      <Link to="/blog" className="mt-4 inline-block text-primary font-semibold">← Back to blog</Link>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold">Couldn't load this post</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="mt-4 h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold">Try again</button>
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

function insertAds(html: string): string {
  const parts = html.split("</p>");
  if (parts.length < 4) return html;
  const ad = `</p><div data-ad="in-article"></div>`;
  parts[1] = parts[1] + ad;
  const mid = Math.floor(parts.length / 2);
  parts[mid] = parts[mid] + ad;
  return parts.join("</p>");
}

function PostPage() {
  const post = Route.useLoaderData();
  const author = getAuthor(post.authorSlug)!;
  const category = getCategory(post.category)!;
  const related = getRelated(post, 3);
  const popular = posts.slice(0, 5);
  const [progress, setProgress] = useState(0);
  const [tocOpen, setTocOpen] = useState(false);

  const { html, headings } = extractHeadings(post.body);
  const finalHtml = insertAds(html);

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

  function share(network: string) {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const links: Record<string, string> = {
      facebook: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };
    if (network === "copy") {
      navigator.clipboard.writeText(url);
      toast.success("Link copied");
      return;
    }
    window.open(links[network], "_blank", "noopener,noreferrer");
  }

  // Render body: split on the ad marker
  const segments = finalHtml.split('<div data-ad="in-article"></div>');

  return (
    <>
      <style>{`
        .article-body p {
          text-align: left;
        }
        @media (min-width: 768px) {
          .article-body p {
            text-align: justify;
            hyphens: auto;
          }
        }
      `}</style>

      {/* Reading progress */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-transparent">
        <div className="h-full bg-primary transition-[width] duration-100" style={{ width: `${progress}%` }} />
      </div>

      <article className="container-page py-8 md:py-12">
        <Breadcrumbs items={[
          { label: "Home", to: "/" },
          { label: "Blog", to: "/blog" },
          { label: category.name },
          { label: post.title },
        ]} />

        <header className="mt-6 max-w-3xl">
          <Link to="/blog" search={{ category: category.slug }} className="inline-flex px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {category.name}
          </Link>
          <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight leading-tight">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <img src={author.avatar} alt="" loading="lazy" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
              <span className="font-medium text-foreground">{author.name}</span>
            </div>
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
            {/* Mobile TOC */}
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

            <div className="prose-tb max-w-none article-body">
              {segments.map((seg, i) => (
                <div key={i}>
                  <div dangerouslySetInnerHTML={{ __html: seg }} />
                  {i < segments.length - 1 && <div className="my-8"><AdSlot size="in-article" /></div>}
                </div>
              ))}
            </div>

            <div className="my-10"><AdSlot size="banner" /></div>

            {/* Tags */}
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((t: string) => (
                <span key={t} className="px-3 py-1 rounded-full bg-muted text-sm">#{t}</span>
              ))}
            </div>

            {/* Author bio */}
            <div className="mt-10 rounded-2xl border border-border bg-surface p-6 flex flex-col sm:flex-row gap-4 items-start">
              <img src={author.avatar} alt={author.name} width={64} height={64} className="h-16 w-16 rounded-full object-cover" />
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{author.role}</p>
                <h3 className="font-bold text-lg">{author.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{author.bio}</p>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-8 rounded-2xl bg-primary/5 border border-primary/20 p-6">
              <h3 className="font-bold text-xl">Like this post? Get more like it.</h3>
              <p className="mt-1 text-sm text-muted-foreground">One actionable money guide every Sunday.</p>
              <div className="mt-4"><NewsletterSignup /></div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Related posts</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((p) => <PostCard key={p.slug} post={p} />)}
                </div>
              </section>
            )}

            {/* Comments */}
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6 inline-flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Comments (3)</h2>
              <ul className="space-y-5">
                {[
                  { name: "Alex P.", date: "2 days ago", body: "This finally made the snowball method click for me. Thanks!" },
                  { name: "Jordan R.", date: "5 days ago", body: "Used your worksheet last weekend — found $94/mo in subscriptions I forgot about." },
                  { name: "Priya S.", date: "1 week ago", body: "Would love a follow-up on irregular income budgeting." },
                ].map((c, i) => (
                  <li key={i} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between text-sm">
                      <strong>{c.name}</strong>
                      <span className="text-muted-foreground text-xs">{c.date}</span>
                    </div>
                    <p className="mt-2 text-sm">{c.body}</p>
                  </li>
                ))}
              </ul>
              <form onSubmit={(e) => { e.preventDefault(); toast.success("Comment submitted for review"); (e.target as HTMLFormElement).reset(); }} className="mt-6 space-y-3">
                <input required placeholder="Your name" className="w-full h-11 px-4 rounded-xl border border-border bg-background outline-none focus:border-primary" />
                <textarea required placeholder="Share your thoughts…" rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary resize-y" />
                <button className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold">Post comment</button>
              </form>
            </section>
          </div>

          {/* Sidebar */}
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
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-semibold mb-3">Popular</h3>
              <ul className="space-y-3">
                {popular.map((p) => (
                  <li key={p.slug}>
                    <Link to="/blog/$slug" params={{ slug: p.slug }} className="text-sm font-medium hover:text-primary line-clamp-2 block">{p.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
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
