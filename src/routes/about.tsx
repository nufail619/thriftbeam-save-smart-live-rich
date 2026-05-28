import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye, Compass, Heart, Loader2 } from "lucide-react";
import { publicPagesApi } from "@/lib/api/publicPages";
import NewsletterSignup from "@/components/NewsletterSignup";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ThriftBeam" },
      { name: "description", content: "ThriftBeam is independent, ad-supported personal finance for real people. Here's who we are and what we stand for." },
      { property: "og:title", content: "About ThriftBeam" },
      { property: "og:description", content: "Our mission, values, and the people behind the writing." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const VALUES = [
  { icon: Eye, title: "Transparency", body: "We disclose every affiliate relationship and how we make money. No paid placements dressed as advice." },
  { icon: Compass, title: "Practicality", body: "Every guide ends with a concrete next step you can take this week — not a 40-page plan." },
  { icon: Heart, title: "Community", body: "Reader emails shape what we publish next. The best ideas come from your actual money questions." },
];

function AboutPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["page", "about"],
    queryFn: () => publicPagesApi.bySlug("about"),
    staleTime: 60_000,
  });

  return (
    <>
      <section className="container-page py-12 md:py-20">
        <p className="text-sm text-primary font-semibold uppercase tracking-wide">About</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold tracking-tight">
          {data?.title || "About ThriftBeam"}
        </h1>

        <div className="mt-8 max-w-3xl">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : (
            <div
              className="prose prose-neutral dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: data?.content ?? "" }}
            />
          )}
        </div>
      </section>

      <section className="container-page py-12 md:py-16 border-t border-border">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">What we stand for</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl bg-card border border-border p-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-bold text-lg">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-12 md:py-16 border-t border-border">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Stay in the loop</h2>
          <p className="mt-3 text-muted-foreground">
            One weekly email. Practical money tips, no spam.
          </p>
          <div className="mt-6">
            <NewsletterSignup />
          </div>
        </div>
      </section>
    </>
  );
}
