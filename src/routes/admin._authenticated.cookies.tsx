import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/admin/ComingSoon";

export const Route = createFileRoute("/admin/_authenticated/cookies")({
  component: () => <ComingSoon title="Cookies" phase="C" />,
});
