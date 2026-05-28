// Global site settings — fetched without auth from GET /settings.
// PUT /settings/{key} updates a single group with the given JSON body.

import { api } from "@/lib/api";

export type SiteSettingsGroups = Record<string, Record<string, unknown>>;

function asGroups(raw: unknown): SiteSettingsGroups {
  if (!raw || typeof raw !== "object") return {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  // Array-of-rows fallback: [{key, value}, ...]
  if (Array.isArray(r)) {
    const out: SiteSettingsGroups = {};
    for (const row of r) {
      if (!row?.key) continue;
      const dotted = String(row.key);
      const [group, ...rest] = dotted.split(".");
      const field = rest.join(".");
      const val = parseMaybeJson(row.value);
      out[group] ||= {};
      if (field) out[group][field] = val;
      else out[group] = (val && typeof val === "object") ? (val as Record<string, unknown>) : { value: val };
    }
    return out;
  }
  // Nested groups
  const out: SiteSettingsGroups = {};
  for (const [k, v] of Object.entries(r)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = Object.fromEntries(
        Object.entries(v as Record<string, unknown>).map(([fk, fv]) => [fk, parseMaybeJson(fv)]),
      );
    } else {
      out[k] = { value: parseMaybeJson(v) };
    }
  }
  return out;
}

function parseMaybeJson(v: unknown): unknown {
  if (typeof v !== "string") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  try {
    const p = JSON.parse(v);
    return p;
  } catch {
    return v;
  }
}

export const siteSettingsApi = {
  getAll: async (): Promise<SiteSettingsGroups> => asGroups(await api.get("/settings")),
  updateGroup: async (key: string, value: Record<string, unknown>) =>
    api.put(`/settings/${encodeURIComponent(key)}`, value),
};

export const cacheApi = {
  clear: () => api.post("/cache/clear"),
};

export const cookiesPublicApi = {
  log: (payload: Record<string, unknown>) => api.post("/cookies/log", payload).catch(() => null),
};
