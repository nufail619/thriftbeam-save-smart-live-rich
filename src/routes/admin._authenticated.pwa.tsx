import { createFileRoute } from "@tanstack/react-router";
import ComingSoon from "@/components/admin/ComingSoon";

export const Route = createFileRoute("/admin/_authenticated/pwa")({
  component: () => <ComingSoon title="PWA & Push" phase="C" />,
});
