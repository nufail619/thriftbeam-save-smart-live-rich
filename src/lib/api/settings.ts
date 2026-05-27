import { api } from "@/lib/api";

// Backend returns settings as nested groups:
// { general: {site_title, tagline, ...}, discussion: {allow_comments, ...}, seo: {...}, ... }
// The admin UI works with flat keys (site_title, allow_comments, ...).
// We hydrate by flattening AND aliasing common flat keys to their nested home,
// and write by sending PUT /settings with a nested patch payload.

export type SettingsMap = Record<string, unknown>;

// Flat-key → "group.field" map for the admin Settings UI.
const ALIASES: Record<string, string> = {
  site_title: "general.site_title",
  tagline: "general.tagline",
  admin_email: "general.admin_email",
  timezone: "general.timezone",
  date_format: "general.date_format",
  language: "general.language",
  posts_per_page: "reading.posts_per_page",
  excerpt_length: "reading.excerpt_length",
  allow_comments: "discussion.allow_comments",
  require_approval: "discussion.require_approval",
  close_after_days: "discussion.close_after_days",
  blacklist: "discussion.blacklist",
  permalink_structure: "permalinks.permalink_structure",
};

function flatten(raw: unknown): SettingsMap {
  const out: SettingsMap = {};
  if (!raw || typeof raw !== "object") return out;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;

  // Array-of-rows fallback: [{key, value}, ...]
  if (Array.isArray(r)) {
    for (const row of r) {
      if (row?.key != null) out[String(row.key)] = parseValue(row.value);
    }
  } else if (Array.isArray(r.items)) {
    for (const row of r.items) {
      if (row?.key != null) out[String(row.key)] = parseValue(row.value);
    }
  } else {
    // Nested groups: { general: { site_title: "..." }, ... }
    for (const [group, val] of Object.entries(r)) {
      if (val && typeof val === "object" && !Array.isArray(val)) {
        for (const [field, fv] of Object.entries(val as Record<string, unknown>)) {
          out[`${group}.${field}`] = parseValue(fv);
        }
      } else {
        out[group] = parseValue(val);
      }
    }
  }

  // Surface flat aliases (admin UI reads draft["site_title"], not draft["general.site_title"]).
  for (const [flat, dotted] of Object.entries(ALIASES)) {
    if (out[flat] === undefined && out[dotted] !== undefined) {
      out[flat] = out[dotted];
    }
  }
  return out;
}

function parseValue(v: unknown): unknown {
  if (typeof v !== "string") return v;
  try {
    const p = JSON.parse(v);
    return p;
  } catch {
    return v;
  }
}

function resolveKey(key: string): { group: string; field: string } {
  const dotted = key.includes(".") ? key : (ALIASES[key] ?? `general.${key}`);
  const [group, ...rest] = dotted.split(".");
  return { group, field: rest.join(".") };
}

export const settingsApi = {
  getAll: async (): Promise<SettingsMap> => flatten(await api.get("/settings")),
  update: async (key: string, value: unknown) => {
    const { group, field } = resolveKey(key);
    // Try nested PUT first (PHP backend merges); fall back to PUT /settings/:key.
    try {
      return await api.put("/settings", { [group]: { [field]: value } });
    } catch {
      return await api.put(`/settings/${encodeURIComponent(key)}`, { value });
    }
  },
};
