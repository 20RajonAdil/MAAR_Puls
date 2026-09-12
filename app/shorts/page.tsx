import type { Metadata } from 'next';
import { ShortsFeed } from '@/components/video/shorts-feed';

export const metadata: Metadata = {
  title: 'Shorts',
  description: 'Quick, vertical videos under two minutes.',
};

export default function ShortsPage() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">Shorts</h1>
        <p className="mt-1 text-sm text-muted">Quick, vertical videos under two minutes.</p>
      </div>
      <ShortsFeed />
    </div>
  );
}
