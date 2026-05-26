import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import RichEditor from "./RichEditor";
import SeoPanel from "./SeoPanel";
import TagInput from "./TagInput";
import MediaPickerModal from "./MediaPickerModal";
import { postsApi } from "@/lib/api/posts";
import { AUTHORS, CATEGORIES, type AdminPost, type AdminPostStatus } from "@/lib/mockAdminData";

type Mode = "new" | "edit";

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
}

const blankPost: Omit<AdminPost, "id"> = {
  title: "",
  slug: "",
  author: AUTHORS[0],
  category: CATEGORIES[0],
  status: "draft",
  views: 0,
  date: new Date().toISOString().slice(0, 10),
  thumbnail: "",
  excerpt: "",
  content: "",
  tags: [],
  featuredImage: "",
  seoTitle: "",
  seoDescription: "",
  readingTime: 3,
};

export default function PostEditor({ mode, initial }: { mode: Mode; initial?: AdminPost }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [post, setPost] = useState<AdminPost | Omit<AdminPost, "id">>(
    initial ?? blankPost,
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const dirtyRef = useRef(false);

  const update = (patch: Partial<AdminPost>) => {
    setPost((p) => ({ ...p, ...patch }) as AdminPost);
    dirtyRef.current = true;
  };

  useEffect(() => {
    if (!slugTouched) {
      setPost((p) => ({ ...p, slug: slugify(p.title) }) as AdminPost);
    }
  }, [post.title, slugTouched]);

  useEffect(() => {
    if (!dirtyRef.current) return;
    const t = setTimeout(() => {
      setSavedAt(new Date().toLocaleTimeString());
      dirtyRef.current = false;
    }, 2000);
    return () => clearTimeout(t);
  }, [post]);

  const createMut = useMutation({ mutationFn: (payload: Partial<AdminPost>) => postsApi.create(payload) });
  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminPost> }) => postsApi.update(id, payload),
  });
  const saving = createMut.isPending || updateMut.isPending;

  const save = async (status: AdminPostStatus) => {
    if (!post.title.trim()) {
      toast.error("Title is required");
      return;
    }
    const payload = { ...post, status, slug: post.slug || slugify(post.title) } as AdminPost;
    try {
      if (mode === "new") {
        const created = await createMut.mutateAsync(payload);
        qc.invalidateQueries({ queryKey: ["posts"] });
        toast.success(status === "published" ? "Post published" : "Draft saved");
        navigate({ to: "/admin/posts/$id/edit", params: { id: created.id } });
      } else {
        const id = (initial as AdminPost).id;
        const updated = await updateMut.mutateAsync({ id, payload });
        qc.setQueryData(["posts", id], updated);
        qc.invalidateQueries({ queryKey: ["posts"] });
        toast.success(status === "published" ? "Post published" : "Saved");
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{mode === "new" ? "New post" : "Edit post"}</h1>
          {savedAt && <p className="text-xs text-muted-foreground">Auto-saved {savedAt}</p>}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate({ to: "/admin/posts" })}
            className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save("draft")}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save draft
          </button>
          <button
            type="button"
            onClick={() => window.open(post.slug ? `/blog/${post.slug}` : "/", "_blank")}
            className="h-9 rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
          >
            Preview
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save("published")}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <input
            value={post.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Post title"
            className="h-14 w-full rounded-xl border border-border bg-card px-4 text-2xl font-bold outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
            <span className="text-xs text-muted-foreground">/blog/</span>
            <input
              value={post.slug}
              onChange={(e) => {
                setSlugTouched(true);
                update({ slug: slugify(e.target.value) });
              }}
              placeholder="post-slug"
              className="h-7 w-full bg-transparent text-sm outline-none"
            />
          </div>
          <RichEditor value={post.content} onChange={(html) => update({ content: html })} />
          <label className="block">
            <span className="text-sm font-medium">Excerpt</span>
            <textarea
              value={post.excerpt}
              onChange={(e) => update({ excerpt: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Short summary used in cards and SEO previews"
            />
          </label>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Publish</h2>
            <div className="mt-3 space-y-3 text-sm">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Status</span>
                <select
                  value={post.status}
                  onChange={(e) => update({ status: e.target.value as AdminPostStatus })}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Date</span>
                <input
                  type="date"
                  value={post.date}
                  onChange={(e) => update({ date: e.target.value })}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Taxonomy</h2>
            <div className="mt-3 space-y-3 text-sm">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Author</span>
                <select
                  value={post.author}
                  onChange={(e) => update({ author: e.target.value })}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                >
                  {AUTHORS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Category</span>
                <select
                  value={post.category}
                  onChange={(e) => update({ category: e.target.value })}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <div>
                <span className="text-xs font-medium text-muted-foreground">Tags</span>
                <div className="mt-1">
                  <TagInput tags={post.tags} onChange={(tags) => update({ tags })} />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Featured image</h2>
            {post.featuredImage ? (
              <div className="relative mt-3 overflow-hidden rounded-lg">
                <img src={post.featuredImage} alt="" className="aspect-video w-full object-cover" />
                <button
                  type="button"
                  onClick={() => update({ featuredImage: "", thumbnail: "" })}
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-foreground/80 text-background"
                  aria-label="Remove featured image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="mt-3 flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground hover:border-primary hover:text-primary"
              >
                <ImageIcon className="h-6 w-6" />
                Choose image
              </button>
            )}
          </section>

          <SeoPanel
            title={post.seoTitle}
            description={post.seoDescription}
            slug={post.slug}
            onChange={update}
          />
        </aside>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(it) => {
          update({ featuredImage: it.url, thumbnail: it.url });
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
