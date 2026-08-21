import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maar-puls.vercel.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/settings', '/history', '/saved', '/subscriptions', '/api/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
