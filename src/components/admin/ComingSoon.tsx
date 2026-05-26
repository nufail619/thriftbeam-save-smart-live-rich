import EmptyState from "@/components/admin/EmptyState";
import { Construction } from "lucide-react";

export default function ComingSoon({ title, phase }: { title: string; phase: "B" | "C" }) {
  return (
    <div className="mx-auto max-w-2xl py-12">
      <EmptyState
        icon={Construction}
        title={`${title} — coming in Phase ${phase}`}
        description="This screen is part of the next admin build phase. The route and sidebar are wired up; the screen itself is on the way."
      />
    </div>
  );
}
