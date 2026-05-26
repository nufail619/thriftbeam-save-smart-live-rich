import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { tools } from "@/lib/mockData";
import Breadcrumbs from "@/components/Breadcrumbs";
import AdSlot from "@/components/AdSlot";
import BudgetCalculator from "@/components/calculators/BudgetCalculator";
import DebtPayoffCalculator from "@/components/calculators/DebtPayoffCalculator";
import SavingsGoalCalculator from "@/components/calculators/SavingsGoalCalculator";
import EmergencyFundCalculator from "@/components/calculators/EmergencyFundCalculator";
import CreditCardInterestCalculator from "@/components/calculators/CreditCardInterestCalculator";

const EXPLAIN: Record<string, { howItWorks: string; tip: string }> = {
  "budget-calculator": {
    howItWorks: "The 50/30/20 rule splits your after-tax income into 50% needs, 30% wants, and 20% savings or debt payoff. Compare your real split to the ideal and adjust whichever category is furthest off.",
    tip: "If 'wants' is over 30%, look at subscriptions first — they're usually the easiest to trim without lifestyle pain.",
  },
  "debt-payoff": {
    howItWorks: "We simulate your balance month by month. Each month interest is added (APR ÷ 12), your payment chips away at the rest. Increasing the payment by even $50 often saves thousands in interest.",
    tip: "Two payments per month — half the amount each — quietly accelerate payoff because interest accrues daily.",
  },
  "savings-goal": {
    howItWorks: "Each month your balance grows by your yield (APY ÷ 12) and your monthly contribution. We loop until you hit your target and report the difference between contributions and final balance as interest earned.",
    tip: "A high-yield savings account at 4–5% APY adds up faster than people expect. Don't leave goal money in a 0.01% checking account.",
  },
  "emergency-fund": {
    howItWorks: "Your target fund equals your monthly expenses times the cushion months you choose. We then estimate how many months it takes to fill the gap at your current saving rate.",
    tip: "Start with one month, not six. Hitting smaller milestones keeps motivation up — six months looks reachable from month two.",
  },
  "credit-card-interest": {
    howItWorks: "We simulate two payoff schedules side by side: your current payment and double it. The interest difference is the real cost of slow payments.",
    tip: "If you can't double the payment, even rounding up to the next $25 makes a meaningful dent over 12 months.",
  },
};

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = tools.find((t) => t.slug === params.slug);
    if (!tool) throw notFound();
    return tool;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) return { meta: [{ title: "Calculator — ThriftBeam" }] };
    return {
      meta: [
        { title: `${loaderData.name} — ThriftBeam` },
        { name: "description", content: loaderData.description },
        { property: "og:title", content: loaderData.name },
        { property: "og:description", content: loaderData.description },
        { property: "og:url", content: `/tools/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/tools/${params.slug}` }],
    };
  },
  notFoundComponent: () => (
    <div className="container-page py-20 text-center">
      <h1 className="text-3xl font-bold">Calculator not found</h1>
      <Link to="/tools" className="mt-4 inline-block text-primary font-semibold">← Back to tools</Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="container-page py-20 text-center">
      <h1 className="text-2xl font-bold">Couldn't load this calculator</h1>
      <button onClick={reset} className="mt-4 h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold">Try again</button>
    </div>
  ),
  component: ToolPage,
});

function renderCalc(slug: string) {
  switch (slug) {
    case "budget-calculator": return <BudgetCalculator />;
    case "debt-payoff": return <DebtPayoffCalculator />;
    case "savings-goal": return <SavingsGoalCalculator />;
    case "emergency-fund": return <EmergencyFundCalculator />;
    case "credit-card-interest": return <CreditCardInterestCalculator />;
    default: return null;
  }
}

function ToolPage() {
  const tool = Route.useLoaderData();
  const explain = EXPLAIN[tool.slug];
  const related = tools.filter((t) => t.slug !== tool.slug).slice(0, 4);

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs items={[
        { label: "Home", to: "/" },
        { label: "Tools", to: "/tools" },
        { label: tool.name },
      ]} />

      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-bold">{tool.name}</h1>
        <p className="mt-3 text-muted-foreground">{tool.description}</p>
      </header>

      <div className="my-8"><AdSlot size="banner" /></div>

      {renderCalc(tool.slug)}

      <div className="my-10"><AdSlot size="banner" /></div>

      {explain && (
        <section className="rounded-2xl bg-surface border border-border p-6 md:p-8 max-w-3xl">
          <h2 className="text-2xl font-bold">How this works</h2>
          <p className="mt-3 text-foreground/80 leading-relaxed">{explain.howItWorks}</p>
          <div className="mt-5 rounded-xl bg-primary/10 border border-primary/20 p-4">
            <p className="text-sm font-semibold text-primary mb-1">💡 Quick tip</p>
            <p className="text-sm">{explain.tip}</p>
          </div>
        </section>
      )}

      <section className="mt-14">
        <h2 className="text-2xl font-bold mb-6">Other calculators</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.slug}
                to="/tools/$slug"
                params={{ slug: t.slug }}
                className="group rounded-xl p-5 bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <Icon className="h-5 w-5 text-primary mb-2" />
                <div className="font-semibold">{t.name}</div>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  Open <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
