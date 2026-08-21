# MAAR Pulse

A premium, YouTube-powered video discovery platform. Built with Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Framer Motion, and React Three Fiber.

MAAR Pulse is **not** a YouTube clone with different branding — it's an original interface (cyan/violet "pulse" duotone identity, calmer motion language, animated waveform brand mark) that surfaces **real YouTube content** through the officially supported YouTube Data API v3 and embedded player.

---

## 1. Getting started

```bash
npm install
cp .env.local.example .env.local
# then edit .env.local and paste in a real YOUTUBE_API_KEY + Google OAuth values
npm run dev
```

Get a YouTube Data API v3 key at the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — enable "YouTube Data API v3" on the project first.

**The key is never exposed to the browser.** It's read only inside `lib/youtube/service.ts`, a server-only module (enforced by the `server-only` package, which throws a build error if it's ever imported from client code). All video/channel/search data reaches the UI through `/api/youtube/*` route handlers.

For production (Vercel), add `YOUTUBE_API_KEY`, `NEXT_PUBLIC_SITE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET` and `NEXTAUTH_URL` under Project Settings → Environment Variables. Never paste any key into source code or commit `.env.local` (it's already git-ignored).

Google Sign-In won't work until you complete the **Authentication** setup in section 1a below — without it, clicking "Sign in" will show a NextAuth configuration error page instead of the Google account chooser.

### 1a. Authentication (Google Sign-In) setup

MAAR Pulse uses [NextAuth.js](https://next-auth.js.org/) with the Google provider, so signing in works exactly like it does on real Google-backed sites (including YouTube): clicking **Sign in** sends the browser to Google's own `accounts.google.com` consent screen, the user picks/confirms their Google account there, Google redirects back to MAAR Pulse, and a session is created. MAAR Pulse never sees the user's Google password, and by default it only requests the user's basic profile (name, email, avatar) — nothing else.

1. Go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials) (same project as your YouTube API key, or a new one).
2. If you haven't already, configure the **OAuth consent screen** (APIs & Services → OAuth consent screen): choose "External", fill in the app name (e.g. "MAAR Pulse"), your support email, and add your domain once you have one.
3. Click **Create Credentials → OAuth client ID**.
   - Application type: **Web application**
   - Name: anything, e.g. "MAAR Pulse"
   - **Authorized JavaScript origins**: `http://localhost:3000` (add your production URL later, e.g. `https://your-domain.com`)
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google` (add the production equivalent later, e.g. `https://your-domain.com/api/auth/callback/google`) — this exact path is required, NextAuth listens on it.
4. Copy the generated **Client ID** and **Client secret** into `.env.local`:
   ```
   GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxxxxxxx
   ```
5. Generate a session secret and add it too:
   ```bash
   openssl rand -base64 32
   ```
   ```
   NEXTAUTH_SECRET=<paste the output here>
   NEXTAUTH_URL=http://localhost:3000
   ```
6. Restart `npm run dev`. Click **Sign in** in the header — it should redirect to the real Google account chooser, then back to MAAR Pulse signed in with your Google name, email and profile photo showing in the header avatar.

When you deploy (e.g. to Vercel), add a second Authorized redirect URI for your production domain in the same Google Cloud OAuth client, and set `NEXTAUTH_URL` to that production URL in your host's environment variables.

**Where the code lives:**
- `lib/auth.ts` — NextAuth config (Google provider, session strategy, callbacks that attach the user's id and avatar to the session)
- `app/api/auth/[...nextauth]/route.ts` — the auth API route (sign-in, callback, sign-out, session endpoints all live under `/api/auth/*`)
- `components/providers/session-provider.tsx` — client-side session context, seeded from the server session in `app/layout.tsx` so there's no signed-out flash on first paint
- `components/layout/account-menu.tsx` — the header's Sign in button / signed-in avatar + dropdown (Sign out) menu
- `components/ui/signed-out-gate.tsx` — the "Sign in to see your X" prompt used on Subscriptions etc.
- `app/settings/page.tsx` — the Account panel showing the signed-in user's name/email/avatar and a Sign out button

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

- ~~**Google Sign-In**~~ — **shipped.** See section 1a above. `components/layout/account-menu.tsx`, `components/ui/signed-out-gate.tsx` and `app/settings/page.tsx` all use a real NextAuth session (`useSession`/`signIn`/`signOut`) — no more hard-coded signed-out state.
- **YouTube OAuth (reading the user's real YouTube subscriptions/likes)** is still deferred and kept as a separate concern from Google Sign-In, per the brief — the Settings page explains this distinction to the user rather than assuming one implies the other. It needs its own consent step requesting the narrower `youtube.readonly` scope, which isn't wired up yet.
- **Cross-device Subscriptions/History/Saved sync**: History and Saved already work today, backed by `localStorage` via `hooks/use-local-video-list.ts`. That hook's interface (`items`, `add`, `remove`, `clear`) is the seam to swap in a real per-user database table keyed by the now-available `session.user.id` — no call sites need to change. The Subscribe button (`components/video/subscribe-button.tsx`) is local UI state for the same reason.
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
