import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileText, Eye, Users, MessageSquare, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import StatCard from "@/components/admin/StatCard";
import { dashboardApi } from "@/lib/api/dashboard";
import { cacheApi } from "@/lib/api/siteSettings";

export const Route = createFileRoute("/admin/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.get(),
    staleTime: 0,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const clearMut = useMutation({
    mutationFn: () => cacheApi.clear(),
    onSuccess: () => {
      qc.clear();
      toast.success("Site cache cleared. All visitors will see fresh content.");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const stats = data?.stats ?? {};
  const visitors = data?.visitors_30d ?? [];
  const cats = data?.top_categories ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recent = (data?.recent_posts ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pending = (data?.pending_comments ?? []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Live data from api.thriftbeam.com — auto-refreshes every 30s.</p>
        <button
          onClick={() => clearMut.mutate()}
          disabled={clearMut.isPending}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold hover:bg-muted disabled:opacity-60"
        >
          {clearMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Clear site cache
        </button>
      </div>

      {isError && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Failed to load dashboard: {(error as Error)?.message}</span>
        </div>
      )}

      {isLoading && !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Posts" value={Number(stats.total_posts ?? 0)} icon={FileText} />
          <StatCard label="Total Views" value={Number(stats.total_views ?? 0)} icon={Eye} />
          <StatCard label="Subscribers" value={Number(stats.total_subscribers ?? 0)} icon={Users} />
          <StatCard label="Pending Comments" value={Number(stats.pending_comments ?? 0)} icon={MessageSquare} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Visitors — last 30 days">
          {visitors.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={visitors} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
                <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top categories by views">
          {cats.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cats} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={50} />
                <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                <Bar dataKey="views" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent posts</h2>
            <a href="/admin/posts" className="text-xs font-semibold text-primary hover:underline">View all →</a>
          </div>
          {recent.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No posts yet. Click "New Post" to create your first article.
            </p>
          ) : (
            <ul className="space-y-2">
              {recent.slice(0, 5).map((p, i) => (
                <li key={p.id ?? p.slug ?? i} className="rounded-xl border border-border bg-card p-3 text-sm">
                  <p className="font-medium truncate">{p.title ?? "(untitled)"}</p>
                  <p className="text-xs text-muted-foreground">{p.status ?? ""} · {p.published_at ?? p.date ?? ""}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Pending comments</h2>
            <a href="/admin/comments" className="text-xs font-semibold text-primary hover:underline">View all →</a>
          </div>
          {pending.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No pending comments.</p>
          ) : (
            <ul className="space-y-3">
              {pending.slice(0, 5).map((c, i) => (
                <li key={c.id ?? i} className="rounded-2xl border border-border bg-card p-4 text-sm">
                  <p className="font-semibold">{c.author ?? c.name ?? "Anonymous"}</p>
                  <p className="mt-1 text-muted-foreground line-clamp-2">{c.body ?? c.content ?? c.excerpt ?? ""}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function EmptyChart() {
  return <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">No data yet</div>;
}
