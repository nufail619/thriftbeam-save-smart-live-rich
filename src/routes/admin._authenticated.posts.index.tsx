import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  CheckCircle2,
  Pencil as PencilIcon,
  Calendar,
  Plus,
  MoreVertical,
  Eye,
  Copy,
  Trash2,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import AdminBadge from "@/components/admin/Badge";
import EmptyState from "@/components/admin/EmptyState";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { usePosts, postsApi } from "@/lib/adminStore";
import { CATEGORIES, AUTHORS, type AdminPost, type AdminPostStatus } from "@/lib/mockAdminData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin/_authenticated/posts/")({
  component: PostsPage,
});

const TABS: { key: "all" | AdminPostStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Draft" },
  { key: "scheduled", label: "Scheduled" },
  { key: "trash", label: "Trash" },
];

function PostsPage() {
  const posts = usePosts();
  const [tab, setTab] = useState<"all" | AdminPostStatus>("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [author, setAuthor] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ ids: string[]; mode: "trash" | "delete" } | null>(null);

  const counts = useMemo(() => ({
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
    scheduled: posts.filter((p) => p.status === "scheduled").length,
  }), [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (tab === "all" ? p.status === "trash" : p.status !== tab) return false;
      if (category !== "all" && p.category !== category) return false;
      if (author !== "all" && p.author !== author) return false;
      const q = query.trim().toLowerCase();
      if (q && !p.title.toLowerCase().includes(q) && !p.slug.includes(q)) return false;
      return true;
    });
  }, [posts, tab, category, author, query]);

  const allChecked = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) filtered.forEach((p) => next.delete(p.id));
    else filtered.forEach((p) => next.add(p.id));
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectedIds = Array.from(selected).filter((id) => filtered.some((p) => p.id === id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-sm text-muted-foreground">Create, edit and organize your blog content.</p>
        </div>
        <Link
          to="/admin/posts/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New post
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total posts" value={counts.total} icon={FileText} />
        <StatCard label="Published" value={counts.published} icon={CheckCircle2} />
        <StatCard label="Drafts" value={counts.draft} icon={PencilIcon} />
        <StatCard label="Scheduled" value={counts.scheduled} icon={Calendar} />
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold",
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title or slug…"
              className="h-9 w-56 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm"
            >
              <option value="all">All authors</option>
              {AUTHORS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 border-b border-border bg-primary/5 px-4 py-2 text-sm">
            <span className="font-medium">{selectedIds.length} selected</span>
            <div className="ml-auto flex gap-2">
              <button onClick={() => { postsApi.bulkSetStatus(selectedIds, "published"); toast.success("Published"); setSelected(new Set()); }} className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-muted">Publish</button>
              <button onClick={() => { postsApi.bulkSetStatus(selectedIds, "draft"); toast.success("Moved to draft"); setSelected(new Set()); }} className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-muted">Draft</button>
              <button onClick={() => setConfirm({ ids: selectedIds, mode: "trash" })} className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-muted">Trash</button>
              <button onClick={() => setConfirm({ ids: selectedIds, mode: "delete" })} className="h-8 rounded-md bg-destructive px-3 text-xs font-semibold text-destructive-foreground hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={FileText} title="No posts here" description="Try a different filter or create a new post." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="w-10 px-4 py-2">
                    <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select all" />
                  </th>
                  <th className="px-2 py-2">Post</th>
                  <th className="px-2 py-2">Author</th>
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2 text-right">Views</th>
                  <th className="px-2 py-2">Date</th>
                  <th className="w-12 px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <PostRow
                    key={p.id}
                    post={p}
                    checked={selected.has(p.id)}
                    onToggle={() => toggleOne(p.id)}
                    onTrash={() => setConfirm({ ids: [p.id], mode: "trash" })}
                    onDelete={() => setConfirm({ ids: [p.id], mode: "delete" })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(v) => !v && setConfirm(null)}
        title={confirm?.mode === "delete" ? "Delete permanently?" : "Move to trash?"}
        description={
          confirm?.mode === "delete"
            ? `This will permanently delete ${confirm.ids.length} post(s). This cannot be undone.`
            : `This will move ${confirm?.ids.length} post(s) to trash.`
        }
        confirmLabel={confirm?.mode === "delete" ? "Delete" : "Move to trash"}
        destructive
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.mode === "delete") {
            postsApi.bulkRemove(confirm.ids);
            toast.success("Deleted");
          } else {
            postsApi.bulkSetStatus(confirm.ids, "trash");
            toast.success("Moved to trash");
          }
          setSelected(new Set());
          setConfirm(null);
        }}
      />
    </div>
  );
}

function PostRow({
  post,
  checked,
  onToggle,
  onTrash,
  onDelete,
}: {
  post: AdminPost;
  checked: boolean;
  onToggle: () => void;
  onTrash: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30">
      <td className="px-4 py-3">
        <input type="checkbox" checked={checked} onChange={onToggle} aria-label={`Select ${post.title}`} />
      </td>
      <td className="px-2 py-3">
        <div className="flex items-center gap-3">
          {post.thumbnail ? (
            <img src={post.thumbnail} alt="" className="h-10 w-10 flex-none rounded-md object-cover" />
          ) : (
            <div className="h-10 w-10 flex-none rounded-md bg-muted" />
          )}
          <div className="min-w-0">
            <Link to="/admin/posts/$id/edit" params={{ id: post.id }} className="line-clamp-1 font-medium hover:text-primary">
              {post.title}
            </Link>
            <p className="line-clamp-1 text-xs text-muted-foreground">/blog/{post.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-2 py-3 text-muted-foreground">{post.author}</td>
      <td className="px-2 py-3 text-muted-foreground">{post.category}</td>
      <td className="px-2 py-3"><AdminBadge variant={post.status}>{post.status}</AdminBadge></td>
      <td className="px-2 py-3 text-right tabular-nums text-muted-foreground">{post.views.toLocaleString()}</td>
      <td className="px-2 py-3 text-muted-foreground">{post.date}</td>
      <td className="px-2 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted" aria-label="Row actions">
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/admin/posts/$id/edit" params={{ id: post.id }}>
                <PencilIcon className="mr-2 h-3.5 w-3.5" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast("Preview is mock")}>
              <Eye className="mr-2 h-3.5 w-3.5" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { postsApi.duplicate(post.id); toast.success("Duplicated"); }}>
              <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
            </DropdownMenuItem>
            {post.status === "trash" ? (
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete forever
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={onTrash} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Move to trash
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
