import { createFileRoute, redirect, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { isAuthenticated } from "@/lib/adminAuth";

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
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({
        to: "/admin/login",
        search: { redirect: window.location.pathname + window.location.search },
        replace: true,
      });
      return;
    }
    setReady(true);
  }, [navigate]);

  if (!ready) return null;

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
