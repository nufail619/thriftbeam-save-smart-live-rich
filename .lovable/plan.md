## Change

Update the API base URL constant in `src/lib/api.ts`:

```ts
export const API_BASE = "https://api.thriftbeam.com";
```

(was `https://thriftbeam.com/api`)

## Scope check

Searched the codebase for `thriftbeam.com`. The only API URL hardcode is `src/lib/api.ts` line 4. All other matches are the public site domain and must NOT change:

- `src/routes/sitemap[.]xml.ts` — sitemap base URL (public site)
- `src/routes/__root.tsx` — og:url, og:image, JSON-LD organization (public site)
- `src/routes/privacy.tsx`, `src/routes/contact.tsx` — `hello@thriftbeam.com` email
- `src/components/admin/SeoPanel.tsx` — slug preview (public site)
- `src/lib/mockAdminData.ts` — mock email/URL strings

No other files reference the old `/api` path. All endpoint paths (`/auth/login`, `/posts`, `/dashboard`, etc.) in `src/lib/api/*.ts` are already relative and will resolve correctly against the new base.

## Deploy

GitHub sync is automatic; Cloudflare auto-deploys on push.
