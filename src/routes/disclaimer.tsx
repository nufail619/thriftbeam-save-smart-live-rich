import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/disclaimer")({
  component: () => <div className="container-page py-20 text-center text-muted-foreground">Disclaimer — coming in Phase 3</div>,
});
