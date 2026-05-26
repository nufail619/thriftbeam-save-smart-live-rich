import { api } from "@/lib/api";
import type { MediaItem, MediaType } from "@/lib/mockAdminData";

function norm(raw: unknown): MediaItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = (raw as any)?.media ?? raw ?? {};
  const url = r.url ?? r.public_url ?? r.path ?? "";
  const filename = r.filename ?? r.name ?? (typeof url === "string" ? url.split("/").pop() ?? "" : "");
  const mime: string = r.mime ?? r.mime_type ?? "";
  const inferred: MediaType =
    r.type ?? (mime.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(filename) ? "image" : "document");
  return {
    id: r.id != null ? String(r.id) : "",
    url,
    filename,
    type: inferred,
    size: Number(r.size ?? r.bytes ?? 0),
    width: r.width != null ? Number(r.width) : undefined,
    height: r.height != null ? Number(r.height) : undefined,
    uploadedAt:
      typeof r.uploaded_at === "string"
        ? r.uploaded_at.slice(0, 10)
        : typeof r.created_at === "string"
          ? r.created_at.slice(0, 10)
          : r.uploadedAt ?? "",
    alt: r.alt ?? r.alt_text ?? "",
  };
}

function list(raw: unknown): MediaItem[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any;
  if (Array.isArray(r)) return r.map(norm);
  const arr = r?.items ?? r?.media ?? r?.data ?? [];
  return Array.isArray(arr) ? arr.map(norm) : [];
}

export const mediaApi = {
  list: async () => list(await api.get("/media")),
  upload: async (file: File, onProgress?: (pct: number) => void) =>
    norm(await api.upload("/media", file, undefined, onProgress)),
  update: async (id: string, payload: Partial<MediaItem>) => {
    const out: Record<string, unknown> = { ...payload };
    if (payload.alt !== undefined) out.alt_text = payload.alt;
    return norm(await api.put(`/media/${id}`, out));
  },
  remove: (id: string) => api.delete(`/media/${id}`),
};
