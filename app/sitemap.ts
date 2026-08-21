import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maar-puls.vercel.app';
  const staticRoutes = ['', '/explore', '/search', '/shorts'];

  return staticRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'hourly' : 'daily',
    priority: route === '' ? 1 : 0.6,
  }));
}
