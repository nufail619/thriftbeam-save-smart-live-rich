import { createFileRoute } from "@tanstack/react-router";
import { HardDrive, Zap, FileStack, Clock } from "lucide-react";
import { toast } from "sonner";
import StatCard from "@/components/admin/StatCard";
import { useSettings, settingsApi } from "@/lib/adminStore";

export const Route = createFileRoute("/admin/_authenticated/cache")({
  component: CachePage,
});

function CachePage() {
  const c = useSettings().cache;

  const clear = (label: string) => {
    toast.success(`${label} cleared`);
    settingsApi.update("cache", { lastCleared: new Date().toISOString().slice(0, 10), size: "0 MB" });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Cache size" value={c.size} icon={HardDrive} />
        <StatCard label="Hit rate" value={`${c.hitRate}%`} icon={Zap} />
        <StatCard label="Cached pages" value={c.cachedPages} icon={FileStack} />
        <StatCard label="Last cleared" value={c.lastCleared} icon={Clock} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-3">
        <h2 className="text-base font-semibold">Cache settings</h2>
        {[
          { k: "pageCache", label: "Page cache" },
          { k: "browserCache", label: "Browser cache headers" },
          { k: "objectCache", label: "Object cache (Redis)" },
          { k: "minify", label: "Minify HTML / CSS / JS" },
          { k: "lazyLoad", label: "Lazy-load images" },
        ].map((t) => (
          <label key={t.k} className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm font-medium">{t.label}</span>
            <input type="checkbox" checked={c[t.k as keyof typeof c] as boolean} onChange={(e) => settingsApi.update("cache", { [t.k]: e.target.checked } as never)} />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => clear("All cache")} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Clear all cache</button>
        <button onClick={() => clear("Page cache")} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Clear page cache</button>
        <button onClick={() => toast.success("Cache preloaded")} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Preload cache</button>
      </div>
    </div>
  );
}
