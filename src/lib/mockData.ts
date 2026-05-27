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

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const seedPosts: Array<Omit<Post, "body">> = [
  // Budgeting (5)
  { slug: "saved-5000-in-6-months-50-30-20", title: "How I Saved $5,000 in 6 Months Using the 50/30/20 Rule", excerpt: "A simple budgeting framework that worked when nothing else did — and the small tweaks that made it stick.", category: "budgeting", authorSlug: "sara-okafor", date: daysAgo(3), readTime: 8, image: img("photo-1554224155-6726b3ff858f"), tags: ["50/30/20", "budgeting", "habits"], featured: true },
  { slug: "zero-based-budget-beginners", title: "The Zero-Based Budget: A Beginner's Walkthrough", excerpt: "Give every dollar a job without spending your Sunday on a spreadsheet.", category: "budgeting", authorSlug: "maya-chen", date: daysAgo(12), readTime: 7, image: img("photo-1579621970590-9d624316904b"), tags: ["zero-based", "budgeting"] },
  { slug: "budget-categories-actually-matter", title: "The 7 Budget Categories That Actually Matter", excerpt: "Skip the 40-line spreadsheet. These are the only buckets you need to track.", category: "budgeting", authorSlug: "maya-chen", date: daysAgo(22), readTime: 6, image: img("photo-1518186285589-2f7649de83e0"), tags: ["categories", "simple"] },
  { slug: "budget-couples-conflict-free", title: "How to Budget With a Partner Without Fighting About It", excerpt: "A calm, two-meeting system for couples who don't agree on money — yet.", category: "budgeting", authorSlug: "sara-okafor", date: daysAgo(40), readTime: 9, image: img("photo-1521791136064-7986c2920216"), tags: ["couples", "communication"] },
  { slug: "irregular-income-budget", title: "Budgeting When Your Income Changes Every Month", excerpt: "Freelancers and tipped workers can budget too — here's the pattern.", category: "budgeting", authorSlug: "james-rivera", date: daysAgo(58), readTime: 8, image: img("photo-1556742502-ec7c0e9f34b1"), tags: ["freelance", "variable"] },

  // Debt
  { slug: "debt-snowball-step-by-step", title: "The Debt Snowball Method: Step-by-Step Guide", excerpt: "Pay off your smallest balance first and use the momentum to crush the rest.", category: "debt-payoff", authorSlug: "maya-chen", date: daysAgo(6), readTime: 9, image: img("photo-1454165804606-c3d57bc86b40"), tags: ["snowball", "strategy"], featured: true },
  { slug: "avalanche-vs-snowball", title: "Avalanche vs Snowball: Which Debt Method Wins?", excerpt: "The math says one. Behavior says the other. Here's how to actually choose.", category: "debt-payoff", authorSlug: "james-rivera", date: daysAgo(18), readTime: 7, image: img("photo-1554224154-26032ffc0d07"), tags: ["avalanche", "snowball"] },
  { slug: "negotiate-credit-card-apr", title: "How to Negotiate a Lower APR (Script Included)", excerpt: "A 5-minute phone call has saved our readers an average of $312 a year.", category: "debt-payoff", authorSlug: "maya-chen", date: daysAgo(29), readTime: 5, image: img("photo-1563013544-824ae1b704d3"), tags: ["apr", "negotiation"] },
  { slug: "consolidation-loan-trap", title: "When a Consolidation Loan Helps — and When It's a Trap", excerpt: "Lower payments aren't always lower costs. Run these three checks first.", category: "debt-payoff", authorSlug: "james-rivera", date: daysAgo(44), readTime: 8, image: img("photo-1450101499163-c8848c66ca85"), tags: ["consolidation"] },
  { slug: "student-loan-payoff-plan", title: "Building a Student Loan Payoff Plan You'll Stick To", excerpt: "Federal, private, mixed — a flexible framework for every situation.", category: "debt-payoff", authorSlug: "sara-okafor", date: daysAgo(63), readTime: 10, image: img("photo-1523240795612-9a054b0db644"), tags: ["student-loans"] },

  // Side hustles
  { slug: "side-hustles-that-pay-2025", title: "7 Side Hustles That Actually Pay in 2025", excerpt: "Tested, ranked and reviewed — what's worth your weekends and what isn't.", category: "side-hustles", authorSlug: "james-rivera", date: daysAgo(1), readTime: 11, image: img("photo-1559526324-4b87b5e36e44"), tags: ["income", "2025"], featured: true },
  { slug: "freelance-writing-first-1000", title: "How to Earn Your First $1,000 Freelance Writing", excerpt: "The realistic 60-day plan, including where to actually find clients.", category: "side-hustles", authorSlug: "maya-chen", date: daysAgo(15), readTime: 9, image: img("photo-1455390582262-044cdead277a"), tags: ["freelance", "writing"] },
  { slug: "rideshare-vs-delivery", title: "Rideshare vs Delivery: Which Pays More After Expenses?", excerpt: "We crunched 90 days of data from drivers in five cities.", category: "side-hustles", authorSlug: "james-rivera", date: daysAgo(34), readTime: 7, image: img("photo-1502877338535-766e1452684a"), tags: ["gig"] },

  // Frugal living
  { slug: "grocery-bill-cut-30-percent", title: "Cut Your Grocery Bill 30% Without Coupon Stress", excerpt: "Six habits that actually move the needle on weekly food spending.", category: "frugal-living", authorSlug: "sara-okafor", date: daysAgo(9), readTime: 6, image: img("photo-1542838132-92c53300491e"), tags: ["groceries", "savings"] },
  { slug: "annual-cost-audit", title: "The Annual Cost Audit That Saves Most People $1,200+", excerpt: "Once a year, sit down for 45 minutes and run this checklist.", category: "frugal-living", authorSlug: "maya-chen", date: daysAgo(26), readTime: 7, image: img("photo-1488998427799-e3362cec87c3"), tags: ["audit", "annual"] },

  // Credit & banking
  { slug: "best-cashback-cards-2025", title: "Best Credit Cards for Cashback in 2025", excerpt: "Honest picks ranked by real-world earnings, not marketing fluff.", category: "credit-banking", authorSlug: "james-rivera", date: daysAgo(4), readTime: 12, image: img("photo-1556742502-ec7c0e9f34b1"), tags: ["credit-cards", "cashback"] },

  // Insurance
  { slug: "emergency-fund-how-much", title: "Emergency Fund: How Much You Really Need", excerpt: "The 3-6 month rule is a starting point — here's how to find your actual number.", category: "insurance-tips", authorSlug: "sara-okafor", date: daysAgo(11), readTime: 6, image: img("photo-1579621970563-ebec7560ff3e"), tags: ["emergency-fund"] },
];

export const posts: Post[] = seedPosts.map((p) => ({ ...p, body: bodyTemplate(p.title, p.category) }));

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
export function getAuthor(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}
export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
export function getRelated(post: Post, n = 3): Post[] {
  return posts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, n);
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
