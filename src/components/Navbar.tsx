import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Search, Sun, Moon } from "lucide-react";
import SearchModal from "./SearchModal";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Blog" },
  { to: "/tools", label: "Tools" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export default function Navbar({ transparentOverHero = false }: { transparentOverHero?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("tb_theme") as "light" | "dark" | null;
    const initial = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("tb_theme", next);
  }

  const solid = scrolled || !transparentOverHero;
  const onHero = transparentOverHero && !scrolled;

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          solid
            ? "bg-background/80 backdrop-blur-md border-b border-border"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-1 font-bold text-xl tracking-tight" aria-label="ThriftBeam home">
            <span className={onHero ? "text-white" : "text-foreground"}>Thrift</span>
            <span className="text-primary">Beam</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  onHero ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-foreground"
                }`}
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className={`h-11 w-11 rounded-lg inline-flex items-center justify-center transition-colors ${
                onHero ? "text-white/90 hover:bg-white/10" : "text-foreground hover:bg-muted"
              }`}
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              className={`h-11 w-11 rounded-lg inline-flex items-center justify-center transition-colors ${
                onHero ? "text-white/90 hover:bg-white/10" : "text-foreground hover:bg-muted"
              }`}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className={`md:hidden h-11 w-11 rounded-lg inline-flex items-center justify-center transition-colors ${
                onHero ? "text-white/90 hover:bg-white/10" : "text-foreground hover:bg-muted"
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden bg-background animate-in fade-in duration-200">
          <div className="container-page flex h-16 items-center justify-between">
            <Link to="/" onClick={() => setOpen(false)} className="font-bold text-xl">
              <span className="text-foreground">Thrift</span><span className="text-primary">Beam</span>
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="h-11 w-11 rounded-lg inline-flex items-center justify-center hover:bg-muted"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="container-page flex flex-col gap-1 pt-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-4 text-2xl font-semibold border-b border-border"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
