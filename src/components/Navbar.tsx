import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Search } from "lucide-react";
import SearchModal from "./SearchModal";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Blog" },
  { to: "/tools", label: "Tools" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export default function Navbar({ transparentOverHero: _ = false }: { transparentOverHero?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 bg-background/85 backdrop-blur-md ${
          scrolled ? "border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]" : "border-b border-transparent"
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4 lg:justify-start">
          <Link to="/" className="flex items-center gap-1 font-bold text-xl tracking-tight" aria-label="ThriftBeam home">
            <span className="text-foreground">Thrift</span>
            <span className="text-primary">Beam</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 rounded-md text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
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
              className="h-11 w-11 rounded-lg inline-flex items-center justify-center text-foreground hover:bg-muted transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
              className="md:hidden h-11 w-11 rounded-lg inline-flex items-center justify-center text-foreground hover:bg-muted transition-colors"
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
