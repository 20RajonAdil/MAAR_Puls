# MAAR Pulse

A premium, YouTube-powered video discovery platform. Built with Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Framer Motion, and React Three Fiber.

MAAR Pulse is **not** a YouTube clone with different branding — it's an original interface (cyan/violet "pulse" duotone identity, calmer motion language, animated waveform brand mark) that surfaces **real YouTube content** through the officially supported YouTube Data API v3 and embedded player.

---

## 1. Getting started

```bash
npm install
cp .env.local.example .env.local
# then edit .env.local and paste in a real YOUTUBE_API_KEY
npm run dev
```

Get a YouTube Data API v3 key at the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — enable "YouTube Data API v3" on the project first.

**The key is never exposed to the browser.** It's read only inside `lib/youtube/service.ts`, a server-only module (enforced by the `server-only` package, which throws a build error if it's ever imported from client code). All video/channel/search data reaches the UI through `/api/youtube/*` route handlers.

For production (Vercel), add `YOUTUBE_API_KEY` and `NEXT_PUBLIC_SITE_URL` under Project Settings → Environment Variables. Never paste the key into source code or commit `.env.local` (it's already git-ignored).

---

## 2. What's built (Phase 1 — this scaffold)

- **Design system**: color/type/spacing tokens in `tailwind.config.ts` + `app/globals.css`, deliberately distinct light and dark themes (not inverted), button/skeleton/switch/error-state primitives in `components/ui`.
- **Centralized YouTube service layer** (`lib/youtube/service.ts`): search videos/channels, video detail, channel detail + uploads, popular/trending, assignable categories, related-video substitute. Every function has typed return shapes and normalized error codes (`QUOTA_EXCEEDED`, `NOT_FOUND`, `INVALID_REQUEST`, `UPSTREAM_ERROR`, `NO_API_KEY`).
- **API routes**: thin, typed proxies in `app/api/youtube/*` — no fetch logic lives in components.
- **Pages**: Home (streamed discovery rails), Watch (responsive embed, subscribe, like/save/share, description, recommended rail), Channel (banner/avatar/tabs, honest about API limits for Shorts/Playlists), Search, Explore (category rail incl. Islamic content via legitimate topical search), Settings (account, Google/YouTube connection explainer, appearance, playback, privacy), History and Saved (functional today via device-local storage, ready to swap for account sync).
- **3D hero**: a lightweight React Three Fiber "pulse ring" scene, dynamically imported (`next/dynamic`, `ssr: false`) so Three.js never ships to devices that don't render it. Automatically falls back to a CSS/SVG waveform animation when `prefers-reduced-motion` is set, the device reports ≤4 cores / ≤4GB memory, or on initial mobile paint.
- **Motion system**: Framer Motion throughout — staggered card entrances, spring-based hover/tap, page-level fade/slide, animated tab indicators, all respecting `prefers-reduced-motion` via the global CSS override plus the `useReducedMotion` hook.
- **Accessibility**: skip-to-content link, visible focus rings (`:focus-visible`), semantic landmarks, `aria-label`/`aria-pressed`/`aria-checked` on interactive controls, alt text on all images.
- **SEO**: per-page dynamic metadata (`generateMetadata` on Watch/Channel), Open Graph tags, dynamic `sitemap.xml` and `robots.txt` that explicitly excludes private/account routes.
- **PWA**: `manifest.webmanifest` wired into the root layout (add real `icon-192.png`/`icon-512.png` to `/public` before shipping).
- **Mobile-first layout**: bottom nav on mobile, sidebar on desktop, responsive grid (`1 → 2 → 3 → 4` columns), glass header that collapses search into a full-width overlay on small screens.

## 3. What's intentionally deferred (Phase 2)

These require product decisions (which auth/database provider, hosting for user data) that shouldn't be hard-coded into a scaffold:

- **Google Sign-In + YouTube OAuth**: `components/layout/account-menu.tsx` and `app/settings/page.tsx` are wired for a signed-out state and clearly documented for where a real session check (e.g. `next-auth`) plugs in. Per the brief, **Google Sign-In and YouTube data access are kept as separate concerns** — the Settings page explicitly explains this to the user rather than assuming one implies the other.
- **Cross-device Subscriptions/History/Saved sync**: History and Saved already work today, backed by `localStorage` via `hooks/use-local-video-list.ts`. That hook's interface (`items`, `add`, `remove`, `clear`) is the seam to swap in a real per-user database table once auth exists — no call sites need to change.
- **Playlists tab**: the channel page correctly explains (rather than fakes) that this needs the `playlists.list` endpoint, not yet wired.
- **Shorts tab**: honestly explained as a real YouTube Data API v3 limitation — the public API doesn't flag videos as Shorts, so MAAR Pulse can't separate them from regular uploads without scraping, which this project deliberately avoids.

## 4. Architecture notes

```
app/
  api/youtube/*        → thin route handlers, call lib/youtube/service.ts
  watch/[id], channel/[id], explore, search, settings, history, saved
lib/youtube/service.ts → the ONLY place that touches the YouTube API + key
components/
  ui/          → design-system primitives (Button, Skeleton, Switch, states)
  layout/      → header, sidebar, mobile nav, search, theme toggle, logo
  hero/        → 3D scene + fallback, dynamically imported
  video/       → VideoCard, VideoGrid, VideoRail (server, streamed), player, actions
  channel/     → channel tabs
hooks/         → use-videos (client fetch), use-local-video-list, use-reduced-motion, use-device-capability
types/youtube.ts → shared response shapes
```

Caching: each YouTube endpoint has its own `revalidate` window in `lib/youtube/service.ts` (search: 15 min, videos: 30 min, channels: 1 hr, categories: 24 hr) to protect API quota — tune these based on your actual quota budget.

## 5. Design reference

Layout rhythm, spacing and interaction quality were informed by studying originkit.dev, but MAAR Pulse's palette (cyan-teal "signal" + violet "pulse"), Space Grotesk/Inter/JetBrains Mono type system, and animated waveform brand mark are original to this product.
