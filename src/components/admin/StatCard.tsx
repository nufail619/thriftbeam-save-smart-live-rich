import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  delta?: number;
  icon: LucideIcon;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {typeof delta === "number" && (
        <p
          className={cn(
            "mt-1 inline-flex items-center gap-1 text-xs font-semibold",
            up ? "text-[color:var(--success)]" : "text-destructive",
          )}
        >
          {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(delta).toFixed(1)}%<span className="font-normal text-muted-foreground"> vs last 30d</span>
        </p>
      )}
    </div>
  );
}
