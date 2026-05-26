import { createFileRoute } from "@tanstack/react-router";
import { Eye, Compass, Heart } from "lucide-react";
import { authors } from "@/lib/mockData";
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
  return (
    <>
      <section className="container-page py-12 md:py-20">
        <p className="text-sm text-primary font-semibold uppercase tracking-wide">About</p>
        <h1 className="mt-2 text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
          Our mission: make smart money decisions feel simple.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
          ThriftBeam exists because most personal finance content is either too basic to be useful or too technical to actually try. We aim for the middle: calm, specific, and useful within an afternoon.
        </p>
      </section>

      <section className="bg-surface section-pad">
        <div className="container-page grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-bold">Our story</h2>
            <p className="mt-4 text-muted-foreground">
              ThriftBeam started as a shared Google Doc between three friends comparing notes on debt payoff strategies. The doc kept getting forwarded — to roommates, then siblings, then strangers. Two years later, it's a small team publishing weekly to more than 10,000 subscribers who care more about getting it right than getting it fast.
            </p>
            <p className="mt-4 text-muted-foreground">
              We don't sell courses. We don't run a hedge fund. We write what we wish we'd read when we were starting out — and we keep editing until it's actually useful.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-card border border-border">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=70&fm=webp"
              alt="ThriftBeam team working together"
              loading="lazy"
              decoding="async"
              width={900}
              height={675}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container-page section-pad">
        <h2 className="text-3xl font-bold text-center">What we stand for</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl p-6 bg-card border border-border">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center mb-4">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface section-pad">
        <div className="container-page">
          <h2 className="text-3xl font-bold text-center">Meet the team</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {authors.map((a) => (
              <div key={a.slug} className="rounded-2xl p-6 bg-card border border-border text-center">
                <img src={a.avatar} alt={a.name} loading="lazy" width={96} height={96} className="h-24 w-24 rounded-full object-cover mx-auto" />
                <h3 className="mt-4 font-bold text-lg">{a.name}</h3>
                <p className="text-sm text-primary font-medium">{a.role}</p>
                <p className="mt-2 text-sm text-muted-foreground">{a.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewsletterSignup variant="coral" />
    </>
  );
}
