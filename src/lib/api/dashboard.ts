import { api } from "@/lib/api";

export type DashboardStats = {
  total_posts?: number;
  total_views?: number;
  total_subscribers?: number;
  pending_comments?: number;
  total_users?: number;
  unread_messages?: number;
};

export type DashboardData = {
  stats?: DashboardStats;
  visitors_30d?: { date: string; count: number }[];
  top_categories?: { name: string; views: number }[];
  recent_posts?: unknown[];
  pending_comments?: unknown[];
};

function normalize(raw: unknown): DashboardData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = (raw ?? {}) as any;
  return {
    stats: r.stats ?? {
      total_posts: r.totalPosts,
      total_views: r.totalViews,
      total_subscribers: r.subscribers ?? r.totalSubscribers,
      pending_comments: r.commentsPending ?? r.pendingComments,
    },
    visitors_30d:
      r.visitors_30d ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Array.isArray(r.visitors30d) ? r.visitors30d.map((d: any) => ({ date: d.date, count: d.visitors ?? d.count ?? 0 })) : []),
    top_categories:
      r.top_categories ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Array.isArray(r.categoryViews) ? r.categoryViews.map((c: any) => ({ name: c.category ?? c.name, views: c.views ?? 0 })) : []),
    recent_posts: r.recent_posts ?? r.recentPosts ?? [],
    pending_comments: r.pending_comments_list ?? r.pendingComments ?? [],
  };
}

export const dashboardApi = {
  get: async (): Promise<DashboardData> => normalize(await api.get("/dashboard")),
};
