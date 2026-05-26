import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Reply,
  Check,
  Undo2,
  ShieldOff,
  X,
} from "lucide-react";
import StatCard from "@/components/admin/StatCard";
import EmptyState from "@/components/admin/EmptyState";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useComments, commentsApi } from "@/lib/adminStore";
import type { CommentStatus, AdminComment } from "@/lib/mockAdminData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authenticated/comments")({
  component: CommentsPage,
});

const TABS: { key: "all" | CommentStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "spam", label: "Spam" },
  { key: "trash", label: "Trash" },
];

function CommentsPage() {
  const comments = useComments();
  const [tab, setTab] = useState<"all" | CommentStatus>("pending");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [replyOpen, setReplyOpen] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [confirmDel, setConfirmDel] = useState<string[] | null>(null);

  const counts = useMemo(() => ({
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    spam: comments.filter((c) => c.status === "spam").length,
    trash: comments.filter((c) => c.status === "trash").length,
  }), [comments]);

  const filtered = comments.filter((c) => tab === "all" ? c.status !== "trash" : c.status === tab);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectedIds = Array.from(selected).filter((id) => filtered.some((c) => c.id === id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Comments</h1>
        <p className="text-sm text-muted-foreground">Moderate reader discussions across your posts.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Pending" value={counts.pending} icon={MessageCircle} />
        <StatCard label="Approved" value={counts.approved} icon={CheckCircle2} />
        <StatCard label="Spam" value={counts.spam} icon={AlertTriangle} />
        <StatCard label="Trash" value={counts.trash} icon={Trash2} />
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
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 border-b border-border bg-primary/5 px-4 py-2 text-sm">
            <span className="font-medium">{selectedIds.length} selected</span>
            <div className="ml-auto flex flex-wrap gap-2">
              <button onClick={() => { commentsApi.bulkSetStatus(selectedIds, "approved"); toast.success("Approved"); setSelected(new Set()); }} className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-muted">Approve</button>
              <button onClick={() => { commentsApi.bulkSetStatus(selectedIds, "spam"); toast.success("Marked spam"); setSelected(new Set()); }} className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-muted">Spam</button>
              <button onClick={() => { commentsApi.bulkSetStatus(selectedIds, "trash"); toast.success("Trashed"); setSelected(new Set()); }} className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-muted">Trash</button>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={MessageCircle} title="No comments here" />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((c) => (
              <CommentCard
                key={c.id}
                c={c}
                checked={selected.has(c.id)}
                onToggle={() => toggle(c.id)}
                replyOpen={replyOpen === c.id}
                onReplyToggle={() => { setReplyOpen(replyOpen === c.id ? null : c.id); setReplyText(""); }}
                replyText={replyText}
                setReplyText={setReplyText}
                onDelete={() => setConfirmDel([c.id])}
              />
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDel}
        onOpenChange={(v) => !v && setConfirmDel(null)}
        title="Delete forever?"
        description="This comment cannot be recovered."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (confirmDel) { commentsApi.bulkRemove(confirmDel); toast.success("Deleted"); }
          setConfirmDel(null);
        }}
      />
    </div>
  );
}

function CommentCard({
  c, checked, onToggle, replyOpen, onReplyToggle, replyText, setReplyText, onDelete,
}: {
  c: AdminComment;
  checked: boolean;
  onToggle: () => void;
  replyOpen: boolean;
  onReplyToggle: () => void;
  replyText: string;
  setReplyText: (v: string) => void;
  onDelete: () => void;
}) {
  const setStatus = (status: CommentStatus, msg: string) => { commentsApi.setStatus(c.id, status); toast.success(msg); };
  return (
    <li className="px-4 py-4">
      <div className="flex gap-3">
        <input type="checkbox" checked={checked} onChange={onToggle} className="mt-1.5" aria-label={`Select comment from ${c.author}`} />
        <img src={c.gravatar} alt="" className="h-10 w-10 flex-none rounded-full bg-muted" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2 text-sm">
            <span className="font-semibold">{c.author}</span>
            <span className="text-xs text-muted-foreground">&lt;{c.email}&gt;</span>
            <span className="text-xs text-muted-foreground">on</span>
            <span className="text-xs font-medium text-primary">{c.postTitle}</span>
            <span className="ml-auto text-xs text-muted-foreground">{c.date}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed">{c.body}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {c.status !== "approved" ? (
              <button onClick={() => setStatus("approved", "Approved")} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 font-medium hover:bg-muted">
                <Check className="h-3 w-3" /> Approve
              </button>
            ) : (
              <button onClick={() => setStatus("pending", "Unapproved")} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 font-medium hover:bg-muted">
                <Undo2 className="h-3 w-3" /> Unapprove
              </button>
            )}
            <button onClick={onReplyToggle} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 font-medium hover:bg-muted">
              <Reply className="h-3 w-3" /> Reply
            </button>
            {c.status !== "spam" && (
              <button onClick={() => setStatus("spam", "Marked spam")} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 font-medium hover:bg-muted">
                <ShieldOff className="h-3 w-3" /> Spam
              </button>
            )}
            {c.status !== "trash" ? (
              <button onClick={() => setStatus("trash", "Trashed")} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 font-medium hover:bg-muted">
                <Trash2 className="h-3 w-3" /> Trash
              </button>
            ) : (
              <button onClick={onDelete} className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1 font-medium text-destructive hover:bg-destructive/15">
                <X className="h-3 w-3" /> Delete forever
              </button>
            )}
          </div>
          {replyOpen && (
            <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                placeholder="Write a reply…"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={onReplyToggle} className="h-8 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-muted">Cancel</button>
                <button
                  onClick={() => { if (!replyText.trim()) return; toast.success("Reply sent (mock)"); onReplyToggle(); }}
                  className="h-8 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Send reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
