import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import PostEditor from "@/components/admin/PostEditor";
import { postsApi } from "@/lib/api/posts";

export const Route = createFileRoute("/admin/_authenticated/posts/$id/edit")({
  component: EditPostRoute,
});

function EditPostRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["posts", id],
    queryFn: () => postsApi.get(id),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading post…
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        Failed to load post: {(error as Error)?.message ?? "Not found"}.{" "}
        <button className="underline" onClick={() => navigate({ to: "/admin/posts" })}>Back to posts</button>
      </div>
    );
  }
  return <PostEditor mode="edit" initial={data} />;
}
