import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Users as UsersIcon, Shield, Pencil, UserPlus } from "lucide-react";
import { toast } from "sonner";
import StatCard from "@/components/admin/StatCard";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useUsers, usersApi } from "@/lib/adminStore";
import type { AdminUser, UserRole } from "@/lib/mockAdminData";

export const Route = createFileRoute("/admin/_authenticated/users")({
  component: UsersPage,
});

const ROLES: UserRole[] = ["admin", "editor", "author", "subscriber"];

function UsersPage() {
  const users = useUsers();
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    editors: users.filter((u) => u.role === "editor").length,
    subscribers: users.filter((u) => u.role === "subscriber").length,
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "user", header: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          <img src={u.avatar} alt="" className="h-9 w-9 rounded-full" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{u.name}</p>
            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role", header: "Role",
      render: (u) => (
        <select
          value={u.role}
          onChange={(e) => {
            usersApi.update(u.id, { role: e.target.value as UserRole });
            toast.success(`Role updated to ${e.target.value}`);
          }}
          className="h-8 rounded-md border border-border bg-card px-2 text-xs font-semibold capitalize"
        >
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      ),
    },
    {
      key: "status", header: "Status",
      render: (u) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
          u.status === "active" ? "bg-[color:var(--success)]/10 text-[color:var(--success)]" : "bg-destructive/10 text-destructive"
        }`}>{u.status}</span>
      ),
    },
    { key: "posts", header: "Posts", accessor: (u) => u.postsCount, sortable: true, render: (u) => <span className="text-sm">{u.postsCount}</span> },
    { key: "last", header: "Last login", accessor: (u) => u.lastLogin, sortable: true, render: (u) => <span className="text-sm text-muted-foreground">{u.lastLogin}</span> },
    {
      key: "actions", header: "", className: "text-right",
      render: (u) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => setEditing(u)} className="text-xs font-semibold text-primary hover:underline">Edit</button>
          <button onClick={() => setDeleting(u)} className="text-xs font-semibold text-destructive hover:underline">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Manage admins, editors, authors, and subscribers.</p>
        <button onClick={() => setCreating(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <UserPlus className="h-4 w-4" /> Add user
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} icon={UsersIcon} />
        <StatCard label="Admins" value={stats.admins} icon={Shield} />
        <StatCard label="Editors" value={stats.editors} icon={Pencil} />
        <StatCard label="Subscribers" value={stats.subscribers} icon={UsersIcon} />
      </div>

      <DataTable rows={users} columns={columns} rowKey={(u) => u.id} searchable searchPlaceholder="Search users…" searchAccessor={(u) => `${u.name} ${u.email} ${u.role}`} />

      <UserModal
        open={creating || !!editing}
        onOpenChange={(v) => { if (!v) { setCreating(false); setEditing(null); } }}
        user={editing}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete user?"
        description={deleting ? `${deleting.name} will lose access immediately.` : ""}
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleting) { usersApi.remove(deleting.id); toast.success("User deleted"); }
          setDeleting(null);
        }}
      />
    </div>
  );
}

function UserModal({ open, onOpenChange, user }: { open: boolean; onOpenChange: (v: boolean) => void; user: AdminUser | null }) {
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<UserRole>(user?.role ?? "author");
  const [password, setPassword] = useState("");

  // reset when modal opens
  if (open && user && name !== user.name) {
    setName(user.name); setEmail(user.email); setRole(user.role);
  }

  const submit = () => {
    if (!name || !email) { toast.error("Name and email are required"); return; }
    if (user) {
      usersApi.update(user.id, { name, email, role });
      toast.success("User updated");
    } else {
      usersApi.create({ name, email, role, status: "active" });
      toast.success("User created");
    }
    onOpenChange(false);
    setName(""); setEmail(""); setRole("author"); setPassword("");
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={user ? "Edit user" : "Add user"}>
      <div className="space-y-3">
        <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} className="input" /></Field>
        <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" /></Field>
        <Field label="Role">
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="input capitalize">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        {!user && (
          <Field label="Password"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" /></Field>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => onOpenChange(false)} className="h-10 rounded-lg border border-border px-4 text-sm font-semibold hover:bg-muted">Cancel</button>
          <button onClick={submit} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90">{user ? "Save" : "Create"}</button>
        </div>
      </div>
      <style>{`.input{display:block;width:100%;height:40px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-card);padding:0 12px;font-size:14px}`}</style>
    </Modal>
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
