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
import { cacheApi } from "@/lib/api/siteSettings";
import { CATEGORIES, type AdminPost, type AdminPostStatus } from "@/lib/mockAdminData";

type Mode = "new" | "edit";

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
}

const blankPost: Omit<AdminPost, "id"> = {
  title: "",
  slug: "",
  author: "ThriftBeam Team",
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

  const invalidateAll = async () => {
    qc.invalidateQueries({ queryKey: ["posts"] });
    qc.invalidateQueries({ queryKey: ["homepage"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["public-posts"] });
    try {
      await cacheApi.clear();
    } catch {
      // non-fatal
    }
  };

  const save = async (status: AdminPostStatus) => {
    if (!(post.title ?? "").trim()) {
      toast.error("Title is required");
      return;
    }
    const payload = { ...post, status, slug: post.slug || slugify(post.title) } as AdminPost;
    try {
      if (mode === "new") {
        const created = await createMut.mutateAsync(payload);
        if (!created?.id) {
          toast.error("Server did not return a post id");
          return;
        }
        qc.setQueryData(["posts", created.id], created);
        await invalidateAll();
        toast.success(status === "published" ? "Published! Live on site in 5 seconds." : "Draft saved");
        navigate({ to: "/admin/posts/$id/edit", params: { id: created.id } });
      } else {
        const id = (initial as AdminPost).id;
        const updated = await updateMut.mutateAsync({ id, payload });
        qc.setQueryData(["posts", id], updated);
        await invalidateAll();
        toast.success(status === "published" ? "Published! Live on site in 5 seconds." : "Saved");
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
