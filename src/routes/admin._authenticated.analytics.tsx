import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Users as UsersIcon, Clock, MousePointerClick } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import StatCard from "@/components/admin/StatCard";

export const Route = createFileRoute("/admin/_authenticated/analytics")({
  component: AnalyticsPage,
});

const RANGES = [
  { id: "7d", label: "Last 7 days", days: 7 },
  { id: "30d", label: "Last 30 days", days: 30 },
  { id: "90d", label: "Last 90 days", days: 90 },
] as const;

const seed = (i: number) => { const x = Math.sin(i * 9301 + 49297) * 233280; return x - Math.floor(x); };

function AnalyticsPage() {
  const [range, setRange] = useState<(typeof RANGES)[number]["id"]>("30d");
  const days = RANGES.find((r) => r.id === range)!.days;

  const series = useMemo(() => Array.from({ length: days }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
    return {
      date: d.toISOString().slice(5, 10),
      visitors: Math.round(400 + seed(i + days) * 1000),
      pageviews: Math.round(1100 + seed(i + days + 7) * 2200),
    };
  }), [days]);

  const totals = series.reduce((a, b) => ({ visitors: a.visitors + b.visitors, pageviews: a.pageviews + b.pageviews }), { visitors: 0, pageviews: 0 });

  const topPages = [
    { page: "/blog/50-30-20-rule", views: 4820 },
    { page: "/blog/emergency-fund", views: 3910 },
    { page: "/tools/budget-calculator", views: 3450 },
    { page: "/blog/snowball-vs-avalanche", views: 2980 },
    { page: "/", views: 2710 },
  ];
  const sources = [
    { name: "Organic Search", value: 58 },
    { name: "Direct", value: 22 },
    { name: "Social", value: 12 },
    { name: "Referral", value: 8 },
  ];
  const devices = [
    { name: "Mobile", value: 64 },
    { name: "Desktop", value: 30 },
    { name: "Tablet", value: 6 },
  ];
  const COLORS = ["#2563EB", "#F97066", "#10B981", "#F59E0B"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {RANGES.map((r) => (
          <button key={r.id} onClick={() => setRange(r.id)} className={`h-9 rounded-lg px-3 text-sm font-semibold ${range === r.id ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-muted"}`}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Visitors" value={totals.visitors} delta={5.2} icon={UsersIcon} />
        <StatCard label="Pageviews" value={totals.pageviews} delta={8.1} icon={Eye} />
        <StatCard label="Avg. session" value="2m 18s" delta={1.4} icon={Clock} />
        <StatCard label="Bounce rate" value="42.7%" delta={-2.3} icon={MousePointerClick} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-base font-semibold">Visitors over time</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
            <Area type="monotone" dataKey="visitors" stroke="#2563EB" strokeWidth={2.5} fill="url(#v)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-base font-semibold">Top pages</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topPages} layout="vertical" margin={{ top: 0, right: 12, left: 12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <YAxis type="category" dataKey="page" width={180} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
              <Bar dataKey="views" fill="#2563EB" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DonutCard title="Traffic sources" data={sources} colors={COLORS} />
          <DonutCard title="Devices" data={devices} colors={COLORS} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-[color:var(--success)] animate-pulse" />
          <h2 className="text-base font-semibold">Real-time · 124 active</h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="text-muted-foreground">Visitor on <span className="font-medium text-foreground">/blog/50-30-20-rule</span> from US</li>
          <li className="text-muted-foreground">Visitor on <span className="font-medium text-foreground">/tools/budget-calculator</span> from UK</li>
          <li className="text-muted-foreground">Visitor on <span className="font-medium text-foreground">/blog/emergency-fund</span> from CA</li>
          <li className="text-muted-foreground">Visitor on <span className="font-medium text-foreground">/</span> from AU</li>
        </ul>
      </div>
    </div>
  );
}

function DonutCard({ title, data, colors }: { title: string; data: { name: string; value: number }[]; colors: string[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-3 text-base font-semibold">{title}</h2>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-2 space-y-1 text-xs">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between">
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: colors[i % colors.length] }} />{d.name}</span>
            <span className="font-semibold">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
