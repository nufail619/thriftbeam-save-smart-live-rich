import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
import { FileText, Eye, Users, MessageSquare, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import StatCard from "@/components/admin/StatCard";
import AdminBadge from "@/components/admin/Badge";
import DataTable, { type Column } from "@/components/admin/DataTable";
import {
  mockCategoryViews,
  mockDashboardStats,
  mockPendingComments,
  mockRecentPosts,
  mockVisitors30d,
  type AdminPost,
  type PendingComment,
} from "@/lib/mockAdminData";
import { dashboardApi, asStat, type DashboardData } from "@/lib/api/dashboard";

export const Route = createFileRoute("/admin/_authenticated/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => dashboardApi.get(),
  });

  const d: DashboardData = data ?? {};
  const stats = {
    totalPosts: asStat(d.totalPosts ?? mockDashboardStats.totalPosts.value),
    totalViews: asStat(d.totalViews ?? mockDashboardStats.totalViews.value),
    subscribers: asStat(d.subscribers ?? mockDashboardStats.subscribers.value),
    commentsPending: asStat(d.commentsPending ?? mockDashboardStats.commentsPending.value),
  };
  const visitors = d.visitors30d?.length ? d.visitors30d : mockVisitors30d;
  const categories = d.categoryViews?.length ? d.categoryViews : mockCategoryViews;
  const recent = (d.recentPosts as AdminPost[] | undefined) ?? mockRecentPosts;
  const pending = (d.pendingComments as PendingComment[] | undefined) ?? mockPendingComments;

  const columns: Column<AdminPost>[] = [
    {
      key: "title",
      header: "Title",
      render: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          <img src={r.thumbnail} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" loading="lazy" />
          <span className="truncate text-sm font-medium">{r.title}</span>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (r) => <span className="text-sm text-muted-foreground">{r.category}</span> },
    { key: "status", header: "Status", render: (r) => <AdminBadge variant={r.status} /> },
    {
      key: "date",
      header: "Date",
      render: (r) => <span className="text-sm text-muted-foreground">{new Date(r.date).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "",
      render: () => (
        <div className="flex justify-end gap-2">
          <button onClick={() => toast("Open the Posts page to edit")} className="text-xs font-semibold text-primary hover:underline">Edit</button>
          <button onClick={() => toast("Preview coming soon")} className="text-xs font-semibold text-muted-foreground hover:underline">View</button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="space-y-6">
      {isError && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Failed to load dashboard: {(error as Error)?.message}. Showing fallback.</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Posts" value={stats.totalPosts.value} delta={stats.totalPosts.delta} icon={FileText} />
        <StatCard label="Total Views" value={stats.totalViews.value} delta={stats.totalViews.delta} icon={Eye} />
        <StatCard label="Subscribers" value={stats.subscribers.value} delta={stats.subscribers.delta} icon={Users} />
        <StatCard label="Comments Pending" value={stats.commentsPending.value} delta={stats.commentsPending.delta} icon={MessageSquare} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Visitors — last 30 days">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={visitors} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
              <Line type="monotone" dataKey="visitors" stroke="#2563EB" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top categories by views">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categories} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="category" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} interval={0} angle={-12} textAnchor="end" height={50} />
              <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
              <Bar dataKey="views" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent posts</h2>
            <a href="/admin/posts" className="text-xs font-semibold text-primary hover:underline">View all →</a>
          </div>
          <DataTable rows={recent} columns={columns} rowKey={(r) => r.id} pageSize={5} />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Pending comments</h2>
            <a href="/admin/comments" className="text-xs font-semibold text-primary hover:underline">View all →</a>
          </div>
          <ul className="space-y-3">
            {pending.map((c) => (
              <PendingItem key={c.id} c={c} />
            ))}
          </ul>
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

function PendingItem({ c }: { c: PendingComment }) {
  const initials = c.author.split(" ").map((s) => s[0]).slice(0, 2).join("");
  return (
    <li className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{c.author}</p>
            <AdminBadge variant="pending" />
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.excerpt}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            on <span className="font-medium">{c.postTitle}</span>
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => toast.success(`Approved comment from ${c.author}`)}
              className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              Approve
            </button>
            <button
              onClick={() => toast(`Rejected comment from ${c.author}`)}
              className="h-8 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted"
            >
              Reject
            </button>
            <a
              href="#"
              className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              View <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}
