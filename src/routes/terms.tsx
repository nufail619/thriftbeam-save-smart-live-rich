import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { publicPagesApi } from "@/lib/api/publicPages";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — ThriftBeam" },
      { name: "description", content: "Terms of Service for ThriftBeam.com — your agreement when using our website." },
      { property: "og:title", content: "Terms of Service — ThriftBeam" },
      { property: "og:description", content: "Terms and conditions for using ThriftBeam." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["page", "terms"],
    queryFn: () => publicPagesApi.bySlug("terms"),
    staleTime: 60_000,
  });

  return (
    <div className="container-page py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Terms" }]} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-bold">{data?.title || "Terms of Service"}</h1>
      </header>

      <div className="mt-10 max-w-3xl">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <article
            className="prose prose-neutral dark:prose-invert max-w-none prose-tb"
            dangerouslySetInnerHTML={{ __html: data?.content ?? "" }}
          />
        )}
      </div>
    </div>
  );
}
