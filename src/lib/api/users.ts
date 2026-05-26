import { api } from "@/lib/api";
import type { AdminUser, UserRole, UserStatus } from "@/lib/mockAdminData";

function norm(raw: unknown): AdminUser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = (raw as any)?.user ?? raw ?? {};
  const name = r.name ?? r.display_name ?? r.full_name ?? r.email ?? "";
  return {
    id: r.id != null ? String(r.id) : "",
    name,
    email: r.email ?? "",
    role: (r.role as UserRole) ?? "subscriber",
    status: (r.status as UserStatus) ?? "active",
    postsCount: Number(r.postsCount ?? r.posts_count ?? 0),
    lastLogin: r.lastLogin ?? r.last_login ?? "",
    avatar:
      r.avatar ??
      r.avatar_url ??
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || "u")}`,
  };
}

function list(raw: unknown): AdminUser[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  if (Array.isArray(r)) return r.map(norm);
  const arr = r?.items ?? r?.users ?? r?.data ?? [];
  return Array.isArray(arr) ? arr.map(norm) : [];
}

export type CreateUserPayload = {
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  password?: string;
};

export const usersApi = {
  list: async () => list(await api.get("/users")),
  create: async (payload: CreateUserPayload) => norm(await api.post("/users", payload)),
  update: async (id: string, payload: Partial<AdminUser> & { password?: string }) =>
    norm(await api.put(`/users/${id}`, payload)),
  remove: (id: string) => api.delete(`/users/${id}`),
};
