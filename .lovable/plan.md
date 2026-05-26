## What I'll do

### 1. Hide the "Edit with Lovable" badge
Call `publish_settings.set_badge_visibility(hide_badge: true)`. This is the correct way — the badge is injected by the hosting platform on published deployments, not by code in the repo. There is no `gptengineer.js`, no `index.html`, no Lovable iframe in this project to delete (TanStack Start renders the shell from `src/routes/__root.tsx`). I verified: `rg -i lovable src/` returns nothing.

### 2. Generate ThriftBeam favicon set
Use imagegen (premium, transparent) to create a clean blue circle with white "T":
- `public/favicon.svg` (master, vector-style render)
- `public/favicon-32x32.png`, `favicon-16x16.png`
- `public/apple-touch-icon.png` (180×180)
- `public/favicon-192x192.png`, `public/favicon-512x512.png`
- `public/favicon.ico` — built from the 32px PNG via ImageMagick (nix run nixpkgs#imagemagick)

### 3. Generate OG image
imagegen premium 1200×630: ThriftBeam wordmark + tagline "Save Smart. Live Rich." on blue gradient → `public/og-image.jpg`.

### 4. Update `src/routes/__root.tsx`
- Title: "ThriftBeam — Save Smart, Live Rich"
- Description: "Your trusted guide to budgeting, saving, and building wealth — one smart decision at a time."
- `theme-color`: `#2563EB`
- Full favicon `<link>` set (icon, apple-touch-icon, manifest, mask-icon)
- OG: title, description, image (absolute `https://thriftbeam.com/og-image.jpg`), url `https://thriftbeam.com`, type, site_name
- Twitter: summary_large_image + matching title/description/image
- `<html lang="en">` is already set in `RootShell` — verified.

### 5. Create `public/site.webmanifest`
Name "ThriftBeam", short_name "ThriftBeam", theme/background `#2563EB`/`#FFFFFF`, 192 + 512 icons, `display: standalone`.

### 6. Create `public/robots.txt`
```
User-agent: *
Allow: /

Sitemap: https://thriftbeam.com/sitemap.xml
```

### 7. Sitemap
I'll check whether `src/routes/sitemap[.]xml.ts` already exists. If yes, ensure `BASE_URL = "https://thriftbeam.com"`. If no, create the server route per the sitemap-robots convention with all public routes (`/`, `/about`, `/contact`, `/blog`, `/tools`, `/privacy`, `/disclaimer`, plus blog posts + tool slugs from `mockData`).

### 8. Verify
- `rg -i "lovable|gptengineer" src/ public/ index.html 2>/dev/null` → expect no matches in source (vite.config.ts excluded — see below)
- Hit preview, view source, confirm meta tags + favicon links render
- Confirm badge gone on published site

---

## What I will NOT do, and why

These items in your request can't be done without breaking the project — I'll flag them rather than silently skip:

- **`vite.config.ts` `@lovable.dev/vite-tanstack-config` import** stays. It's not a watermark — it's the entire Vite build configuration (TanStack Start plugin, Cloudflare adapter, Tailwind, path aliases, SSR setup). Removing it bricks the build. It ships zero runtime code or branding to end users.
- **No `lovable-tagger` or `lovable-*` dependency** exists in `package.json` — already clean.
- **No `index.html`, `gptengineer.js`, Lovable iframe, or badge code** exists in the repo. The badge is platform-injected on `*.lovable.app` URLs and disabled via the publish setting (step 1). On your own custom domain (`thriftbeam.com`) it won't appear at all.
- **`.lovable/` folder** (plan.md, project.json) is internal tooling state, not shipped to users. Leaving it.

Once you point `thriftbeam.com` at the deployment, none of the remaining Lovable infrastructure is visible to visitors.

Proceed?