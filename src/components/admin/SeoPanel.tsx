import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SeoPanel({
  title,
  description,
  slug,
  onChange,
}: {
  title: string;
  description: string;
  slug: string;
  onChange: (patch: { seoTitle?: string; seoDescription?: string }) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
      >
        SEO
        <span className="text-xs text-muted-foreground">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-border px-4 py-4">
          <label className="block text-xs font-medium">
            SEO title
            <input
              value={title}
              onChange={(e) => onChange({ seoTitle: e.target.value })}
              maxLength={70}
              className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <span className={cn("mt-0.5 block text-[11px]", title.length > 60 ? "text-destructive" : "text-muted-foreground")}>
              {title.length}/60
            </span>
          </label>
          <label className="block text-xs font-medium">
            Meta description
            <textarea
              value={description}
              onChange={(e) => onChange({ seoDescription: e.target.value })}
              rows={3}
              maxLength={170}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <span className={cn("mt-0.5 block text-[11px]", description.length > 160 ? "text-destructive" : "text-muted-foreground")}>
              {description.length}/160
            </span>
          </label>
          <div className="rounded-lg border border-border bg-muted/40 p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Search preview</p>
            <p className="mt-1 truncate text-sm text-primary">{title || "Your title"}</p>
            <p className="truncate text-xs text-[color:var(--success)]">thriftbeam.com/{slug || "your-slug"}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{description || "Your meta description appears here."}</p>
          </div>
        </div>
      )}
    </section>
  );
}
