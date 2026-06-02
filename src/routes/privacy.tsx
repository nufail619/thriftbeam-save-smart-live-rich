import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { publicPagesApi } from "@/lib/api/publicPages";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ThriftBeam" },
      { name: "description", content: "How ThriftBeam collects, uses and protects your data." },
      { property: "og:title", content: "Privacy Policy — ThriftBeam" },
      { property: "og:description", content: "Our privacy commitments to readers." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["page", "privacy-policy"],
    queryFn: () => publicPagesApi.bySlug("privacy-policy"),
    staleTime: 60_000,
  });

  return (
    <div className="container-page py-10 md:py-16">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Privacy" }]} />
      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-bold">{data?.title || "Privacy Policy"}</h1>
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
