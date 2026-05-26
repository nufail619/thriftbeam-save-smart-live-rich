import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useSettings, usePages, settingsApi } from "@/lib/adminStore";

export const Route = createFileRoute("/admin/_authenticated/settings")({
  component: SettingsPage,
});

const TABS = ["General", "Reading", "Writing", "Discussion", "Permalinks"] as const;
type Tab = (typeof TABS)[number];

function SettingsPage() {
  const [tab, setTab] = useState<Tab>("General");
  const s = useSettings();
  const pages = usePages();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-semibold ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      <div className="max-w-2xl rounded-2xl border border-border bg-card p-6 space-y-3">
        {tab === "General" && (
          <>
            <Field label="Site title"><input className="input" value={s.general.siteTitle} onChange={(e) => settingsApi.update("general", { siteTitle: e.target.value })} /></Field>
            <Field label="Tagline"><input className="input" value={s.general.tagline} onChange={(e) => settingsApi.update("general", { tagline: e.target.value })} /></Field>
            <Field label="Admin email"><input type="email" className="input" value={s.general.adminEmail} onChange={(e) => settingsApi.update("general", { adminEmail: e.target.value })} /></Field>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Timezone"><input className="input" value={s.general.timezone} onChange={(e) => settingsApi.update("general", { timezone: e.target.value })} /></Field>
              <Field label="Date format"><input className="input" value={s.general.dateFormat} onChange={(e) => settingsApi.update("general", { dateFormat: e.target.value })} /></Field>
              <Field label="Language"><input className="input" value={s.general.language} onChange={(e) => settingsApi.update("general", { language: e.target.value })} /></Field>
            </div>
          </>
        )}

        {tab === "Reading" && (
          <>
            <Field label="Posts per page"><input type="number" className="input" value={s.reading.postsPerPage} onChange={(e) => settingsApi.update("reading", { postsPerPage: Number(e.target.value) })} /></Field>
            <Field label="Homepage displays">
              <select className="input" value={s.reading.homepageDisplay} onChange={(e) => settingsApi.update("reading", { homepageDisplay: e.target.value as "latest" | "page" })}>
                <option value="latest">Latest posts</option>
                <option value="page">A static page</option>
              </select>
            </Field>
            {s.reading.homepageDisplay === "page" && (
              <Field label="Homepage page">
                <select className="input" value={s.reading.homepagePageId} onChange={(e) => settingsApi.update("reading", { homepagePageId: e.target.value })}>
                  {pages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </Field>
            )}
            <Field label="Excerpt length"><input type="number" className="input" value={s.reading.excerptLength} onChange={(e) => settingsApi.update("reading", { excerptLength: Number(e.target.value) })} /></Field>
          </>
        )}

        {tab === "Writing" && (
          <>
            <Field label="Default category"><input className="input" value={s.writing.defaultCategory} onChange={(e) => settingsApi.update("writing", { defaultCategory: e.target.value })} /></Field>
            <Field label="Default post format">
              <select className="input" value={s.writing.defaultFormat} onChange={(e) => settingsApi.update("writing", { defaultFormat: e.target.value })}>
                <option value="standard">Standard</option>
                <option value="aside">Aside</option>
                <option value="quote">Quote</option>
                <option value="link">Link</option>
              </select>
            </Field>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm font-medium">Enable Markdown</span>
              <input type="checkbox" checked={s.writing.markdown} onChange={(e) => settingsApi.update("writing", { markdown: e.target.checked })} />
            </label>
          </>
        )}

        {tab === "Discussion" && (
          <>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm font-medium">Allow comments</span>
              <input type="checkbox" checked={s.discussion.allowComments} onChange={(e) => settingsApi.update("discussion", { allowComments: e.target.checked })} />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm font-medium">Require approval</span>
              <input type="checkbox" checked={s.discussion.requireApproval} onChange={(e) => settingsApi.update("discussion", { requireApproval: e.target.checked })} />
            </label>
            <Field label="Close after N days"><input type="number" className="input" value={s.discussion.closeAfterDays} onChange={(e) => settingsApi.update("discussion", { closeAfterDays: Number(e.target.value) })} /></Field>
            <Field label="Blacklist (one word per line)"><textarea rows={4} className="input min-h-[100px] py-2 font-mono" value={s.discussion.blacklist} onChange={(e) => settingsApi.update("discussion", { blacklist: e.target.value })} /></Field>
          </>
        )}

        {tab === "Permalinks" && (
          <>
            <Field label="Structure">
              <select className="input" value={s.permalinks.structure} onChange={(e) => settingsApi.update("permalinks", { structure: e.target.value })}>
                <option value="/blog/%postname%">/blog/%postname%</option>
                <option value="/%year%/%postname%">/%year%/%postname%</option>
                <option value="/%postname%">/%postname%</option>
                <option value="/?p=%post_id%">/?p=%post_id%</option>
              </select>
            </Field>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">Preview</p>
              <code className="text-sm">{s.permalinks.structure.replace("%postname%", "how-i-saved-5000").replace("%year%", "2026").replace("%post_id%", "42")}</code>
            </div>
          </>
        )}

        <div className="flex justify-end pt-3 border-t border-border mt-3">
          <button onClick={() => toast.success("Saved")} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">Save {tab}</button>
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
