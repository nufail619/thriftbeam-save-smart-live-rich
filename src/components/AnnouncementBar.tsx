import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function AnnouncementBar() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("tb_announce_dismissed") !== "1") setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div className="bg-primary text-primary-foreground text-sm">
      <div className="container-page flex items-center justify-center gap-3 py-2 relative">
        <Sparkles className="h-4 w-4 hidden sm:block" />
        <p className="text-center">
          🎉 New: Budget Calculator just launched —{" "}
          <Link to="/tools/$slug" params={{ slug: "budget-calculator" }} className="underline font-semibold">
            try it free
          </Link>
        </p>
        <button
          aria-label="Dismiss"
          onClick={() => {
            sessionStorage.setItem("tb_announce_dismissed", "1");
            setShow(false);
          }}
          className="absolute right-2 h-7 w-7 rounded inline-flex items-center justify-center hover:bg-white/15"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
