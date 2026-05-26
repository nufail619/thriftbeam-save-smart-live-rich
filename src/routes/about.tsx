import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/about")({
  component: () => <div className="container-page py-20 text-center text-muted-foreground">About — coming in Phase 3</div>,
});
