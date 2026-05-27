import {
  Wallet,
  TrendingDown,
  Briefcase,
  Leaf,
  CreditCard,
  Shield,
  Calculator,
  PiggyBank,
  Target,
  LifeBuoy,
  Percent,
  type LucideIcon,
} from "lucide-react";

export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string; // tailwind utility color hint
};

export const categories: Category[] = [
  { slug: "budgeting", name: "Budgeting", description: "Plan every dollar with confidence.", icon: Wallet, color: "indigo" },
  { slug: "debt-payoff", name: "Debt Payoff", description: "Crush debt with proven systems.", icon: TrendingDown, color: "coral" },
  { slug: "side-hustles", name: "Side Hustles", description: "Real ways to earn extra income.", icon: Briefcase, color: "indigo" },
  { slug: "frugal-living", name: "Frugal Living", description: "Live well for less, every day.", icon: Leaf, color: "green" },
  { slug: "credit-banking", name: "Credit & Banking", description: "Master cards, scores and accounts.", icon: CreditCard, color: "indigo" },
  { slug: "insurance-tips", name: "Insurance Tips", description: "Protect what matters, pay less.", icon: Shield, color: "coral" },
];

export type Author = {
  slug: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
};

export const authors: Author[] = [
  {
    slug: "maya-chen",
    name: "Maya Chen",
    role: "Senior Editor",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=70&fm=webp",
    bio: "Personal finance writer for 8 years. Paid off $42K of debt before age 28.",
  },
  {
    slug: "james-rivera",
    name: "James Rivera",
    role: "Investing Lead",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=70&fm=webp",
    bio: "Former financial advisor turned writer. Loves index funds and clear explanations.",
  },
  {
    slug: "sara-okafor",
    name: "Sara Okafor",
    role: "Frugal Living Editor",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200&q=70&fm=webp",
    bio: "Saved $5K in six months while raising two kids. Believes small habits beat big budgets.",
  },
];

export type Tool = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
};

export const tools: Tool[] = [
  { slug: "budget-calculator", name: "Budget Calculator", description: "Apply the 50/30/20 rule to your income in seconds.", icon: Calculator },
  { slug: "debt-payoff", name: "Debt Payoff Calculator", description: "See exactly when you'll be debt-free.", icon: TrendingDown },
  { slug: "savings-goal", name: "Savings Goal Calculator", description: "Plan the path to any savings target.", icon: PiggyBank },
  { slug: "emergency-fund", name: "Emergency Fund Calculator", description: "Find your safety-net number.", icon: LifeBuoy },
  { slug: "credit-card-interest", name: "Credit Card Interest Calculator", description: "Discover the real cost of minimum payments.", icon: Percent },
];

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string; // category slug
  authorSlug: string;
  date: string; // ISO
  readTime: number; // minutes
  image: string;
  tags: string[];
  body: string; // markdown-ish, we'll render as HTML below
  featured?: boolean;
};

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&h=675&q=70&fm=webp`;

function bodyTemplate(title: string, category: string): string {
  return `<p>Money decisions feel huge in the moment, but the truth is that progress comes from a handful of small habits repeated for months. In this guide on <strong>${title.toLowerCase()}</strong>, we'll walk through a calm, practical approach you can start using this week — no spreadsheets-of-doom, no shame, just steps that work.</p>

<h2>Why this matters right now</h2>
<p>Whether you're getting your first paycheck or rebuilding after a rough year, the principles behind ${category.replace("-", " ")} don't really change. What changes is the noise around them. Our job is to cut that noise down so you can see your real options.</p>

<blockquote>"The best financial plan is the one you'll actually follow for the next twelve months."</blockquote>

<h2>The three-step framework</h2>
<p>We use a simple three-step pattern across almost every ThriftBeam guide:</p>
<ol>
<li><strong>See clearly</strong> — look at the numbers as they are today, not as you wish they were.</li>
<li><strong>Pick one lever</strong> — choose the single biggest thing that moves your outcome.</li>
<li><strong>Automate the boring part</strong> — set it up once so willpower isn't the bottleneck.</li>
</ol>

<h3>Step 1: See clearly</h3>
<p>Pull up your last 30 days of transactions. Don't categorize anything yet — just notice patterns. Most readers find a "leak" worth at least $80 a month within ten minutes of looking. That alone is nearly a thousand dollars a year.</p>

<h3>Step 2: Pick one lever</h3>
<p>You don't have to optimize everything. Identifying the one habit, subscription, or category that's actually moving the needle is more valuable than rebuilding your whole budget. We'll cover how to spot it in the section below.</p>

<h3>Step 3: Automate</h3>
<p>Once you know the lever, automate it. Schedule the transfer, cancel the subscription, switch the card. Future-you should not have to make the decision again next week.</p>

<h2>Common mistakes to avoid</h2>
<ul>
<li>Trying to fix every category at once.</li>
<li>Comparing your week one to someone else's year five.</li>
<li>Using a tool that's more complicated than your situation.</li>
<li>Forgetting that small, boring changes compound.</li>
</ul>

<h2>What to do next</h2>
<p>Open the matching ThriftBeam calculator linked at the top of this article, plug in your real numbers, and write down a single action you'll take this week. That's it. Come back in 30 days and run the numbers again — the difference is usually surprising.</p>

<p>If this guide helped, share it with one person who's working on the same goal. That tiny step is what keeps independent finance writing alive.</p>`;
}

// Fixed epoch so server and client render identical dates (no hydration mismatch).
const FALLBACK_EPOCH = Date.UTC(2026, 4, 27); // 2026-05-27
function daysAgo(n: number): string {
  return new Date(FALLBACK_EPOCH - n * 86400000).toISOString();
}

export function getAuthor(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}
export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
export function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);
}
