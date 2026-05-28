import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useSettingsForm } from "@/hooks/useSettingsForm";

export const Route = createFileRoute("/admin/_authenticated/cookies")({
  component: CookiesPage,
});

type CookiesDraft = {
  enabled: boolean;
  text: string;
  accept_label: string;
  decline_label: string;
  position: "bottom" | "top" | "bottom-left" | "bottom-right";
  theme: "light" | "dark";
  policy_url: string;
};

function CookiesPage() {
  const { draft, set, save, saving, isLoading } = useSettingsForm<CookiesDraft>("cookies", {
    enabled: true,
    text: "We use cookies to improve your experience. By using ThriftBeam, you agree to our cookie policy.",
    accept_label: "Accept all",
    decline_label: "Reject non-essential",
    position: "bottom",
    theme: "light",
    policy_url: "/privacy",
  });

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-3 text-base font-semibold">Banner preview</h2>
        <div className={`rounded-xl p-4 ${draft.theme === "dark" ? "bg-[#0f172a] text-white" : "bg-white text-foreground border border-border"}`}>
          <p className="text-sm">{draft.text}</p>
          <div className="mt-3 flex gap-2">
            <button className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground">{draft.accept_label}</button>
            <button className={`h-8 rounded-lg px-3 text-xs font-semibold ${draft.theme === "dark" ? "border border-white/30" : "border border-border"}`}>{draft.decline_label}</button>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Position: {draft.position} · Theme: {draft.theme}</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold">Banner settings</h2>
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3">
          <span className="text-sm font-medium">Enable cookie banner</span>
          <input type="checkbox" checked={draft.enabled} onChange={(e) => set("enabled", e.target.checked)} />
        </label>
        <Field label="Banner text"><textarea rows={3} className="input min-h-[80px] py-2" value={draft.text} onChange={(e) => set("text", e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Accept label"><input className="input" value={draft.accept_label} onChange={(e) => set("accept_label", e.target.value)} /></Field>
          <Field label="Decline label"><input className="input" value={draft.decline_label} onChange={(e) => set("decline_label", e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Position">
            <select className="input" value={draft.position} onChange={(e) => set("position", e.target.value as CookiesDraft["position"])}>
              <option value="bottom">Bottom (full)</option>
              <option value="top">Top</option>
              <option value="bottom-left">Bottom left</option>
              <option value="bottom-right">Bottom right</option>
            </select>
          </Field>
          <Field label="Theme">
            <select className="input" value={draft.theme} onChange={(e) => set("theme", e.target.value as CookiesDraft["theme"])}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Field>
        </div>
        <Field label="Policy URL"><input className="input" value={draft.policy_url} onChange={(e) => set("policy_url", e.target.value)} /></Field>

        <div className="flex justify-end gap-2 pt-2">
          <button disabled={saving} onClick={save} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
          </button>
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
