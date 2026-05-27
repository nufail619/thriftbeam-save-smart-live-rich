// Real API client for ThriftBeam PHP backend.
// Response envelope: { ok: true, data } on success, { error } on failure.

export const API_BASE = "https://api.thriftbeam.com";

const TOKEN_KEY = "tb_token";
const USER_KEY = "tb_user";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}

function isValidToken(t: unknown): t is string {
  return typeof t === "string" && t !== "undefined" && t.length > 10;
}

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  const t = window.localStorage.getItem(TOKEN_KEY);
  return isValidToken(t) ? t : null;
}

function handleUnauthorized() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  if (!window.location.pathname.startsWith("/admin/login")) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`/admin/login?redirect=${redirect}`);
  }
}

type RequestOpts = {
  method?: string;
  body?: unknown;
  formData?: FormData;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function apiFetch<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers: Record<string, string> = { Accept: "application/json", ...(opts.headers ?? {}) };
  const token = readToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(url, { method: opts.method ?? "GET", headers, body, signal: opts.signal });
  } catch (e) {
    throw new ApiError((e as Error)?.message || "Network error", 0);
  }

  if (res.status === 401) {
    handleUnauthorized();
    throw new ApiError("Unauthorized", 401);
  }

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      throw new ApiError(`Invalid JSON from ${path}`, res.status);
    }
  }

  const p = (payload ?? {}) as { ok?: boolean; data?: unknown; error?: string; message?: string };

  if (!res.ok || p.ok === false || p.error) {
    throw new ApiError(p.error || p.message || res.statusText || "Request failed", res.status);
  }

  return (p.data ?? payload) as T;
}

export const api = {
  get: <T = unknown>(path: string, opts?: Omit<RequestOpts, "method" | "body" | "formData">) =>
    apiFetch<T>(path, { ...opts, method: "GET" }),
  post: <T = unknown>(path: string, body?: unknown, opts?: Omit<RequestOpts, "method" | "body" | "formData">) =>
    apiFetch<T>(path, { ...opts, method: "POST", body }),
  put: <T = unknown>(path: string, body?: unknown, opts?: Omit<RequestOpts, "method" | "body" | "formData">) =>
    apiFetch<T>(path, { ...opts, method: "PUT", body }),
  delete: <T = unknown>(path: string, opts?: Omit<RequestOpts, "method" | "body" | "formData">) =>
    apiFetch<T>(path, { ...opts, method: "DELETE" }),
  upload: <T = unknown>(
    path: string,
    file: File,
    extraFields?: Record<string, string>,
    onProgress?: (pct: number) => void,
  ) => uploadXhr<T>(path, file, extraFields, onProgress),
};

function uploadXhr<T>(
  path: string,
  file: File,
  extraFields?: Record<string, string>,
  onProgress?: (pct: number) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
    const fd = new FormData();
    fd.append("file", file);
    if (extraFields) for (const [k, v] of Object.entries(extraFields)) fd.append(k, v);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Accept", "application/json");
    const token = readToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onerror = () => reject(new ApiError("Network error", 0));
    xhr.onload = () => {
      if (xhr.status === 401) {
        handleUnauthorized();
        reject(new ApiError("Unauthorized", 401));
        return;
      }
      let payload: { ok?: boolean; data?: unknown; error?: string } = {};
      try {
        payload = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch {
        reject(new ApiError("Invalid JSON", xhr.status));
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300 || payload.ok === false || payload.error) {
        reject(new ApiError(payload.error || `Upload failed (${xhr.status})`, xhr.status));
        return;
      }
      resolve((payload.data ?? payload) as T);
    };
    xhr.send(fd);
  });
}

// ---- Auth helpers ----
export function saveAuth(token: string, user: unknown): void {
  if (!isValidToken(token)) throw new ApiError("Invalid token received from server", 0);
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user ?? null));
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
