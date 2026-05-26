// Admin auth — talks to real backend via /auth/login; stores token + user in localStorage.
// Lockout/attempt counting stays client-side UX only.
import { api, saveAuth, clearAuth } from "@/lib/api";

const TOKEN_KEY = "tb_token";
const USER_KEY = "tb_user";
const ATTEMPTS_KEY = "tb_attempts";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
};

const isBrowser = () => typeof window !== "undefined";
const isValidToken = (t: unknown): t is string =>
  typeof t === "string" && t !== "undefined" && t.length > 10;

export function getToken(): string | null {
  if (!isBrowser()) return null;
  const t = localStorage.getItem(TOKEN_KEY);
  return isValidToken(t) ? t : null;
}

export function getUser(): AdminUser | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

function readAttempts(): number[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(ATTEMPTS_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as number[];
    const cutoff = Date.now() - LOCKOUT_MS;
    return arr.filter((t) => t > cutoff);
  } catch {
    return [];
  }
}

function writeAttempts(arr: number[]) {
  if (!isBrowser()) return;
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(arr));
}

export function getLockoutInfo(): { locked: boolean; unlockAt: number | null; remaining: number } {
  const attempts = readAttempts();
  if (attempts.length < MAX_ATTEMPTS) {
    return { locked: false, unlockAt: null, remaining: MAX_ATTEMPTS - attempts.length };
  }
  const oldest = attempts[0];
  const unlockAt = oldest + LOCKOUT_MS;
  if (Date.now() >= unlockAt) {
    writeAttempts([]);
    return { locked: false, unlockAt: null, remaining: MAX_ATTEMPTS };
  }
  return { locked: true, unlockAt, remaining: 0 };
}

export function recordFailedAttempt() {
  const attempts = readAttempts();
  attempts.push(Date.now());
  writeAttempts(attempts);
}

export function clearAttempts() {
  if (!isBrowser()) return;
  localStorage.removeItem(ATTEMPTS_KEY);
}

export type LoginResult =
  | { ok: true; user: AdminUser }
  | { ok: false; reason: "locked" | "invalid"; unlockAt?: number; message?: string };

export async function login(email: string, password: string): Promise<LoginResult> {
  const lock = getLockoutInfo();
  if (lock.locked) return { ok: false, reason: "locked", unlockAt: lock.unlockAt! };

  try {
    const data = await api.post<{ token: string; user: AdminUser }>("/auth/login", {
      email: email.trim(),
      password,
    });
    if (!data?.token || !isValidToken(data.token)) {
      recordFailedAttempt();
      return { ok: false, reason: "invalid", message: "Invalid response from server" };
    }
    saveAuth(data.token, data.user);
    clearAttempts();
    return { ok: true, user: data.user };
  } catch (e) {
    recordFailedAttempt();
    return { ok: false, reason: "invalid", message: (e as Error)?.message };
  }
}

export function logout() {
  clearAuth();
}
