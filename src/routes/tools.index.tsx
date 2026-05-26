import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { tools } from "@/lib/mockData";
import Breadcrumbs from "@/components/Breadcrumbs";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    meta: [
      { title: "Free Financial Calculators — ThriftBeam" },
      { name: "description", content: "Free budget, debt payoff, savings goal, emergency fund, and credit card interest calculators. No signup." },
      { property: "og:title", content: "Free Financial Calculators — ThriftBeam" },
      { property: "og:description", content: "Five free, no-signup calculators to master your money." },
      { property: "og:url", content: "/tools" },
    ],
    links: [{ rel: "canonical", href: "/tools" }],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <div className="container-page py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Tools" }]} />
      <header className="mt-6 max-w-2xl">
        <p className="text-sm text-primary font-semibold uppercase tracking-wide">Toolkit</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-bold">Free Financial Calculators</h1>
        <p className="mt-3 text-muted-foreground">
          Five interactive calculators to plan your budget, tackle debt, and grow your savings. Everything runs in your browser — nothing leaves your device.
        </p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.slug}
              to="/tools/$slug"
              params={{ slug: t.slug }}
              className="group rounded-2xl p-6 bg-card border border-border hover:border-primary/50 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">{t.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Open Calculator <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
