// Global SettingsProvider — fetches /settings, applies theme + custom CSS,
// and exposes typed accessors used by public-facing components.

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { siteSettingsApi, type SiteSettingsGroups } from "@/lib/api/siteSettings";

export const SETTINGS_QUERY_KEY = ["site-settings"] as const;

type Ctx = {
  settings: SiteSettingsGroups;
  isLoading: boolean;
  refresh: () => Promise<unknown>;
  group: <T extends Record<string, unknown> = Record<string, unknown>>(name: string) => T;
};

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => siteSettingsApi.getAll(),
    staleTime: 0,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const settings = data ?? {};

  // Apply theme tokens + custom css whenever settings change (client only).
  useEffect(() => {
    if (typeof document === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const theme = (settings.theme ?? {}) as any;
    const root = document.documentElement;
    if (typeof theme.accent_color === "string") root.style.setProperty("--accent", theme.accent_color);
    if (typeof theme.accentColor === "string") root.style.setProperty("--accent", theme.accentColor);
    if (typeof theme.primary_color === "string") root.style.setProperty("--primary", theme.primary_color);
    if (typeof theme.primaryColor === "string") root.style.setProperty("--primary", theme.primaryColor);
    if (typeof theme.secondary_color === "string") root.style.setProperty("--secondary", theme.secondary_color);
    if (typeof theme.secondaryColor === "string") root.style.setProperty("--secondary", theme.secondaryColor);

    const mode = (theme.mode ?? "").toString();
    if (mode === "dark") root.classList.add("dark");
    else if (mode === "light") root.classList.remove("dark");

    const cssText = typeof theme.custom_css === "string" ? theme.custom_css : typeof theme.customCss === "string" ? theme.customCss : "";
    let styleEl = document.getElementById("tb-custom-css") as HTMLStyleElement | null;
    if (cssText) {
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "tb-custom-css";
        document.head.appendChild(styleEl);
      }
      if (styleEl.textContent !== cssText) styleEl.textContent = cssText;
    } else if (styleEl) {
      styleEl.remove();
    }
  }, [settings]);

  const value = useMemo<Ctx>(() => ({
    settings,
    isLoading,
    refresh: () => qc.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY }),
    group: <T extends Record<string, unknown> = Record<string, unknown>>(name: string) =>
      ((settings[name] ?? {}) as T),
  }), [settings, isLoading, qc]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings(): Ctx {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return {
      settings: {},
      isLoading: false,
      refresh: async () => null,
      group: () => ({}) as never,
    };
  }
  return ctx;
}

export function useSettingsGroup<T extends Record<string, unknown> = Record<string, unknown>>(name: string): T {
  return useSiteSettings().group<T>(name);
}
