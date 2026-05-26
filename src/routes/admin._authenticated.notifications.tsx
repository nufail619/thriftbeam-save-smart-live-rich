import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, MessageSquare, Settings as SettingsIcon, User as UserIcon, FileText, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useNotifications, notificationsApi } from "@/lib/adminStore";
import type { Notification } from "@/lib/mockAdminData";

export const Route = createFileRoute("/admin/_authenticated/notifications")({
  component: NotificationsPage,
});

const FILTERS = ["All", "Unread", "System", "Comments", "Users", "Posts"] as const;
type Filter = (typeof FILTERS)[number];

const ICONS: Record<Notification["type"], LucideIcon> = {
  system: SettingsIcon, comment: MessageSquare, user: UserIcon, post: FileText,
};

function NotificationsPage() {
  const all = useNotifications();
  const [filter, setFilter] = useState<Filter>("All");
  const [selected, setSelected] = useState<Notification | null>(null);

  const filtered = useMemo(() => {
    switch (filter) {
      case "Unread": return all.filter((n) => !n.read);
      case "System": return all.filter((n) => n.type === "system");
      case "Comments": return all.filter((n) => n.type === "comment");
      case "Users": return all.filter((n) => n.type === "user");
      case "Posts": return all.filter((n) => n.type === "post");
      default: return all;
    }
  }, [all, filter]);

  const grouped = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    for (const n of filtered) {
      const day = n.createdAt.slice(0, 10);
      (groups[day] ||= []).push(n);
    }
    return Object.entries(groups);
  }, [filtered]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`h-8 rounded-lg px-3 text-xs font-semibold ${filter === f ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-muted"}`}>{f}</button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button onClick={() => { notificationsApi.markAllRead(); toast.success("All marked read"); }} className="h-8 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted">Mark all read</button>
            <button onClick={() => { notificationsApi.clearAll(); toast.success("Cleared"); }} className="h-8 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted">Clear all</button>
          </div>
        </div>

        {grouped.length === 0 && <p className="rounded-2xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">No notifications.</p>}

        {grouped.map(([day, items]) => (
          <div key={day}>
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{day}</p>
            <ul className="space-y-2">
              {items.map((n) => {
                const Icon = ICONS[n.type];
                return (
                  <li key={n.id}>
                    <button onClick={() => { setSelected(n); if (!n.read) notificationsApi.markRead(n.id); }} className={`flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left hover:bg-muted/40 ${selected?.id === n.id ? "ring-2 ring-primary" : ""}`}>
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                          {n.title}
                          {!n.read && <span className="inline-block h-2 w-2 rounded-full bg-primary" />}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.body}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <aside className="lg:col-span-1">
        <div className="sticky top-20 rounded-2xl border border-border bg-card p-5">
          {selected ? (
            <>
              <h2 className="text-lg font-semibold">{selected.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{selected.createdAt.replace("T", " ").slice(0, 16)} · {selected.type}</p>
              <p className="mt-4 text-sm">{selected.body}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => { notificationsApi.remove(selected.id); setSelected(null); toast.success("Removed"); }} className="h-9 rounded-lg border border-border px-3 text-xs font-semibold hover:bg-muted">Delete</button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Select a notification to view details.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
