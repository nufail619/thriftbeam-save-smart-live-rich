// Mock data for the admin panel. Replaced by real API later.

export type AdminPostStatus = "published" | "draft" | "scheduled" | "trash";

export type AdminPost = {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  status: AdminPostStatus;
  views: number;
  date: string; // ISO
  thumbnail: string;
};

export type PendingComment = {
  id: string;
  author: string;
  email: string;
  excerpt: string;
  postTitle: string;
  date: string;
};

export const mockDashboardStats = {
  totalPosts: { value: 47, delta: 12.4 },
  totalViews: { value: 24891, delta: 8.7 },
  subscribers: { value: 10234, delta: 3.2 },
  commentsPending: { value: 12, delta: -4.1 },
};

const seed = (i: number) => {
  // deterministic pseudo-random
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export const mockVisitors30d = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toISOString().slice(5, 10), // MM-DD
    visitors: Math.round(450 + seed(i + 1) * 900 + (i % 7 === 0 ? 250 : 0)),
  };
});

export const mockCategoryViews = [
  { category: "Budgeting", views: 5820 },
  { category: "Debt Payoff", views: 4710 },
  { category: "Side Hustles", views: 3960 },
  { category: "Frugal Living", views: 3210 },
  { category: "Credit", views: 2890 },
  { category: "Insurance", views: 1480 },
];

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=200&h=200&q=70&fm=webp";

export const mockRecentPosts: AdminPost[] = [
  { id: "p1", title: "How I saved $5,000 in 6 months with the 50/30/20 rule", slug: "saved-5000-in-6-months-50-30-20", author: "Sara Okafor", category: "Budgeting", status: "published", views: 4821, date: "2026-05-19", thumbnail: PLACEHOLDER_IMG },
  { id: "p2", title: "Snowball vs Avalanche: which debt method actually works?", slug: "snowball-vs-avalanche", author: "Maya Chen", category: "Debt Payoff", status: "published", views: 3120, date: "2026-05-15", thumbnail: PLACEHOLDER_IMG },
  { id: "p3", title: "7 side hustles that pay $500+ per month", slug: "side-hustles-500-month", author: "James Rivera", category: "Side Hustles", status: "draft", views: 0, date: "2026-05-22", thumbnail: PLACEHOLDER_IMG },
  { id: "p4", title: "Building your first emergency fund — start with $1,000", slug: "first-emergency-fund-1000", author: "Maya Chen", category: "Budgeting", status: "scheduled", views: 0, date: "2026-06-02", thumbnail: PLACEHOLDER_IMG },
  { id: "p5", title: "Credit card interest, explained simply", slug: "credit-card-interest-explained", author: "Sara Okafor", category: "Credit", status: "published", views: 2210, date: "2026-05-10", thumbnail: PLACEHOLDER_IMG },
];

export const mockPendingComments: PendingComment[] = [
  { id: "c1", author: "Jen M.", email: "jen@example.com", excerpt: "This finally made the 50/30/20 rule click for me — thank you!", postTitle: "How I saved $5,000 in 6 months", date: "2026-05-24" },
  { id: "c2", author: "Alex P.", email: "alex@example.com", excerpt: "Curious how this works if your income varies month to month?", postTitle: "Snowball vs Avalanche", date: "2026-05-23" },
  { id: "c3", author: "Tomás R.", email: "tomas@example.com", excerpt: "Great breakdown. Could you add a section on HYSA picks?", postTitle: "Building your first emergency fund", date: "2026-05-22" },
];
