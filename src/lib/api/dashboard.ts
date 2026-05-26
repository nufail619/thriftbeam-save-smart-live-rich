import { api } from "@/lib/api";

export type DashboardStat = { value: number; delta?: number };

export type DashboardData = {
  totalPosts?: DashboardStat | number;
  totalViews?: DashboardStat | number;
  subscribers?: DashboardStat | number;
  commentsPending?: DashboardStat | number;
  visitors30d?: { date: string; visitors: number }[];
  categoryViews?: { category: string; views: number }[];
  recentPosts?: unknown[];
  pendingComments?: unknown[];
};

export const dashboardApi = {
  get: () => api.get<DashboardData>("/dashboard"),
};

export function asStat(v: DashboardStat | number | undefined): DashboardStat {
  if (v == null) return { value: 0 };
  if (typeof v === "number") return { value: v };
  return { value: v.value ?? 0, delta: v.delta };
}
