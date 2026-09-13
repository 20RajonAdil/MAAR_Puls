/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'yt3.ggpht.com' },
      { protocol: 'https', hostname: 'yt3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    // YouTube's CDN already serves pre-sized thumbnails (we request
    // specific sizes like 'high'/'medium' directly from their API), so
    // there's nothing to gain by re-processing them through Vercel's own
    // Image Optimization on top of that — and that pipeline has a
    // monthly quota on free/hobby-tier projects. Once it's hit, EVERY
    // external image on the site fails at once while everything else
    // keeps working fine, which is exactly what "banner, avatar, and
    // every thumbnail all blank, but titles/views/text fine" looks like.
    // Serving YouTube's own thumbnail URLs directly avoids that
    // dependency entirely.
    unoptimized: true,
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
