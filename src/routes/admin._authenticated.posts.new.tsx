import { createFileRoute } from "@tanstack/react-router";
import PostEditor from "@/components/admin/PostEditor";

export const Route = createFileRoute("/admin/_authenticated/posts/new")({
  component: () => <PostEditor mode="new" />,
});
