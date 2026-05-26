import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/admin/ComingSoon";

export const Route = createFileRoute("/admin/_authenticated/seo")({
  component: () => <ComingSoon title="SEO" phase="C" />,
});
