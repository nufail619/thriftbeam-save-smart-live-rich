// Tiny in-memory reactive store for the admin panel mock data.
// All mutations notify subscribers so React components re-render.

import { useSyncExternalStore } from "react";
import {
  mockPosts,
  mockPages,
  mockComments,
  mockMedia,
  mockUsers,
  mockSubscribers,
  mockCampaigns,
  mockIntegrations,
  mockCookieCategories,
  mockNotifications,
  mockRedirects,
  mockBackups,
  defaultSettings,
  type AdminPost,
  type AdminPage,
  type AdminComment,
  type MediaItem,
  type AdminUser,
  type Subscriber,
  type NewsletterCampaign,
  type Integration,
  type CookieCategory,
  type Notification,
  type Redirect,
  type BackupSnapshot,
  type SiteSettings,
} from "./mockAdminData";

type Store = {
  posts: AdminPost[];
  pages: AdminPage[];
  comments: AdminComment[];
  media: MediaItem[];
  users: AdminUser[];
  subscribers: Subscriber[];
  campaigns: NewsletterCampaign[];
  integrations: Integration[];
  cookies: CookieCategory[];
  notifications: Notification[];
  redirects: Redirect[];
  backups: BackupSnapshot[];
  settings: SiteSettings;
};

let state: Store = {
  posts: [...mockPosts],
  pages: [...mockPages],
  comments: [...mockComments],
  media: [...mockMedia],
  users: [...mockUsers],
  subscribers: [...mockSubscribers],
  campaigns: [...mockCampaigns],
  integrations: [...mockIntegrations],
  cookies: [...mockCookieCategories],
  notifications: [...mockNotifications],
  redirects: [...mockRedirects],
  backups: [...mockBackups],
  settings: structuredClone(defaultSettings),
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

const getPosts = () => state.posts;
const getPages = () => state.pages;
const getComments = () => state.comments;
const getMedia = () => state.media;
const getUsers = () => state.users;
const getSubscribers = () => state.subscribers;
const getCampaigns = () => state.campaigns;
const getIntegrations = () => state.integrations;
const getCookies = () => state.cookies;
const getNotifications = () => state.notifications;
const getRedirects = () => state.redirects;
const getBackups = () => state.backups;
const getSettings = () => state.settings;

export function usePosts() { return useSyncExternalStore(subscribe, getPosts, getPosts); }
export function usePages() { return useSyncExternalStore(subscribe, getPages, getPages); }
export function useComments() { return useSyncExternalStore(subscribe, getComments, getComments); }
export function useMedia() { return useSyncExternalStore(subscribe, getMedia, getMedia); }
export function useUsers() { return useSyncExternalStore(subscribe, getUsers, getUsers); }
export function useSubscribers() { return useSyncExternalStore(subscribe, getSubscribers, getSubscribers); }
export function useCampaigns() { return useSyncExternalStore(subscribe, getCampaigns, getCampaigns); }
export function useIntegrations() { return useSyncExternalStore(subscribe, getIntegrations, getIntegrations); }
export function useCookies() { return useSyncExternalStore(subscribe, getCookies, getCookies); }
export function useNotifications() { return useSyncExternalStore(subscribe, getNotifications, getNotifications); }
export function useRedirects() { return useSyncExternalStore(subscribe, getRedirects, getRedirects); }
export function useBackups() { return useSyncExternalStore(subscribe, getBackups, getBackups); }
export function useSettings() { return useSyncExternalStore(subscribe, getSettings, getSettings); }

const uid = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;

// ---------- Posts ----------
export const postsApi = {
  get: (id: string) => state.posts.find((p) => p.id === id),
  create: (p: Omit<AdminPost, "id">) => {
    const next = { ...p, id: uid("p") };
    setState({ posts: [next, ...state.posts] });
    return next;
  },
  update: (id: string, patch: Partial<AdminPost>) => {
    setState({ posts: state.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  },
  remove: (id: string) => { setState({ posts: state.posts.filter((p) => p.id !== id) }); },
  duplicate: (id: string) => {
    const src = state.posts.find((p) => p.id === id);
    if (!src) return;
    const copy: AdminPost = {
      ...src, id: uid("p"), title: `${src.title} (copy)`, slug: `${src.slug}-copy`,
      status: "draft", views: 0, date: new Date().toISOString().slice(0, 10),
    };
    setState({ posts: [copy, ...state.posts] });
  },
  bulkSetStatus: (ids: string[], status: AdminPost["status"]) => {
    setState({ posts: state.posts.map((p) => (ids.includes(p.id) ? { ...p, status } : p)) });
  },
  bulkRemove: (ids: string[]) => { setState({ posts: state.posts.filter((p) => !ids.includes(p.id)) }); },
};

// ---------- Pages ----------
export const pagesApi = {
  get: (id: string) => state.pages.find((p) => p.id === id),
  create: (p: Omit<AdminPage, "id" | "lastEdited">) => {
    const next: AdminPage = { ...p, id: uid("pg"), lastEdited: new Date().toISOString().slice(0, 10) };
    setState({ pages: [next, ...state.pages] });
    return next;
  },
  update: (id: string, patch: Partial<AdminPage>) => {
    setState({ pages: state.pages.map((p) => (p.id === id ? { ...p, ...patch, lastEdited: new Date().toISOString().slice(0, 10) } : p)) });
  },
  remove: (id: string) => { setState({ pages: state.pages.filter((p) => p.id !== id) }); },
};

// ---------- Comments ----------
export const commentsApi = {
  setStatus: (id: string, status: AdminComment["status"]) => {
    setState({ comments: state.comments.map((c) => (c.id === id ? { ...c, status } : c)) });
  },
  bulkSetStatus: (ids: string[], status: AdminComment["status"]) => {
    setState({ comments: state.comments.map((c) => (ids.includes(c.id) ? { ...c, status } : c)) });
  },
  remove: (id: string) => { setState({ comments: state.comments.filter((c) => c.id !== id) }); },
  bulkRemove: (ids: string[]) => { setState({ comments: state.comments.filter((c) => !ids.includes(c.id)) }); },
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
        width: 1200, height: 800,
        uploadedAt: new Date().toISOString().slice(0, 10), alt: "",
      };
      created.push(it);
    }
    setState({ media: [...created, ...state.media] });
    return created;
  },
  update: (id: string, patch: Partial<MediaItem>) => {
    setState({ media: state.media.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  },
  remove: (id: string) => { setState({ media: state.media.filter((m) => m.id !== id) }); },
};

// ---------- Users ----------
export const usersApi = {
  create: (u: Omit<AdminUser, "id" | "avatar" | "postsCount" | "lastLogin">) => {
    const next: AdminUser = {
      ...u, id: uid("u"), postsCount: 0,
      lastLogin: new Date().toISOString().slice(0, 10),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`,
    };
    setState({ users: [next, ...state.users] });
    return next;
  },
  update: (id: string, patch: Partial<AdminUser>) => {
    setState({ users: state.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) });
  },
  remove: (id: string) => { setState({ users: state.users.filter((u) => u.id !== id) }); },
};

// ---------- Subscribers ----------
export const subscribersApi = {
  create: (s: Omit<Subscriber, "id" | "subscribedAt">) => {
    const next: Subscriber = { ...s, id: uid("s"), subscribedAt: new Date().toISOString().slice(0, 10) };
    setState({ subscribers: [next, ...state.subscribers] });
    return next;
  },
  bulkCreate: (emails: string[]) => {
    const created = emails.filter(Boolean).map((email) => ({
      id: uid("s"), email: email.trim(), status: "subscribed" as const,
      source: "import", subscribedAt: new Date().toISOString().slice(0, 10),
    }));
    setState({ subscribers: [...created, ...state.subscribers] });
    return created;
  },
  setStatus: (id: string, status: Subscriber["status"]) => {
    setState({ subscribers: state.subscribers.map((s) => (s.id === id ? { ...s, status } : s)) });
  },
  bulkSetStatus: (ids: string[], status: Subscriber["status"]) => {
    setState({ subscribers: state.subscribers.map((s) => (ids.includes(s.id) ? { ...s, status } : s)) });
  },
  remove: (id: string) => { setState({ subscribers: state.subscribers.filter((s) => s.id !== id) }); },
  bulkRemove: (ids: string[]) => { setState({ subscribers: state.subscribers.filter((s) => !ids.includes(s.id)) }); },
};

// ---------- Campaigns ----------
export const campaignsApi = {
  create: (c: Omit<NewsletterCampaign, "id">) => {
    const next: NewsletterCampaign = { ...c, id: uid("nc") };
    setState({ campaigns: [next, ...state.campaigns] });
    return next;
  },
  update: (id: string, patch: Partial<NewsletterCampaign>) => {
    setState({ campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  },
  remove: (id: string) => { setState({ campaigns: state.campaigns.filter((c) => c.id !== id) }); },
};

// ---------- Integrations ----------
export const integrationsApi = {
  update: (id: string, patch: Partial<Integration>) => {
    setState({ integrations: state.integrations.map((i) => (i.id === id ? { ...i, ...patch } : i)) });
  },
  toggle: (id: string) => {
    setState({
      integrations: state.integrations.map((i) =>
        i.id === id
          ? { ...i, connected: !i.connected, lastSync: !i.connected ? new Date().toISOString().slice(0, 10) : i.lastSync }
          : i,
      ),
    });
  },
};

// ---------- Cookies ----------
export const cookiesApi = {
  update: (id: string, patch: Partial<CookieCategory>) => {
    setState({ cookies: state.cookies.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  },
  reset: () => { setState({ cookies: [...mockCookieCategories] }); },
};

// ---------- Notifications ----------
export const notificationsApi = {
  markRead: (id: string) => {
    setState({ notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });
  },
  markAllRead: () => {
    setState({ notifications: state.notifications.map((n) => ({ ...n, read: true })) });
  },
  remove: (id: string) => { setState({ notifications: state.notifications.filter((n) => n.id !== id) }); },
  clearAll: () => { setState({ notifications: [] }); },
};

// ---------- Redirects ----------
export const redirectsApi = {
  create: (r: Omit<Redirect, "id" | "hits">) => {
    const next: Redirect = { ...r, id: uid("r"), hits: 0 };
    setState({ redirects: [next, ...state.redirects] });
    return next;
  },
  update: (id: string, patch: Partial<Redirect>) => {
    setState({ redirects: state.redirects.map((r) => (r.id === id ? { ...r, ...patch } : r)) });
  },
  remove: (id: string) => { setState({ redirects: state.redirects.filter((r) => r.id !== id) }); },
};

// ---------- Backups ----------
export const backupsApi = {
  create: (type: BackupSnapshot["type"] = "manual") => {
    const next: BackupSnapshot = {
      id: uid("b"), createdAt: new Date().toISOString().slice(0, 10),
      size: Math.round(40_000_000 + Math.random() * 8_000_000),
      type, status: "complete",
    };
    setState({ backups: [next, ...state.backups] });
    return next;
  },
  remove: (id: string) => { setState({ backups: state.backups.filter((b) => b.id !== id) }); },
};

// ---------- Settings ----------
export const settingsApi = {
  update: <K extends keyof SiteSettings>(section: K, patch: Partial<SiteSettings[K]>) => {
    setState({ settings: { ...state.settings, [section]: { ...state.settings[section], ...patch } } });
  },
  reset: () => { setState({ settings: structuredClone(defaultSettings) }); },
};

// Helpers
export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
}

export function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
