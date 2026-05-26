import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/admin/ComingSoon";

export const Route = createFileRoute("/admin/_authenticated/pages")({
  component: () => <ComingSoon title="Pages" phase="B" />,
});
