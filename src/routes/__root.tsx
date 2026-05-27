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


function NotFoundComponent() {
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
      { name: "theme-color", content: "#2563EB" },
      { title: "ThriftBeam — Save Smart, Live Rich" },
      { name: "description", content: "Your trusted guide to budgeting, saving, and building wealth — one smart decision at a time." },
      { property: "og:site_name", content: "ThriftBeam" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "ThriftBeam — Save Smart, Live Rich" },
      { property: "og:description", content: "Your trusted guide to budgeting, saving, and building wealth — one smart decision at a time." },
      { property: "og:url", content: "https://thriftbeam.com" },
      { property: "og:image", content: "https://thriftbeam.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ThriftBeam" },
      { name: "twitter:title", content: "ThriftBeam — Save Smart, Live Rich" },
      { name: "twitter:description", content: "Your trusted guide to budgeting, saving, and building wealth — one smart decision at a time." },
      { name: "twitter:image", content: "https://thriftbeam.com/og-image.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
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
          logo: "https://thriftbeam.com/favicon-512x512.png",
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
