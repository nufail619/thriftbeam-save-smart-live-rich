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
  excerpt: string;
  content: string; // HTML
  tags: string[];
  featuredImage: string;
  seoTitle: string;
  seoDescription: string;
  readingTime: number;
};

export type AdminPageStatus = "published" | "draft";
export type AdminPageTemplate = "default" | "full-width" | "landing" | "legal";

export type AdminPage = {
  id: string;
  title: string;
  slug: string;
  template: AdminPageTemplate;
  status: AdminPageStatus;
  lastEdited: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
};

export type CommentStatus = "pending" | "approved" | "spam" | "trash";

export type AdminComment = {
  id: string;
  author: string;
  email: string;
  body: string;
  postTitle: string;
  postSlug: string;
  date: string;
  status: CommentStatus;
  gravatar: string;
};

// Back-compat for the dashboard route
export type PendingComment = {
  id: string;
  author: string;
  email: string;
  excerpt: string;
  postTitle: string;
  date: string;
};

export type MediaType = "image" | "document";

export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  type: MediaType;
  size: number; // bytes
  width?: number;
  height?: number;
  uploadedAt: string;
  alt: string;
};

// ---------- Phase C types ----------

export type UserRole = "admin" | "editor" | "author" | "subscriber";
export type UserStatus = "active" | "suspended";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  postsCount: number;
  lastLogin: string;
  avatar: string;
};

export type SubscriberStatus = "subscribed" | "unsubscribed" | "bounced";

export type Subscriber = {
  id: string;
  email: string;
  name?: string;
  status: SubscriberStatus;
  source: string;
  subscribedAt: string;
};

export type CampaignStatus = "draft" | "scheduled" | "sent";

export type NewsletterCampaign = {
  id: string;
  subject: string;
  status: CampaignStatus;
  sentAt: string | null;
  recipients: number;
  openRate: number;
  clickRate: number;
  body: string;
};

export type Integration = {
  id: string;
  name: string;
  category: string;
  description: string;
  connected: boolean;
  apiKey?: string;
  lastSync?: string;
};

export type CookieCategory = {
  id: string;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
};

export type Notification = {
  id: string;
  type: "system" | "comment" | "user" | "post";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type Redirect = {
  id: string;
  from: string;
  to: string;
  code: 301 | 302;
  hits: number;
};

export type BackupSnapshot = {
  id: string;
  createdAt: string;
  size: number;
  type: "auto" | "manual";
  status: "complete" | "failed" | "in_progress";
};

export type SiteSettings = {
  general: {
    siteTitle: string;
    tagline: string;
    adminEmail: string;
    timezone: string;
    dateFormat: string;
    language: string;
  };
  reading: {
    postsPerPage: number;
    homepageDisplay: "latest" | "page";
    homepagePageId: string;
    excerptLength: number;
  };
  writing: {
    defaultCategory: string;
    defaultFormat: string;
    markdown: boolean;
  };
  discussion: {
    allowComments: boolean;
    requireApproval: boolean;
    closeAfterDays: number;
    blacklist: string;
  };
  permalinks: {
    structure: string;
  };
  seo: {
    titleTemplate: string;
    metaDescription: string;
    ogImage: string;
    twitterHandle: string;
    orgName: string;
    orgUrl: string;
    robotsTxt: string;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    fontFamily: string;
    radius: number;
    mode: "light" | "dark";
    logo: string;
    favicon: string;
  };
  maintenance: {
    enabled: boolean;
    title: string;
    message: string;
    retryAfter: number;
    allowedIps: string;
    scheduledEnd: string;
  };
  pwa: {
    name: string;
    shortName: string;
    description: string;
    themeColor: string;
    backgroundColor: string;
    display: "standalone" | "fullscreen" | "minimal-ui" | "browser";
    icon: string;
    serviceWorker: boolean;
    cacheStrategy: "networkFirst" | "cacheFirst" | "staleWhileRevalidate";
    pushSubscribers: number;
  };
  cache: {
    pageCache: boolean;
    browserCache: boolean;
    objectCache: boolean;
    minify: boolean;
    lazyLoad: boolean;
    size: string;
    hitRate: number;
    cachedPages: number;
    lastCleared: string;
  };
  backup: {
    frequency: "off" | "daily" | "weekly";
    retention: number;
    destination: "local" | "s3" | "dropbox";
  };
};

export const mockDashboardStats = {
  totalPosts: { value: 47, delta: 12.4 },
  totalViews: { value: 24891, delta: 8.7 },
  subscribers: { value: 10234, delta: 3.2 },
  commentsPending: { value: 12, delta: -4.1 },
};

const seed = (i: number) => {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export const mockVisitors30d = Array.from({ length: 30 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toISOString().slice(5, 10),
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

const IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=70&fm=webp`;
const THUMB = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=200&h=200&q=70&fm=webp`;

const IMG_IDS = [
  "1554224155-6726b3ff858f",
  "1579621970563-ebec7560ff3e",
  "1607863680198-23d4b2565df0",
  "1556742049-0cfed4f6a45d",
  "1593672715438-d88a70629abe",
  "1518458028785-8fbcd101ebb9",
  "1565514020179-026b92b84bb6",
  "1554224154-22dec7ec8818",
  "1611974789855-9c2a0a7236a3",
  "1633158829585-23ba8f7c8caf",
];

export const CATEGORIES = [
  "Budgeting",
  "Debt Payoff",
  "Side Hustles",
  "Frugal Living",
  "Credit",
  "Insurance",
];

export const AUTHORS = ["Sara Okafor", "Maya Chen", "James Rivera", "Priya Shah"];

const SEED_TITLES = [
  "How I saved $5,000 in 6 months with the 50/30/20 rule",
  "Snowball vs Avalanche: which debt method actually works?",
  "7 side hustles that pay $500+ per month",
  "Building your first emergency fund — start with $1,000",
  "Credit card interest, explained simply",
  "The grocery budget that actually feeds a family of four",
  "Why your APR matters more than your minimum payment",
  "I tracked every dollar for a year. Here's what changed",
  "Term vs whole life insurance: a clear comparison",
  "Renting vs buying in 2026: run the math first",
  "5 frugal habits that don't feel like deprivation",
  "How to negotiate any bill in under 10 minutes",
  "Roth IRA vs Traditional IRA: the simple decision tree",
  "Stop overpaying for streaming — the audit checklist",
  "Build a side hustle in 30 days with $0 upfront",
  "The cash envelope system, modernized for 2026",
  "What your credit score actually rewards",
  "When zero-interest credit cards are a trap",
  "How to spring-clean your subscriptions",
  "Sinking funds: the calmest way to budget",
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function richContent(title: string, excerpt: string): string {
  return `
<p>${excerpt}</p>
<h2>Why this matters</h2>
<p>Personal finance isn't about being perfect — it's about building small habits that compound over time. In this post we'll walk through a simple framework you can apply this week.</p>
<h3>The three steps</h3>
<ul><li>Audit your current spending</li><li>Set a single measurable goal</li><li>Automate one decision so you don't have to repeat it</li></ul>
<blockquote>The best budget is the one you'll actually stick to.</blockquote>
<p>Below we break each step down with real numbers.</p>
<h3>What to do next</h3>
<ol><li>Open your last 30 days of transactions</li><li>Tag each one against your goal</li><li>Pick one category to optimize</li></ol>
<p>Keep going. Small steps, compounded weekly, become the financial life you want.</p>
`.trim();
}

function makePost(i: number): AdminPost {
  const title = SEED_TITLES[i % SEED_TITLES.length] + (i >= SEED_TITLES.length ? ` — part ${Math.floor(i / SEED_TITLES.length) + 1}` : "");
  const status: AdminPostStatus =
    i % 9 === 0 ? "scheduled" : i % 7 === 0 ? "draft" : i % 23 === 0 ? "trash" : "published";
  const date = new Date();
  date.setDate(date.getDate() - i * 3);
  const author = AUTHORS[i % AUTHORS.length];
  const category = CATEGORIES[i % CATEGORIES.length];
  const thumb = IMG_IDS[i % IMG_IDS.length];
  const excerpt = `A practical, no-fluff guide that helps you ${["save", "earn", "budget", "plan"][i % 4]} smarter starting this week.`;
  return {
    id: `p${i + 1}`,
    title,
    slug: slugify(title),
    author,
    category,
    status,
    views: status === "published" ? Math.round(500 + seed(i + 11) * 5200) : 0,
    date: date.toISOString().slice(0, 10),
    thumbnail: THUMB(thumb),
    excerpt,
    content: richContent(title, excerpt),
    tags: [category.toLowerCase(), "guide", i % 2 === 0 ? "beginner" : "advanced"],
    featuredImage: IMG(thumb),
    seoTitle: title.length > 60 ? title.slice(0, 57) + "…" : title,
    seoDescription: excerpt.slice(0, 155),
    readingTime: 4 + (i % 6),
  };
}

export const mockPosts: AdminPost[] = Array.from({ length: 47 }, (_, i) => makePost(i));
export const mockRecentPosts: AdminPost[] = mockPosts.slice(0, 5);

export const mockPages: AdminPage[] = [
  { id: "pg1", title: "About", slug: "about", template: "default", status: "published", lastEdited: "2026-05-22", content: "<h1>About ThriftBeam</h1><p>We help everyday people make better money decisions.</p>", seoTitle: "About — ThriftBeam", seoDescription: "Our mission, team, and values." },
  { id: "pg2", title: "Contact", slug: "contact", template: "default", status: "published", lastEdited: "2026-05-20", content: "<h1>Contact</h1><p>Get in touch with the team.</p>", seoTitle: "Contact us", seoDescription: "Reach the ThriftBeam team." },
  { id: "pg3", title: "Privacy Policy", slug: "privacy", template: "legal", status: "published", lastEdited: "2026-04-12", content: "<h1>Privacy Policy</h1><p>How we handle your data.</p>", seoTitle: "Privacy Policy", seoDescription: "Privacy policy for ThriftBeam." },
  { id: "pg4", title: "Disclaimer", slug: "disclaimer", template: "legal", status: "published", lastEdited: "2026-04-12", content: "<h1>Disclaimer</h1><p>Editorial disclaimer.</p>", seoTitle: "Disclaimer", seoDescription: "Editorial disclaimer." },
  { id: "pg5", title: "Terms of Service", slug: "terms", template: "legal", status: "draft", lastEdited: "2026-05-01", content: "<h1>Terms</h1><p>Terms of use.</p>", seoTitle: "Terms of Service", seoDescription: "Terms of use." },
  { id: "pg6", title: "Affiliate Disclosure", slug: "affiliate-disclosure", template: "legal", status: "published", lastEdited: "2026-03-18", content: "<h1>Affiliate Disclosure</h1><p>How we earn.</p>", seoTitle: "Affiliate Disclosure", seoDescription: "Affiliate relationships." },
  { id: "pg7", title: "Press", slug: "press", template: "default", status: "draft", lastEdited: "2026-05-09", content: "<h1>Press</h1><p>Media kit and inquiries.</p>", seoTitle: "Press", seoDescription: "Media kit." },
  { id: "pg8", title: "Careers", slug: "careers", template: "landing", status: "draft", lastEdited: "2026-05-25", content: "<h1>Careers</h1><p>Open roles.</p>", seoTitle: "Careers", seoDescription: "Join the team." },
];

const COMMENT_BODIES = [
  "This finally made the 50/30/20 rule click for me — thank you!",
  "Curious how this works if your income varies month to month?",
  "Great breakdown. Could you add a section on HYSA picks?",
  "I tried this for 30 days and saved $312. Wild.",
  "Slightly disagree on point 3 — happy to share why.",
  "Bookmarked. Sending to my partner tonight.",
  "Could you cover this for self-employed people next?",
  "More posts like this please. Honest and practical.",
  "Crypto scam buy now click here",
  "Cheap insurance click my profile",
];

export const mockComments: AdminComment[] = Array.from({ length: 25 }, (_, i) => {
  const post = mockPosts[i % mockPosts.length];
  const isSpam = i % 9 === 0;
  const status: CommentStatus = isSpam
    ? "spam"
    : i % 7 === 0
    ? "trash"
    : i % 3 === 0
    ? "pending"
    : "approved";
  const d = new Date();
  d.setDate(d.getDate() - i);
  const author = ["Jen M.", "Alex P.", "Tomás R.", "Priya N.", "Sam W.", "Riley K."][i % 6];
  return {
    id: `c${i + 1}`,
    author,
    email: `${author.split(" ")[0].toLowerCase()}@example.com`,
    body: COMMENT_BODIES[i % COMMENT_BODIES.length],
    postTitle: post.title,
    postSlug: post.slug,
    date: d.toISOString().slice(0, 10),
    status,
    gravatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author)}`,
  };
});

export const mockPendingComments: PendingComment[] = mockComments
  .filter((c) => c.status === "pending")
  .slice(0, 3)
  .map((c) => ({
    id: c.id,
    author: c.author,
    email: c.email,
    excerpt: c.body,
    postTitle: c.postTitle,
    date: c.date,
  }));

export const mockMedia: MediaItem[] = Array.from({ length: 30 }, (_, i) => {
  const id = IMG_IDS[i % IMG_IDS.length];
  const isDoc = i % 11 === 0;
  const d = new Date();
  d.setDate(d.getDate() - i * 2);
  return {
    id: `m${i + 1}`,
    url: isDoc ? "" : IMG(id),
    filename: isDoc
      ? `report-${2026 - (i % 3)}-q${(i % 4) + 1}.pdf`
      : `photo-${String(i + 1).padStart(3, "0")}.jpg`,
    type: isDoc ? "document" : "image",
    size: Math.round(80_000 + seed(i + 31) * 2_400_000),
    width: isDoc ? undefined : 1200,
    height: isDoc ? undefined : 800,
    uploadedAt: d.toISOString().slice(0, 10),
    alt: isDoc ? "" : `Personal finance illustration ${i + 1}`,
  };
});

// ---------- Phase C seeds ----------

const USER_NAMES = [
  "Sara Okafor", "Maya Chen", "James Rivera", "Priya Shah", "Liam Park",
  "Noa Bensoussan", "Diego Alvarez", "Ines Costa", "Theo Walsh", "Aisha Khan",
  "Marco Bianchi", "Hannah Brooks",
];

export const mockUsers: AdminUser[] = USER_NAMES.map((name, i) => {
  const role: UserRole = i < 2 ? "admin" : i < 5 ? "editor" : i < 9 ? "author" : "subscriber";
  const d = new Date();
  d.setDate(d.getDate() - i * 2);
  return {
    id: `u${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]/g, ".")}@thriftbeam.com`,
    role,
    status: i === 11 ? "suspended" : "active",
    postsCount: role === "subscriber" ? 0 : Math.round(seed(i + 50) * 25),
    lastLogin: d.toISOString().slice(0, 10),
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
  };
});

const SUB_SOURCES = ["footer-form", "popup", "blog-cta", "import", "checkout"];
export const mockSubscribers: Subscriber[] = Array.from({ length: 80 }, (_, i) => {
  const status: SubscriberStatus = i % 17 === 0 ? "bounced" : i % 11 === 0 ? "unsubscribed" : "subscribed";
  const d = new Date();
  d.setDate(d.getDate() - i);
  return {
    id: `s${i + 1}`,
    email: `subscriber${i + 1}@example.com`,
    name: i % 3 === 0 ? undefined : `Subscriber ${i + 1}`,
    status,
    source: SUB_SOURCES[i % SUB_SOURCES.length],
    subscribedAt: d.toISOString().slice(0, 10),
  };
});

export const mockCampaigns: NewsletterCampaign[] = [
  { id: "nc1", subject: "Weekly Money Wins — May 18", status: "sent", sentAt: "2026-05-18", recipients: 9821, openRate: 41.2, clickRate: 6.4, body: "<p>This week's top reads…</p>" },
  { id: "nc2", subject: "How to crush your debt in Q3", status: "sent", sentAt: "2026-05-11", recipients: 9712, openRate: 38.9, clickRate: 5.8, body: "<p>A 3-step plan…</p>" },
  { id: "nc3", subject: "Frugal habits that actually stick", status: "sent", sentAt: "2026-05-04", recipients: 9658, openRate: 43.7, clickRate: 7.1, body: "<p>Small habits…</p>" },
  { id: "nc4", subject: "May rate update — what changed", status: "scheduled", sentAt: "2026-05-29", recipients: 10010, openRate: 0, clickRate: 0, body: "<p>Rate brief…</p>" },
  { id: "nc5", subject: "New side hustle ideas", status: "draft", sentAt: null, recipients: 0, openRate: 0, clickRate: 0, body: "<p>Draft body…</p>" },
  { id: "nc6", subject: "Reader Q&A: emergency funds", status: "draft", sentAt: null, recipients: 0, openRate: 0, clickRate: 0, body: "<p>Draft…</p>" },
];

export const mockIntegrations: Integration[] = [
  { id: "ga", name: "Google Analytics", category: "Analytics", description: "Track visitors, events, and conversions.", connected: true, apiKey: "G-XXXXXXX", lastSync: "2026-05-25" },
  { id: "gsc", name: "Search Console", category: "SEO", description: "Monitor search performance and indexing.", connected: true, lastSync: "2026-05-24" },
  { id: "mc", name: "Mailchimp", category: "Email", description: "Sync subscribers and send campaigns.", connected: false },
  { id: "sg", name: "Sendgrid", category: "Email", description: "Transactional email delivery.", connected: false },
  { id: "stripe", name: "Stripe", category: "Payments", description: "Accept payments and subscriptions.", connected: false },
  { id: "cf", name: "Cloudflare", category: "CDN", description: "Edge caching and DDoS protection.", connected: true, lastSync: "2026-05-26" },
  { id: "algolia", name: "Algolia", category: "Search", description: "Instant search across your content.", connected: false },
  { id: "disqus", name: "Disqus", category: "Comments", description: "Drop-in comment system.", connected: false },
];

export const mockCookieCategories: CookieCategory[] = [
  { id: "necessary", name: "Strictly necessary", description: "Required for the site to function.", required: true, enabled: true },
  { id: "analytics", name: "Analytics", description: "Anonymous usage statistics.", required: false, enabled: true },
  { id: "marketing", name: "Marketing", description: "Personalized ads and retargeting.", required: false, enabled: false },
  { id: "preferences", name: "Preferences", description: "Remember your settings and choices.", required: false, enabled: true },
];

const NOTIF_SEEDS: Omit<Notification, "id" | "createdAt">[] = [
  { type: "comment", title: "New pending comment", body: "Jen M. commented on \"How I saved $5,000…\"", read: false },
  { type: "user", title: "New subscriber", body: "subscriber97@example.com joined the newsletter.", read: false },
  { type: "system", title: "Backup complete", body: "Daily snapshot saved (42 MB).", read: false },
  { type: "post", title: "Post scheduled", body: "\"May rate update\" is scheduled for 2026-05-29.", read: true },
  { type: "comment", title: "Comment flagged as spam", body: "Auto-moderation marked 1 comment.", read: true },
  { type: "system", title: "Cache cleared", body: "Object cache cleared by admin.", read: true },
  { type: "user", title: "New admin login", body: "admin@thriftbeam.com signed in.", read: true },
  { type: "post", title: "Draft autosaved", body: "\"Roth IRA vs Traditional\" autosaved.", read: true },
  { type: "system", title: "Integration synced", body: "Google Analytics last sync 5 min ago.", read: true },
  { type: "comment", title: "5 comments approved", body: "Bulk approval completed.", read: true },
  { type: "post", title: "Post published", body: "\"Sinking funds\" went live.", read: true },
  { type: "system", title: "Maintenance scheduled", body: "Window: 2026-06-01 02:00–03:00 UTC.", read: true },
  { type: "user", title: "Role changed", body: "Maya Chen promoted to Editor.", read: true },
  { type: "system", title: "SSL renewed", body: "Certificate renewed for 90 days.", read: true },
  { type: "comment", title: "New pending comment", body: "Alex P. left a comment.", read: true },
];

export const mockNotifications: Notification[] = NOTIF_SEEDS.map((n, i) => {
  const d = new Date();
  d.setHours(d.getHours() - i * 5);
  return { ...n, id: `n${i + 1}`, createdAt: d.toISOString() };
});

export const mockRedirects: Redirect[] = [
  { id: "r1", from: "/old-blog/intro", to: "/blog/welcome", code: 301, hits: 142 },
  { id: "r2", from: "/2024-guide", to: "/blog/2026-budget-guide", code: 301, hits: 87 },
  { id: "r3", from: "/legal", to: "/privacy", code: 302, hits: 24 },
];

export const mockBackups: BackupSnapshot[] = [
  { id: "b1", createdAt: "2026-05-26", size: 44_120_000, type: "auto", status: "complete" },
  { id: "b2", createdAt: "2026-05-25", size: 43_820_000, type: "auto", status: "complete" },
  { id: "b3", createdAt: "2026-05-24", size: 43_510_000, type: "auto", status: "complete" },
  { id: "b4", createdAt: "2026-05-23", size: 45_010_000, type: "manual", status: "complete" },
  { id: "b5", createdAt: "2026-05-22", size: 42_900_000, type: "auto", status: "complete" },
];

export const defaultSettings: SiteSettings = {
  general: {
    siteTitle: "ThriftBeam",
    tagline: "Smarter money, every week.",
    adminEmail: "admin@thriftbeam.com",
    timezone: "UTC",
    dateFormat: "YYYY-MM-DD",
    language: "en-US",
  },
  reading: {
    postsPerPage: 12,
    homepageDisplay: "latest",
    homepagePageId: "pg1",
    excerptLength: 160,
  },
  writing: {
    defaultCategory: "Budgeting",
    defaultFormat: "standard",
    markdown: true,
  },
  discussion: {
    allowComments: true,
    requireApproval: true,
    closeAfterDays: 90,
    blacklist: "viagra\ncasino\nclick here",
  },
  permalinks: {
    structure: "/blog/%postname%",
  },
  seo: {
    titleTemplate: "%title% — ThriftBeam",
    metaDescription: "Practical personal finance guides for everyday people.",
    ogImage: "",
    twitterHandle: "@thriftbeam",
    orgName: "ThriftBeam",
    orgUrl: "https://thriftbeam.com",
    robotsTxt: "User-agent: *\nAllow: /\n\nSitemap: /sitemap.xml",
  },
  theme: {
    primaryColor: "#2563EB",
    accentColor: "#F97066",
    fontFamily: "Inter",
    radius: 12,
    mode: "light",
    logo: "",
    favicon: "",
  },
  maintenance: {
    enabled: false,
    title: "We'll be right back",
    message: "<p>ThriftBeam is undergoing scheduled maintenance.</p>",
    retryAfter: 3600,
    allowedIps: "",
    scheduledEnd: "",
  },
  pwa: {
    name: "ThriftBeam",
    shortName: "Thrift",
    description: "Smarter money, every week.",
    themeColor: "#2563EB",
    backgroundColor: "#FFFFFF",
    display: "standalone",
    icon: "",
    serviceWorker: false,
    cacheStrategy: "networkFirst",
    pushSubscribers: 1248,
  },
  cache: {
    pageCache: true,
    browserCache: true,
    objectCache: false,
    minify: true,
    lazyLoad: true,
    size: "128 MB",
    hitRate: 92.4,
    cachedPages: 412,
    lastCleared: "2026-05-20",
  },
  backup: {
    frequency: "daily",
    retention: 14,
    destination: "s3",
  },
};
