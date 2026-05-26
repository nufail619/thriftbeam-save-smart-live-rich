import { api } from "@/lib/api";

// Settings are stored as key/value rows on the backend. The admin UI groups
// them into sections (general, reading, writing, discussion, permalinks, …).
// We expose helpers that flatten / hydrate between the two shapes.

export type SettingsMap = Record<string, unknown>;

function flatten(raw: unknown): SettingsMap {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  if (!r) return {};
  if (Array.isArray(r)) {
    const out: SettingsMap = {};
    for (const row of r) {
      if (row?.key != null) out[String(row.key)] = parseValue(row.value);
    }
    return out;
  }
  if (Array.isArray(r.items)) {
    const out: SettingsMap = {};
    for (const row of r.items) {
      if (row?.key != null) out[String(row.key)] = parseValue(row.value);
    }
    return out;
  }
  return r as SettingsMap;
}

function parseValue(v: unknown): unknown {
  if (typeof v !== "string") return v;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

export const settingsApi = {
  getAll: async (): Promise<SettingsMap> => flatten(await api.get("/settings")),
  update: async (key: string, value: unknown) =>
    api.put(`/settings/${encodeURIComponent(key)}`, { value }),
};
