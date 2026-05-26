// Tiny in-memory reactive store for the admin panel mock data.
// All mutations notify subscribers so React components re-render.

import { useSyncExternalStore } from "react";
import {
  mockPosts,
  mockPages,
  mockComments,
  mockMedia,
  type AdminPost,
  type AdminPage,
  type AdminComment,
  type MediaItem,
} from "./mockAdminData";

type Store = {
  posts: AdminPost[];
  pages: AdminPage[];
  comments: AdminComment[];
  media: MediaItem[];
};

let state: Store = {
  posts: [...mockPosts],
  pages: [...mockPages],
  comments: [...mockComments],
  media: [...mockMedia],
};

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const emit = () => listeners.forEach((l) => l());

function setState(partial: Partial<Store>) {
  state = { ...state, ...partial };
  emit();
}

// Selectors with stable identity per state version
const getPosts = () => state.posts;
const getPages = () => state.pages;
const getComments = () => state.comments;
const getMedia = () => state.media;

export function usePosts() {
  return useSyncExternalStore(subscribe, getPosts, getPosts);
}
export function usePages() {
  return useSyncExternalStore(subscribe, getPages, getPages);
}
export function useComments() {
  return useSyncExternalStore(subscribe, getComments, getComments);
}
export function useMedia() {
  return useSyncExternalStore(subscribe, getMedia, getMedia);
}

// ---------- Posts ----------
const uid = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;

export const postsApi = {
  get: (id: string) => state.posts.find((p) => p.id === id),
  create: (p: Omit<AdminPost, "id">) => {
    const next = { ...p, id: uid("p") };
    setState({ posts: [next, ...state.posts] });
    return next;
  },
  update: (id: string, patch: Partial<AdminPost>) => {
    setState({
      posts: state.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  },
  remove: (id: string) => {
    setState({ posts: state.posts.filter((p) => p.id !== id) });
  },
  duplicate: (id: string) => {
    const src = state.posts.find((p) => p.id === id);
    if (!src) return;
    const copy: AdminPost = {
      ...src,
      id: uid("p"),
      title: `${src.title} (copy)`,
      slug: `${src.slug}-copy`,
      status: "draft",
      views: 0,
      date: new Date().toISOString().slice(0, 10),
    };
    setState({ posts: [copy, ...state.posts] });
  },
  bulkSetStatus: (ids: string[], status: AdminPost["status"]) => {
    setState({
      posts: state.posts.map((p) => (ids.includes(p.id) ? { ...p, status } : p)),
    });
  },
  bulkRemove: (ids: string[]) => {
    setState({ posts: state.posts.filter((p) => !ids.includes(p.id)) });
  },
};

// ---------- Pages ----------
export const pagesApi = {
  get: (id: string) => state.pages.find((p) => p.id === id),
  create: (p: Omit<AdminPage, "id" | "lastEdited">) => {
    const next: AdminPage = {
      ...p,
      id: uid("pg"),
      lastEdited: new Date().toISOString().slice(0, 10),
    };
    setState({ pages: [next, ...state.pages] });
    return next;
  },
  update: (id: string, patch: Partial<AdminPage>) => {
    setState({
      pages: state.pages.map((p) =>
        p.id === id ? { ...p, ...patch, lastEdited: new Date().toISOString().slice(0, 10) } : p,
      ),
    });
  },
  remove: (id: string) => {
    setState({ pages: state.pages.filter((p) => p.id !== id) });
  },
};

// ---------- Comments ----------
export const commentsApi = {
  setStatus: (id: string, status: AdminComment["status"]) => {
    setState({
      comments: state.comments.map((c) => (c.id === id ? { ...c, status } : c)),
    });
  },
  bulkSetStatus: (ids: string[], status: AdminComment["status"]) => {
    setState({
      comments: state.comments.map((c) => (ids.includes(c.id) ? { ...c, status } : c)),
    });
  },
  remove: (id: string) => {
    setState({ comments: state.comments.filter((c) => c.id !== id) });
  },
  bulkRemove: (ids: string[]) => {
    setState({ comments: state.comments.filter((c) => !ids.includes(c.id)) });
  },
};

// ---------- Media ----------
const SAMPLE_UPLOADS = [
  "1554224155-6726b3ff858f",
  "1593672715438-d88a70629abe",
  "1611974789855-9c2a0a7236a3",
  "1607863680198-23d4b2565df0",
  "1565514020179-026b92b84bb6",
];

export const mediaApi = {
  get: (id: string) => state.media.find((m) => m.id === id),
  uploadMock: (count = 1) => {
    const created: MediaItem[] = [];
    for (let i = 0; i < count; i++) {
      const photoId = SAMPLE_UPLOADS[Math.floor(Math.random() * SAMPLE_UPLOADS.length)];
      const it: MediaItem = {
        id: uid("m"),
        url: `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=70&fm=webp`,
        filename: `upload-${Date.now()}-${i + 1}.jpg`,
        type: "image",
        size: Math.round(150_000 + Math.random() * 2_000_000),
        width: 1200,
        height: 800,
        uploadedAt: new Date().toISOString().slice(0, 10),
        alt: "",
      };
      created.push(it);
    }
    setState({ media: [...created, ...state.media] });
    return created;
  },
  update: (id: string, patch: Partial<MediaItem>) => {
    setState({ media: state.media.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  },
  remove: (id: string) => {
    setState({ media: state.media.filter((m) => m.id !== id) });
  },
};

// Helpers
export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
