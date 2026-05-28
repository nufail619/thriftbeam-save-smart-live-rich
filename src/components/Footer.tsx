import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Instagram, Youtube, Heart, type LucideIcon } from "lucide-react";
import NewsletterSignup from "./NewsletterSignup";
import { categories, tools } from "@/lib/mockData";
import { useSettingsGroup } from "@/context/SettingsContext";

type FooterSettings = {
  copyright?: string;
  social?: { twitter?: string; facebook?: string; instagram?: string; youtube?: string };
  tagline?: string;
};

const SOCIAL_DEFS: { key: keyof NonNullable<FooterSettings["social"]>; Icon: LucideIcon; label: string }[] = [
  { key: "facebook", Icon: Facebook, label: "Facebook" },
  { key: "twitter", Icon: Twitter, label: "Twitter" },
  { key: "instagram", Icon: Instagram, label: "Instagram" },
  { key: "youtube", Icon: Youtube, label: "YouTube" },
];

export default function Footer() {
  const f = useSettingsGroup<FooterSettings>("footer");
  const year = new Date().getFullYear();
  const copyright = (f.copyright || "© {year} ThriftBeam. All rights reserved.").replace("{year}", String(year));
  const tagline = f.tagline || "Save Smart, Live Rich. Independent personal finance for real people, every week.";

  return (
    <footer className="bg-[color:var(--surface-2)] text-foreground mt-20 border-t border-border">
      <div className="container-page section-pad grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="font-bold text-2xl">
            <span className="text-foreground">Thrift</span>
            <span className="text-primary">Beam</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">{tagline}</p>
          <div className="mt-5">
            <NewsletterSignup variant="footer" />
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3">Categories</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to="/blog" search={{ category: c.slug }} className="hover:text-primary transition-colors">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3">Tools</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {tools.map((t) => (
              <li key={t.slug}>
                <Link to="/tools/$slug" params={{ slug: t.slug }} className="hover:text-primary transition-colors">{t.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</Link></li>
          </ul>
          <div className="flex gap-2 mt-4">
            {SOCIAL_DEFS.map(({ key, Icon, label }) => {
              const href = f.social?.[key];
              if (!href) return null;
              return (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow on ${label}`}
                  className="h-11 w-11 inline-flex items-center justify-center rounded-lg bg-background border border-border text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>{copyright}</p>
          <p className="inline-flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 text-accent fill-accent" /> by ThriftBeam
          </p>
        </div>
      </div>
    </footer>
  );
}
