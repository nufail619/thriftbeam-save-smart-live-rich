import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCookies, cookiesApi } from "@/lib/adminStore";

export const Route = createFileRoute("/admin/_authenticated/cookies")({
  component: CookiesPage,
});

function CookiesPage() {
  const cookies = useCookies();
  const [text, setText] = useState("We use cookies to improve your experience. By using ThriftBeam, you agree to our cookie policy.");
  const [accept, setAccept] = useState("Accept all");
  const [decline, setDecline] = useState("Reject non-essential");
  const [position, setPosition] = useState<"bottom" | "top" | "bottom-left" | "bottom-right">("bottom");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-3 text-base font-semibold">Banner preview</h2>
          <div className={`rounded-xl p-4 ${theme === "dark" ? "bg-[#0f172a] text-white" : "bg-white text-foreground border border-border"}`}>
            <p className="text-sm">{text}</p>
            <div className="mt-3 flex gap-2">
              <button className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground">{accept}</button>
              <button className={`h-8 rounded-lg px-3 text-xs font-semibold ${theme === "dark" ? "border border-white/30" : "border border-border"}`}>{decline}</button>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Position: {position} · Theme: {theme}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold">Banner settings</h2>
        <Field label="Banner text"><textarea rows={3} className="input min-h-[80px] py-2" value={text} onChange={(e) => setText(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Accept label"><input className="input" value={accept} onChange={(e) => setAccept(e.target.value)} /></Field>
          <Field label="Decline label"><input className="input" value={decline} onChange={(e) => setDecline(e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Position">
            <select className="input" value={position} onChange={(e) => setPosition(e.target.value as typeof position)}>
              <option value="bottom">Bottom (full)</option>
              <option value="top">Top</option>
              <option value="bottom-left">Bottom left</option>
              <option value="bottom-right">Bottom right</option>
            </select>
          </Field>
          <Field label="Theme">
            <select className="input" value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Field>
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="mb-2 text-sm font-semibold">Categories</h3>
          <ul className="space-y-2">
            {cookies.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{c.name} {c.required && <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase">Required</span>}</p>
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
                <label className="inline-flex cursor-pointer items-center">
                  <input type="checkbox" disabled={c.required} checked={c.enabled || c.required} onChange={(e) => cookiesApi.update(c.id, { enabled: e.target.checked })} />
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => { cookiesApi.reset(); toast.success("Reset to defaults"); }} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Reset</button>
          <button onClick={() => toast.success("Cookie settings saved")} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Save</button>
        </div>
      </div>
      <style>{`.input{display:block;width:100%;height:40px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);padding:0 12px;font-size:14px}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
