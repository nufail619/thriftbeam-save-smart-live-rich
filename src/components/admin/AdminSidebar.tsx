import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  Files,
  MessageSquare,
  Image as ImageIcon,
  Users,
  Mail,
  Search,
  BarChart3,
  Plug,
  Palette,
  Cookie,
  Wrench,
  Power,
  Smartphone,
  Database,
  HardDrive,
  Settings,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; to: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { label: "Posts", to: "/admin/posts", icon: FileText },
      { label: "New Post", to: "/admin/posts/new", icon: FilePlus },
      { label: "Pages", to: "/admin/pages", icon: Files },
      { label: "Comments", to: "/admin/comments", icon: MessageSquare },
      { label: "Media", to: "/admin/media", icon: ImageIcon },
    ],
  },
  {
    label: "Audience",
    items: [
      { label: "Users", to: "/admin/users", icon: Users },
      { label: "Newsletter", to: "/admin/newsletter", icon: Mail },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "SEO", to: "/admin/seo", icon: Search },
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
      { label: "Integrations", to: "/admin/integrations", icon: Plug },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Theme", to: "/admin/theme", icon: Palette },
      { label: "Cookies", to: "/admin/cookies", icon: Cookie },
      { label: "Tools", to: "/admin/tools", icon: Wrench },
      { label: "Maintenance", to: "/admin/maintenance", icon: Power },
      { label: "PWA & Push", to: "/admin/pwa", icon: Smartphone },
      { label: "Backup", to: "/admin/backup", icon: Database },
      { label: "Cache", to: "/admin/cache", icon: HardDrive },
      { label: "Notifications", to: "/admin/notifications", icon: Bell },
      { label: "General Settings", to: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto p-3">
      <div className="px-3 pb-4 pt-2">
        <Link to="/admin" onClick={onNavigate} className="flex items-center gap-2">
          <span className="inline-block h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-extrabold">
            T
          </span>
          <span className="text-base font-bold tracking-tight">ThriftBeam</span>
          <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
            Admin
          </span>
        </Link>
      </div>
      {groups.map((group) => (
        <div key={group.label} className="mt-2">
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active =
                item.to === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.to || pathname.startsWith(item.to + "/");
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export default function AdminSidebar() {
  return (
    <aside className="hidden lg:flex h-screen w-64 shrink-0 flex-col border-r border-border bg-card sticky top-0">
      <AdminSidebarContent />
    </aside>
  );
}
