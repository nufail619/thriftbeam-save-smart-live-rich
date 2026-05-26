import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Instagram, Youtube, Heart } from "lucide-react";
import NewsletterSignup from "./NewsletterSignup";
import { categories, tools } from "@/lib/mockData";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white mt-20">
      <div className="container-page section-pad grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="font-bold text-2xl">
            <span className="text-white">Thrift</span>
            <span className="text-primary">Beam</span>
          </Link>
          <p className="mt-3 text-sm text-white/70 max-w-xs">
            Save Smart, Live Rich. Independent personal finance for real people, every week.
          </p>
          <div className="mt-5">
            <NewsletterSignup variant="footer" />
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Categories</h4>
          <ul className="space-y-2 text-sm text-white/70">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link to="/blog" search={{ category: c.slug }} className="hover:text-white">{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Tools</h4>
          <ul className="space-y-2 text-sm text-white/70">
            {tools.map((t) => (
              <li key={t.slug}>
                <Link to="/tools/$slug" params={{ slug: t.slug }} className="hover:text-white">{t.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link to="/disclaimer" className="hover:text-white">Disclaimer</Link></li>
          </ul>
          <div className="flex gap-2 mt-4">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" aria-label="Social link" className="h-10 w-10 inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/60">
          <p>© {new Date().getFullYear()} ThriftBeam. All rights reserved.</p>
          <p className="inline-flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 text-accent fill-accent" /> by ThriftBeam
          </p>
        </div>
      </div>
    </footer>
  );
}
