// Mock admin auth — localStorage only. Wire to real backend later.
const TOKEN_KEY = "tb_token";
const USER_KEY = "tb_user";
const ATTEMPTS_KEY = "tb_attempts";

const ADMIN_EMAIL = "admin@thriftbeam.com";
const ADMIN_PASSWORD = "admin123";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin";
};

const isBrowser = () => typeof window !== "undefined";

function fakeJwt(payload: object): string {
  const enc = (o: object) =>
    btoa(JSON.stringify(o)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  const header = enc({ alg: "HS256", typ: "JWT" });
  const body = enc({ ...payload, iat: Date.now() });
  const sig = enc({ s: Math.random().toString(36).slice(2) });
  return `${header}.${body}.${sig}`;
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
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
  | { ok: false; reason: "locked" | "invalid"; unlockAt?: number };

export function login(email: string, password: string): LoginResult {
  const lock = getLockoutInfo();
  if (lock.locked) return { ok: false, reason: "locked", unlockAt: lock.unlockAt! };

  if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    recordFailedAttempt();
    return { ok: false, reason: "invalid" };
  }

  const user: AdminUser = {
    id: "u_admin_1",
    name: "Admin",
    email: ADMIN_EMAIL,
    role: "admin",
  };
  const token = fakeJwt({ sub: user.id, email: user.email, role: user.role });
  if (isBrowser()) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  clearAttempts();
  return { ok: true, user };
}

export function logout() {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
