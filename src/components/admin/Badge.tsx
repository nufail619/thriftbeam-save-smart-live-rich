import { cn } from "@/lib/utils";

export type AdminBadgeVariant =
  | "published"
  | "draft"
  | "scheduled"
  | "pending"
  | "approved"
  | "spam"
  | "trash";

const STYLES: Record<AdminBadgeVariant, string> = {
  published: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-primary/10 text-primary",
  pending: "bg-[color:var(--warning)]/15 text-[color:#92400E]",
  approved: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
  spam: "bg-destructive/10 text-destructive",
  trash: "bg-muted text-muted-foreground line-through",
};

export default function AdminBadge({
  variant,
  children,
  className,
}: {
  variant: AdminBadgeVariant;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        STYLES[variant],
        className,
      )}
    >
      {children ?? variant}
    </span>
  );
}
