import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X, ArrowRight, CornerDownLeft } from "lucide-react";
import { posts, getCategory } from "@/lib/mockData";

function highlight(text: string, q: string) {
  if (!q.trim()) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-primary/15 text-primary rounded px-0.5">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return posts.slice(0, 6);
    return posts
      .filter((p) => {
        const cat = getCategory(p.category)?.name ?? "";
        return (
          p.title.toLowerCase().includes(query) ||
          cat.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
        );
      })
      .slice(0, 8);
  }, [q]);

  useEffect(() => {
    setActive(0);
  }, [q, open]);

  useEffect(() => {
    if (!open) {
      setQ("");
      previouslyFocused.current?.focus?.();
      return;
    }
    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, results.length]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search articles"
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-background border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="search-input" className="sr-only">Search articles</label>
          <input
            id="search-input"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts, categories, tags…"
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[active]) {
                e.preventDefault();
                const link = document.getElementById(`search-result-${results[active].slug}`);
                link?.click();
              }
            }}
          />
          <kbd className="hidden sm:inline-flex text-xs px-1.5 py-0.5 rounded border border-border text-muted-foreground">ESC</kbd>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!q.trim() && (
          <p className="px-4 pt-3 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            Recent posts
          </p>
        )}

        <ul className="max-h-[60vh] overflow-y-auto py-1" role="listbox">
          {results.length === 0 && (
            <li className="px-4 py-10 text-center">
              <p className="text-muted-foreground">No results for "{q}"</p>
              <Link
                to="/blog"
                onClick={onClose}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Browse all posts <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
          )}
          {results.map((p, i) => (
            <li key={p.slug} role="option" aria-selected={i === active}>
              <Link
                id={`search-result-${p.slug}`}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                onClick={onClose}
                onMouseEnter={() => setActive(i)}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  i === active ? "bg-muted" : "hover:bg-muted"
                }`}
              >
                <img src={p.image} alt="" loading="lazy" decoding="async" width={64} height={36} className="h-9 w-16 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{highlight(p.title, q)}</div>
                  <div className="text-xs text-muted-foreground">{getCategory(p.category)?.name}</div>
                </div>
                {i === active && <CornerDownLeft className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden sm:flex items-center justify-between px-4 py-2 border-t border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded border border-border">↑</kbd> <kbd className="px-1 py-0.5 rounded border border-border">↓</kbd> navigate</span>
            <span><kbd className="px-1 py-0.5 rounded border border-border">↵</kbd> open</span>
          </span>
          <span><kbd className="px-1 py-0.5 rounded border border-border">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
