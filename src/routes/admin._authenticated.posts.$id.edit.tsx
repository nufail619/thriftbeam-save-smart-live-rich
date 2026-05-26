import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import PostEditor from "@/components/admin/PostEditor";
import { postsApi } from "@/lib/adminStore";

export const Route = createFileRoute("/admin/_authenticated/posts/$id/edit")({
  component: EditPostRoute,
});

function EditPostRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const post = postsApi.get(id);

  useEffect(() => {
    if (!post) navigate({ to: "/admin/posts", replace: true });
  }, [post, navigate]);

  if (!post) return null;
  return <PostEditor mode="edit" initial={post} />;
}
