import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { publicPagesApi } from "@/lib/api/publicPages";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — ThriftBeam" },
      { name: "description", content: "Editorial independence, affiliate disclosure, and a reminder that ThriftBeam is education — not personal financial advice." },
      { property: "og:title", content: "Disclaimer — ThriftBeam" },
      { property: "og:description", content: "How ThriftBeam approaches editorial independence and affiliate links." },
      { property: "og:url", content: "/disclaimer" },
    ],
    links: [{ rel: "canonical", href: "/disclaimer" }],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["page", "disclaimer"],
    queryFn: () => publicPagesApi.bySlug("disclaimer"),
    staleTime: 60_000,
  });

  return (
    <div className="container-page py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Disclaimer" }]} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-bold">{data?.title || "Disclaimer"}</h1>
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
