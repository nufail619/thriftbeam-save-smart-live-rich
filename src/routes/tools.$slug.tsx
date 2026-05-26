import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/tools/$slug")({
  component: () => <div className="container-page py-20 text-center text-muted-foreground">Calculator — coming in Phase 2</div>,
});
