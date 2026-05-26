import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
  Link,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AlertTriangle } from "lucide-react";

import appCss from "../styles.css?url";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import CookieConsent from "@/components/CookieConsent";
import { posts } from "@/lib/mockData";

function NotFoundComponent() {
  const popular = posts.filter((p) => p.featured).slice(0, 3);
  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-2xl mx-auto text-center">
        <p
          className="text-7xl md:text-9xl font-extrabold tracking-tighter bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent leading-none"
          aria-hidden="true"
        >
          404
        </p>
        <h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you're looking for has wandered off. Try one of these instead.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 font-semibold text-primary-foreground hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Back to Home
          </Link>
          <Link
            to="/blog"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-6 font-semibold hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Browse articles
          </Link>
        </div>
      </div>

      {popular.length > 0 && (
        <div className="mt-16 max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold text-center mb-4">
            Popular right now
          </p>
          <ul className="grid gap-3 md:grid-cols-3">
            {popular.map((p) => (
              <li key={p.slug}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="block rounded-2xl border border-border bg-card p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
                >
                  <img src={p.image} alt="" loading="lazy" className="aspect-video w-full rounded-lg object-cover" />
                  <p className="mt-3 text-sm font-semibold line-clamp-2">{p.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-destructive/10 text-destructive inline-flex items-center justify-center">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again or head back home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >Try again</button>
          <a href="/" className="h-11 px-5 inline-flex items-center rounded-xl border border-border font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#4F46E5" },
      { title: "ThriftBeam — Save Smart, Live Rich" },
      { name: "description", content: "Independent personal finance: budgeting, debt payoff, side hustles, frugal living, credit and insurance — explained simply." },
      { property: "og:site_name", content: "ThriftBeam" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ThriftBeam" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "ThriftBeam",
          url: "https://thriftbeam.com",
          slogan: "Save Smart, Live Rich",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const transparent = pathname === "/";
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/admin/login";

  if (isAdmin) {
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Navbar transparentOverHero={transparent} />
      <main id="main" className="min-h-[60vh]">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
