import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, ExternalLink, LogOut, User as UserIcon, Bell } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminSidebarContent } from "./AdminSidebar";
import { getUser, logout } from "@/lib/adminAuth";
import { useNotifications, notificationsApi } from "@/lib/adminStore";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/posts": "Posts",
  "/admin/posts/new": "New Post",
  "/admin/pages": "Pages",
  "/admin/comments": "Comments",
  "/admin/media": "Media",
  "/admin/users": "Users",
  "/admin/newsletter": "Newsletter",
  "/admin/seo": "SEO",
  "/admin/analytics": "Analytics",
  "/admin/integrations": "Integrations",
  "/admin/theme": "Theme",
  "/admin/cookies": "Cookies",
  "/admin/tools": "Tools",
  "/admin/maintenance": "Maintenance",
  "/admin/pwa": "PWA & Push",
  "/admin/backup": "Backup",
  "/admin/cache": "Cache",
  "/admin/notifications": "Notifications",
  "/admin/settings": "General Settings",
};

export default function AdminTopbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = getUser();
  const notifications = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;
  const recent = notifications.slice(0, 5);
  const title = TITLES[pathname] ?? "Admin";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "A";

  const handleLogout = () => {
    logout();
    navigate({ to: "/admin/login" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-4 md:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            aria-label="Open menu"
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <AdminSidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <h1 className="text-base font-semibold tracking-tight md:text-lg">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          View site
          <ExternalLink className="h-3.5 w-3.5" />
        </a>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="inline-flex items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{user?.name ?? "Admin"}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <UserIcon className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/" className="cursor-pointer">
                <ExternalLink className="mr-2 h-4 w-4" /> View site
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
