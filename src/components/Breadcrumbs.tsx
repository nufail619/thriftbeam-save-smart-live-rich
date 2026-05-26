import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; to?: string; params?: Record<string, string> };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <ol className="flex items-center gap-1 flex-wrap">
        {items.map((c, i) => (
          <li key={i} className="inline-flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {c.to && i < items.length - 1 ? (
              <Link to={c.to as never} params={c.params as never} className="hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className={i === items.length - 1 ? "text-foreground font-medium" : ""}>{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
