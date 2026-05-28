import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Search } from "lucide-react";
import SearchModal from "./SearchModal";
import { useSettingsGroup } from "@/context/SettingsContext";

type NavLink = { to?: string; href?: string; label: string };
type NavbarSettings = { links?: NavLink[] };
type SiteSettings = { title?: string; site_title?: string };

const DEFAULT_LINKS: NavLink[] = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Blog" },
  { to: "/tools", label: "Tools" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar({ transparentOverHero: _ = false }: { transparentOverHero?: boolean }) {
  const nav = useSettingsGroup<NavbarSettings>("navbar");
  const site = useSettingsGroup<SiteSettings>("site");
  const general = useSettingsGroup<SiteSettings>("general");

  const links: NavLink[] = Array.isArray(nav.links) && nav.links.length ? nav.links : DEFAULT_LINKS;
  const title = site.title || site.site_title || general.site_title || "ThriftBeam";

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

  const renderLink = (l: NavLink, opts: { mobile?: boolean } = {}) => {
    const className = opts.mobile
      ? "py-4 text-2xl font-semibold border-b border-border"
      : "px-3 py-2 rounded-md text-sm font-medium text-foreground/70 hover:text-foreground transition-colors";
    if (l.href && !l.to) {
      return (
        <a key={l.label} href={l.href} className={className} onClick={() => opts.mobile && setOpen(false)}>
          {l.label}
        </a>
      );
    }
    return (
      <Link
        key={l.label}
        to={l.to || "/"}
        onClick={() => opts.mobile && setOpen(false)}
        className={className}
        activeProps={{ className: opts.mobile ? `${className} text-primary` : "text-primary" }}
        activeOptions={{ exact: (l.to || "/") === "/" }}
      >
        {l.label}
      </Link>
    );
  };

  const renderTitle = () => {
    // Allow "Thrift|Beam" style two-tone via pipe character.
    if (title.includes("|")) {
      const [a, b] = title.split("|");
      return (
        <>
          <span className="text-foreground">{a}</span>
          <span className="text-primary">{b}</span>
        </>
      );
    }
    return <span className="text-foreground">{title}</span>;
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 bg-background/85 backdrop-blur-md ${
          scrolled ? "border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]" : "border-b border-transparent"
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4 lg:justify-start">
          <Link to="/" className="flex items-center gap-1 font-bold text-xl tracking-tight" aria-label={`${title} home`}>
            {renderTitle()}
          </Link>

          <nav className="hidden md:flex items-center gap-1 lg:mx-auto">
            {links.map((l) => renderLink(l))}
          </nav>

          <div className="flex items-center gap-1 lg:ml-auto">
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

      {open && (
        <div className="fixed inset-0 z-50 md:hidden bg-background animate-in fade-in duration-200">
          <div className="container-page flex h-16 items-center justify-between">
            <Link to="/" onClick={() => setOpen(false)} className="font-bold text-xl">
              {renderTitle()}
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
            {links.map((l) => renderLink(l, { mobile: true }))}
          </nav>
        </div>
      )}

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
