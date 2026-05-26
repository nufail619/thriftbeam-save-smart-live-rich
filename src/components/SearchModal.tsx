import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { posts, getCategory } from "@/lib/mockData";

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) setQ("");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const results = q.trim()
    ? posts.filter((p) => {
        const cat = getCategory(p.category)?.name ?? "";
        return (
          p.title.toLowerCase().includes(q.toLowerCase()) ||
          cat.toLowerCase().includes(q.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
        );
      }).slice(0, 8)
    : posts.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl bg-background border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts, categories, tags…"
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex text-xs px-1.5 py-0.5 rounded border border-border text-muted-foreground">ESC</kbd>
          <button onClick={onClose} aria-label="Close" className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 && (
            <li className="px-4 py-8 text-center text-muted-foreground">No results for "{q}"</li>
          )}
          {results.map((p) => (
            <li key={p.slug}>
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
              >
                <img src={p.image} alt="" loading="lazy" decoding="async" width={64} height={36} className="h-9 w-16 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{getCategory(p.category)?.name}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
