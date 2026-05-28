import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { useSettingsGroup } from "@/context/SettingsContext";

type AnnouncementSettings = {
  enabled?: boolean;
  text?: string;
  link?: string;
  link_label?: string;
  background?: string;
  textColor?: string;
  text_color?: string;
};

export default function AnnouncementBar() {
  const a = useSettingsGroup<AnnouncementSettings>("announcement");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("tb_announce_dismissed") !== "1") setShow(true);
  }, []);

  if (!show || !a.enabled || !a.text) return null;

  const bg = a.background || "var(--primary)";
  const fg = a.textColor || a.text_color || "var(--primary-foreground)";

  return (
    <div className="text-sm" style={{ background: bg, color: fg }}>
      <div className="container-page flex items-center justify-center gap-3 py-2 relative">
        <Sparkles className="h-4 w-4 hidden sm:block" />
        <p className="text-center">
          {a.text}
          {a.link && (
            <>
              {" "}
              <a href={a.link} className="underline font-semibold">
                {a.link_label || "Learn more"}
              </a>
            </>
          )}
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
