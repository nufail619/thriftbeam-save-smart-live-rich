import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { cacheApi } from "@/lib/api/siteSettings";

export const Route = createFileRoute("/admin/_authenticated/cache")({
  component: CachePage,
});

function CachePage() {
  const qc = useQueryClient();
  const clearMut = useMutation({
    mutationFn: () => cacheApi.clear(),
    onSuccess: () => {
      qc.clear();
      toast.success("Site cache cleared. All visitors will see fresh content.");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">Site cache</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Clearing the cache forces every visitor to receive fresh content from the API on their next request.
          Run this after publishing or major edits if changes don't appear immediately.
        </p>
        <button
          onClick={() => clearMut.mutate()}
          disabled={clearMut.isPending}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {clearMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Clear all cache
        </button>
      </div>
    </div>
  );
}
