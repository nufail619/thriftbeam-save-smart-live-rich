import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "tb_cookies";

type Prefs = { necessary: true; analytics: boolean; advertising: boolean; marketing: boolean; ts: number };

function isFresh(p: Prefs | null): boolean {
  if (!p) return false;
  const ninetyDays = 1000 * 60 * 60 * 24 * 90;
  return Date.now() - p.ts < ninetyDays;
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, advertising: false, marketing: false });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: Prefs | null = raw ? JSON.parse(raw) : null;
      if (!isFresh(parsed)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  function save(custom = false) {
    const payload: Prefs = {
      necessary: true,
      analytics: custom ? prefs.analytics : true,
      advertising: custom ? prefs.advertising : true,
      marketing: custom ? prefs.marketing : true,
      ts: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setShow(false);
    setCustomize(false);
  }

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-5 animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto max-w-4xl rounded-2xl bg-card border border-border shadow-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4">
          <p className="text-sm text-foreground flex-1">
            We use cookies to improve your experience, analyze traffic, and personalize content. Choose what's right for you.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setCustomize(true)}
              className="h-11 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
            >
              Customize
            </button>
            <button
              onClick={() => save(false)}
              className="h-11 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {customize && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCustomize(false)}>
          <div className="w-full max-w-md rounded-2xl bg-background border border-border shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold">Cookie preferences</h3>
              <button onClick={() => setCustomize(false)} aria-label="Close" className="h-9 w-9 rounded-md hover:bg-muted inline-flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <Toggle label="Necessary" desc="Required for the site to function." checked disabled />
              <Toggle label="Analytics" desc="Anonymous usage data to improve the site." checked={prefs.analytics} onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))} />
              <Toggle label="Advertising" desc="Personalize ads you may see." checked={prefs.advertising} onChange={(v) => setPrefs((p) => ({ ...p, advertising: v }))} />
              <Toggle label="Marketing" desc="Email and campaign attribution." checked={prefs.marketing} onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))} />
            </div>
            <div className="px-5 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => save(true)} className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                Save preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Toggle({ label, desc, checked, onChange, disabled }: { label: string; desc: string; checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors flex-shrink-0 ${
          checked ? "bg-primary" : "bg-muted"
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        aria-pressed={checked}
        aria-label={label}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
