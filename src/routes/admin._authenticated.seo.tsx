import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { publicPostsApi } from "@/lib/api/publicPosts";
import { pagesApi } from "@/lib/api/pages";

export const Route = createFileRoute("/admin/_authenticated/seo")({
  component: SeoPage,
});

const TABS = ["Global", "Sitemap", "Robots"] as const;

function SeoPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Global");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-border">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-semibold ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>
      {tab === "Global" && <GlobalTab />}
      {tab === "Sitemap" && <SitemapTab />}
      {tab === "Robots" && <RobotsTab />}
    </div>
  );
}

type SeoDraft = {
  title_template: string;
  meta_description: string;
  og_image: string;
  twitter_handle: string;
  org_name: string;
  org_url: string;
};

function GlobalTab() {
  const { draft, set, save, saving, isLoading } = useSettingsForm<SeoDraft>("seo", {
    title_template: "%title% — ThriftBeam",
    meta_description: "Practical guides, calculators, and weekly newsletters.",
    og_image: "",
    twitter_handle: "@thriftbeam",
    org_name: "ThriftBeam",
    org_url: "https://thriftbeam.com",
  });

  if (isLoading) {
    return <div className="flex h-40 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6">
      <Field label="Title template"><input className="input" value={draft.title_template} onChange={(e) => set("title_template", e.target.value)} /></Field>
      <Field label="Default meta description"><textarea rows={3} className="input min-h-[80px] py-2" value={draft.meta_description} onChange={(e) => set("meta_description", e.target.value)} /></Field>
      <Field label="Default OG image URL"><input className="input" value={draft.og_image} onChange={(e) => set("og_image", e.target.value)} placeholder="https://…" /></Field>
      <Field label="Twitter handle"><input className="input" value={draft.twitter_handle} onChange={(e) => set("twitter_handle", e.target.value)} /></Field>
      <Field label="Organization name"><input className="input" value={draft.org_name} onChange={(e) => set("org_name", e.target.value)} /></Field>
      <Field label="Organization URL"><input className="input" value={draft.org_url} onChange={(e) => set("org_url", e.target.value)} /></Field>
      <div className="flex justify-end">
        <button disabled={saving} onClick={save} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
        </button>
      </div>
      <style>{`.input{display:block;width:100%;height:40px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);padding:0 12px;font-size:14px}`}</style>
    </div>
  );
}

function SitemapTab() {
  const { data: postsRes } = useQuery({ queryKey: ["posts", "sitemap"], queryFn: () => publicPostsApi.list({ per_page: 100 }) });
  const { data: pages = [] } = useQuery({ queryKey: ["pages"], queryFn: () => pagesApi.list() });
  const posts = postsRes?.posts ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: "/", mod: today },
    ...pages.filter((p) => p.status === "published").map((p) => ({ loc: `/${p.slug}`, mod: p.lastEdited })),
    ...posts.slice(0, 30).map((p) => ({ loc: `/blog/${p.slug}`, mod: (p.date ?? today).slice(0, 10) })),
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{urls.length} URLs in sitemap</p>
        <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-semibold hover:bg-muted">
          <RefreshCw className="h-4 w-4" /> View XML
        </a>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <ul className="divide-y divide-border">
          {urls.map((u) => (
            <li key={u.loc} className="flex items-center justify-between px-4 py-2.5 text-sm">
              <code className="font-mono">{u.loc}</code>
              <span className="text-xs text-muted-foreground">{u.mod}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type RobotsDraft = { robots_txt: string };

function RobotsTab() {
  const { draft, set, save, saving, isLoading } = useSettingsForm<RobotsDraft>("seo", {
    robots_txt: "User-agent: *\nAllow: /\nSitemap: https://thriftbeam.com/sitemap.xml",
  });
  if (isLoading) return <div className="flex h-40 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</div>;
  return (
    <div className="space-y-4">
      <textarea rows={14} className="w-full rounded-2xl border border-border bg-card p-4 font-mono text-sm" value={draft.robots_txt} onChange={(e) => set("robots_txt", e.target.value)} />
      <div className="flex justify-end">
        <button disabled={saving} onClick={() => { save(); toast.success("robots.txt saved"); }} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60">
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
        </button>
      </div>
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
