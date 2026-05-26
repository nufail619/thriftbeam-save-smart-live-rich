import { createFileRoute, redirect } from "@tanstack/react-router";
import AdminShell from "@/components/admin/AdminShell";
import { Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_authenticated")({
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;
    const token = window.localStorage.getItem("tb_token");
    if (!token) {
      throw redirect({
        to: "/admin/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AdminAuthLayout,
});

function AdminAuthLayout() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
