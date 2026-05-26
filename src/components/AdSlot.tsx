type Size = "banner" | "square" | "skyscraper" | "in-article";

const dims: Record<Size, { w: number; h: number; label: string; cls: string }> = {
  banner: { w: 728, h: 90, label: "728 × 90", cls: "max-w-[728px] h-[90px]" },
  square: { w: 300, h: 250, label: "300 × 250", cls: "w-[300px] h-[250px]" },
  skyscraper: { w: 300, h: 600, label: "300 × 600", cls: "w-[300px] h-[600px]" },
  "in-article": { w: 0, h: 0, label: "In-article", cls: "w-full h-32" },
};

export default function AdSlot({ size = "in-article", className = "" }: { size?: Size; className?: string }) {
  const d = dims[size];
  return (
    <div
      role="complementary"
      aria-label="Advertisement placeholder"
      className={`mx-auto flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface text-muted-foreground text-xs tracking-wide uppercase ${d.cls} ${className}`}
    >
      <span>Advertisement {d.label !== "In-article" && `· ${d.label}`}</span>
    </div>
  );
}
