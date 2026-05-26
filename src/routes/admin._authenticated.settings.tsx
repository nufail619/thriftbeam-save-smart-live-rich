import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { settingsApi, type SettingsMap } from "@/lib/api/settings";

export const Route = createFileRoute("/admin/_authenticated/settings")({
  component: SettingsPage,
});

const TABS = ["General", "Reading", "Discussion", "Permalinks"] as const;
type Tab = (typeof TABS)[number];

const FIELDS: Record<Tab, { key: string; label: string; type?: "text" | "number" | "checkbox" | "textarea" }[]> = {
  General: [
    { key: "site_title", label: "Site title" },
    { key: "tagline", label: "Tagline" },
    { key: "admin_email", label: "Admin email" },
    { key: "timezone", label: "Timezone" },
    { key: "date_format", label: "Date format" },
    { key: "language", label: "Language" },
  ],
  Reading: [
    { key: "posts_per_page", label: "Posts per page", type: "number" },
    { key: "excerpt_length", label: "Excerpt length", type: "number" },
  ],
  Discussion: [
    { key: "allow_comments", label: "Allow comments", type: "checkbox" },
    { key: "require_approval", label: "Require approval", type: "checkbox" },
    { key: "close_after_days", label: "Close after N days", type: "number" },
    { key: "blacklist", label: "Blacklist (one word per line)", type: "textarea" },
  ],
  Permalinks: [
    { key: "permalink_structure", label: "Structure" },
  ],
};

function SettingsPage() {
  const [tab, setTab] = useState<Tab>("General");
  const [draft, setDraft] = useState<SettingsMap>({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.getAll(),
  });

  useEffect(() => { if (data) setDraft(data); }, [data]);

  const set = (key: string, value: unknown) => setDraft((d) => ({ ...d, [key]: value }));

  const saveTab = async () => {
    setSaving(true);
    try {
      const keys = FIELDS[tab].map((f) => f.key);
      await Promise.all(keys.map((k) => settingsApi.update(k, draft[k])));
      toast.success(`${tab} saved`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-semibold ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {isError && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Failed to load settings: {(error as Error).message}</span>
        </div>
      )}

      <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 space-y-3">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading settings…</div>
        ) : (
          <>
            {FIELDS[tab].map((f) => {
              const v = draft[f.key];
              if (f.type === "checkbox") {
                return (
                  <label key={f.key} className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-medium">{f.label}</span>
                    <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(f.key, e.target.checked)} />
                  </label>
                );
              }
              if (f.type === "textarea") {
                return (
                  <Field key={f.key} label={f.label}>
                    <textarea rows={4} className="input min-h-[100px] py-2 font-mono" value={typeof v === "string" ? v : ""} onChange={(e) => set(f.key, e.target.value)} />
                  </Field>
                );
              }
              return (
                <Field key={f.key} label={f.label}>
                  <input
                    type={f.type ?? "text"}
                    className="input"
                    value={v == null ? "" : String(v)}
                    onChange={(e) => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                  />
                </Field>
              );
            })}
            <div className="flex justify-end pt-3 border-t border-border mt-3">
              <button disabled={saving} onClick={saveTab} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Save {tab}
              </button>
            </div>
          </>
        )}
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
