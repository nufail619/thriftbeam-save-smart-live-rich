import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/admin/ComingSoon";

export const Route = createFileRoute("/admin/_authenticated/posts/new")({
  component: () => <ComingSoon title="New Post" phase="B" />,
});
