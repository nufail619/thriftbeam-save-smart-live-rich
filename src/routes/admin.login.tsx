import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Lock } from "lucide-react";
import { login, getLockoutInfo, isAuthenticated } from "@/lib/adminAuth";

type Search = { redirect?: string };

export const Route = createFileRoute("/admin/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (typeof window === "undefined") return;
    if (isAuthenticated()) {
      throw redirect({ to: search.redirect ?? "/admin" });
    }
  },
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

function formatRemaining(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [showPw, setShowPw] = useState(false);
  const [lock, setLock] = useState(() =>
    typeof window === "undefined" ? { locked: false, unlockAt: null as number | null, remaining: 5 } : getLockoutInfo(),
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!lock.locked) return;
    const i = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(i);
  }, [lock.locked]);

  useEffect(() => {
    if (lock.locked && lock.unlockAt && now >= lock.unlockAt) {
      setLock(getLockoutInfo());
    }
  }, [now, lock]);

  const countdown = useMemo(
    () => (lock.unlockAt ? formatRemaining(lock.unlockAt - now) : null),
    [lock.unlockAt, now],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async (values: FormValues) => {
    const result = await login(values.email, values.password);
    if (result.ok) {
      toast.success("Welcome back");
      navigate({ to: search.redirect ?? "/admin" });
      return;
    }
    if (result.reason === "locked") {
      setLock(getLockoutInfo());
      toast.error("Too many attempts. Try again later.");
      return;
    }
    const info = getLockoutInfo();
    setLock(info);
    if (info.locked) {
      toast.error("Locked out for 15 minutes after 5 failed attempts.");
    } else {
      toast.error(
        result.message
          ? `${result.message}. ${info.remaining} attempt${info.remaining === 1 ? "" : "s"} left.`
          : `Invalid credentials. ${info.remaining} attempt${info.remaining === 1 ? "" : "s"} left.`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--admin-bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-extrabold">
            T
          </div>
          <p className="text-xl font-bold tracking-tight">ThriftBeam</p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Admin Panel</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <h1 className="text-xl font-bold">Admin Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with your administrator credentials.
          </p>

          {lock.locked && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              <Lock className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Account temporarily locked</p>
                <p className="text-destructive/80">Try again in {countdown}</p>
              </div>
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                disabled={lock.locked}
                {...form.register("email")}
                className="mt-1 h-12 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                placeholder="you@example.com"
              />

              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={lock.locked}
                  {...form.register("password")}
                  className="h-12 w-full rounded-lg border border-border bg-background px-3 pr-11 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  {...form.register("remember")}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => toast("Password reset coming soon")}
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={lock.locked || form.formState.isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Sign in
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
