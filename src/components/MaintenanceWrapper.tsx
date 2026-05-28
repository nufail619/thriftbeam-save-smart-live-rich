// Renders a maintenance page for public visitors when settings.maintenance.enabled is true.
// Admin routes (/admin*) bypass this; logged-in admins (tb_token present) also bypass.

import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useSettingsGroup } from "@/context/SettingsContext";

type MaintenanceSettings = {
  enabled?: boolean;
  title?: string;
  message?: string;
};

export default function MaintenanceWrapper({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const m = useSettingsGroup<MaintenanceSettings>("maintenance");

  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/admin/login";
  const hasToken = typeof window !== "undefined" && !!window.localStorage.getItem("tb_token");

  if (!m.enabled || isAdmin || hasToken) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 bg-background">
      <div className="max-w-xl text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 text-primary inline-flex items-center justify-center text-3xl">⚙</div>
        <h1 className="mt-6 text-3xl md:text-4xl font-bold tracking-tight">{m.title || "We'll be right back"}</h1>
        <div
          className="mt-4 text-muted-foreground"
          dangerouslySetInnerHTML={{
            __html: m.message || "<p>The site is undergoing scheduled maintenance. Please check back shortly.</p>",
          }}
        />
      </div>
    </div>
  );
}
