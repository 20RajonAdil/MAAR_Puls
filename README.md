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

## 2. What's built (Phase 1 + Phase 2 additions)

- **Design system**: color/type/spacing tokens in `tailwind.config.ts` + `app/globals.css`, deliberately distinct light and dark themes (not inverted), button/skeleton/switch/error-state primitives in `components/ui`.
- **Centralized YouTube service layer** (`lib/youtube/service.ts`): search videos/channels, video detail, channel detail + uploads, popular/trending, assignable categories, short-clip surface, related-video substitute. Every function has typed return shapes and normalized error codes (`QUOTA_EXCEEDED`, `NOT_FOUND`, `INVALID_REQUEST`, `UPSTREAM_ERROR`, `NO_API_KEY`). **`safeSearch` is set to `strict` on every search call** as a content safeguard.
- **API routes**: thin, typed proxies in `app/api/youtube/*` — no fetch logic lives in components.
- **Pages**: Home (streamed discovery rails incl. Shorts), Watch, Channel, Search, Explore, Shorts, Settings, History and Saved (device-local today), Subscriptions (account-synced, see below).
- **Real Google Sign-In + cross-device Subscriptions**: see section 4 below.
- **3D hero**, full motion system, accessibility basics, dynamic SEO metadata, PWA manifest + real icons, favicon — all as before, tuned for the live domain `https://maar-puls.vercel.app`.

## 3. Content policy — Islamic principles

MAAR Pulse's browsing surfaces (Home rails, Explore categories) intentionally **exclude Music and Movies/Entertainment** and other categories that commonly surface non-halal material. What remains: Trending, Gaming, News, Technology, Science, Education, Lifestyle, Shorts, and a dedicated **Islamic content** rail (a curated search query, since YouTube's public category taxonomy has no distinct "Islamic" category).

Every single search and popular-video call across the entire app runs with **`safeSearch: 'strict'`**, YouTube's most restrictive content filter — set once in `lib/youtube/service.ts` so it can't be bypassed by any individual page.

**Honest limitation**: YouTube's public API and safeSearch are third-party moderation systems MAAR Pulse doesn't control. Removing category tiles and enabling strict safeSearch meaningfully reduces exposure to non-halal content but can't guarantee it, especially for free-text search results — this is documented for users in Settings → Content & safety.

## 4. Authentication & cross-device subscriptions (Google Sign-In)

This is now a real, working feature (not a UI stub) — it needs three things configured before it will run:

**a) Google OAuth credentials**
1. [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials) → Create OAuth client ID → Application type: **Web application**
2. Authorized redirect URI: `https://maar-puls.vercel.app/api/auth/callback/google` (and `http://localhost:3000/api/auth/callback/google` for local dev)
3. Copy the Client ID and Client Secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

**b) NextAuth secret**
```bash
openssl rand -base64 32
```
Paste the result into `NEXTAUTH_SECRET`. Set `NEXTAUTH_URL` to your real deployed URL.

**c) A Postgres database**
Vercel's serverless functions can't persist a local SQLite file between requests, so this needs real hosted Postgres — [Vercel Postgres](https://vercel.com/storage/postgres), [Neon](https://neon.tech), or [Supabase](https://supabase.com) all have a free tier and just need a `DATABASE_URL` connection string. Then run:
```bash
npx prisma migrate deploy   # or: npx prisma db push   (quick, dev-friendly)
```

Once all three are set, sign-in works via `next-auth`'s Google provider (`lib/auth.ts`), and subscriptions are stored in Postgres via Prisma (`prisma/schema.prisma`, `app/api/subscriptions/route.ts`). **Signing in with the same Google account on a different device shows the exact same subscription list** — this is real server-side sync, not local storage, exactly like the brief asked for.

Important distinction preserved from the original brief: **Google Sign-In here only creates a MAAR Pulse account** (`openid email profile` scope). It does *not* request access to the user's actual YouTube channel/subscriptions — that would need the separate `youtube.readonly` OAuth scope, which this build deliberately does not request. This is explained to the user directly in Settings.

The Prisma schema also includes `SavedVideo` and `HistoryItem` models, ready for the same cross-device treatment — Watch Later and History currently run on `localStorage` (fully functional single-device) via `hooks/use-local-video-list.ts`; wiring them to their own `/api/saved` and `/api/history` routes follows the exact same pattern as `/api/subscriptions`.

## 5. Shorts

YouTube Data API v3 has no field that flags a video as a Short. `getShortClips()` in the service layer uses the closest legitimate proxy — a search constrained to `videoDuration=short` (under 4 minutes), sorted by recency — and the Shorts page (`/shorts`) tells users this plainly rather than pretending it's exact.

## 6. Icons & branding

`app/icon.svg`, `app/apple-icon.png`, `public/icon-192.png`, `public/icon-512.png` are generated from the MAAR Pulse pulse-bar mark (matching the animated logo). Swap these for higher-fidelity artwork any time — same filenames, Next.js picks them up automatically.

## 7. SEO verification & domain

`app/sitemap.ts` / `app/robots.ts` now default to `https://maar-puls.vercel.app` (still overridable via `NEXT_PUBLIC_SITE_URL`). `public/google1cf38d53a5ba1eb1.html` is the Google Search Console verification file — it's served automatically at `https://maar-puls.vercel.app/google1cf38d53a5ba1eb1.html` once deployed.

## 8. What's intentionally deferred (Phase 3)

These require product decisions that shouldn't be hard-coded into a scaffold:

- **YouTube-scope OAuth** (reading a user's *real* YouTube subscriptions/history from their actual Google account, not MAAR Pulse's own) — needs the `youtube.readonly` scope requested as a distinct, explicit grant. Deliberately not requested by default per the original brief.
- **Cross-device sync for History/Saved** — the database models already exist (`SavedVideo`, `HistoryItem` in `prisma/schema.prisma`); wiring them up is a copy of the `/api/subscriptions` pattern.
- **Playlists tab** on channel pages — needs the `playlists.list` endpoint, not yet wired.

## 9. Ownership

&copy; MAAR Pulse. Owned and operated by **Md Adil Rajon**. Credited in the site footer, PWA manifest, and page metadata (`authors`/`creator`/`publisher`).

## 10. Architecture notes

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
