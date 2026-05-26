import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calculator, Users, Star } from "lucide-react";
import { categories, posts, getAuthor } from "@/lib/mockData";
import CategoryCard from "@/components/CategoryCard";
import PostCard from "@/components/PostCard";
import NewsletterSignup from "@/components/NewsletterSignup";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ThriftBeam — Save Smart, Live Rich" },
      { name: "description", content: "Practical personal finance for real people. Budgeting, debt payoff, side hustles, frugal living — explained simply." },
      { property: "og:title", content: "ThriftBeam — Save Smart, Live Rich" },
      { property: "og:description", content: "Practical personal finance for real people." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const featured = posts.filter((p) => p.featured).slice(0, 3);
  const latest = posts.slice(0, 6);
  const featuredAuthors = featured.map((p) => getAuthor(p.authorSlug)).filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section className="hero-mesh relative overflow-hidden">
        <div className="container-page pt-12 md:pt-20 pb-20 md:pb-28 relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/70 backdrop-blur text-xs font-medium border border-border text-foreground">
              <Star className="h-3 w-3 fill-accent text-accent" />
              Independent. Reader-supported. No hype.
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground">
              Save Smart.{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Live Rich.</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl">
              Your trusted guide to budgeting, saving, and building wealth — one smart decision at a time.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/blog"
                className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                Read the Blog <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/tools"
                className="h-12 px-6 rounded-xl bg-background border-2 border-primary text-primary font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
              >
                <Calculator className="h-4 w-4" /> Try Calculators
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {featuredAuthors.map((a) => a && (
                  <img key={a.slug} src={a.avatar} alt="" loading="lazy" width={36} height={36} className="h-9 w-9 rounded-full border-2 border-background object-cover" />
                ))}
              </div>
              <div className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                Trusted by <strong className="text-foreground">10,000+</strong> readers
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-pad bg-surface">
        <div className="container-page">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold">Explore by topic</h2>
            <p className="mt-3 text-muted-foreground">Pick a money problem. We probably have a calm, practical guide for it.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {categories.map((c) => <CategoryCard key={c.slug} category={c} />)}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="section-pad bg-background">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">Featured posts</h2>
              <p className="mt-2 text-muted-foreground">The most-loved guides from our editors this month.</p>
            </div>
            <Link to="/blog" className="hidden sm:inline-flex items-center gap-1 text-primary font-semibold hover:gap-2 transition-all">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {featured.map((p) => <PostCard key={p.slug} post={p} size="large" />)}
          </div>
        </div>
      </section>

      {/* Latest */}
      <section className="section-pad bg-surface">
        <div className="container-page">
          <h2 className="text-3xl md:text-4xl font-bold">Latest articles</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {latest.map((p) => <PostCard key={p.slug} post={p} />)}
          </div>
          <div className="mt-10 text-center">
            <Link to="/blog" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-background border border-border font-semibold hover:border-primary hover:text-primary transition-colors">
              Browse all articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Tools teaser — light */}
      <section className="section-pad bg-background">
        <div className="container-page">
          <div className="rounded-2xl bg-surface border border-border border-l-4 border-l-primary p-6 md:p-10 grid gap-8 md:grid-cols-2 items-center shadow-[var(--shadow-card)]">
            <div>
              <span className="text-primary font-semibold text-sm tracking-wide uppercase">Free Tools</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-foreground">5 Free Calculators to Master Your Money</h2>
              <p className="mt-3 text-muted-foreground">Budget, debt payoff, savings goals, emergency fund, credit card interest — no signup required.</p>
              <Link to="/tools" className="mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                Open the Toolkit <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Budget", "Debt Payoff", "Savings Goal", "Emergency Fund"].map((t) => (
                <div key={t} className="rounded-xl border border-border bg-background p-4">
                  <Calculator className="h-5 w-5 text-primary mb-2" />
                  <div className="font-semibold text-foreground">{t}</div>
                  <div className="text-xs text-muted-foreground">Calculator</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <NewsletterSignup variant="coral" />
    </>
  );
}
