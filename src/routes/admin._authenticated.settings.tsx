import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/admin/ComingSoon";

export const Route = createFileRoute("/admin/_authenticated/settings")({
  component: () => <ComingSoon title="General Settings" phase="C" />,
});
