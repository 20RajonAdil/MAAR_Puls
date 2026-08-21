'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Gamepad2, Cpu, GraduationCap, Newspaper, FlaskConical, Leaf, Moon, Flame, Clapperboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVideos } from '@/hooks/use-videos';
import { VideoGrid } from '@/components/video/video-grid';

// Content policy: MAAR Pulse is built around Islamic principles. Music and
// movie/entertainment categories, along with other content categories that
// commonly surface non-halal material, are intentionally excluded from
// browsing here. Gaming and News remain, per policy, alongside Technology,
// Education, Science, Lifestyle and dedicated Islamic content. Every search
// across the app also runs with YouTube's strictest safeSearch filter (see
// lib/youtube/service.ts) as a further content safeguard — see the About
// section in Settings for the full explanation.
const CATEGORIES = [
  { label: 'Trending', icon: Flame, query: { kind: 'popular' as const } },
  { label: 'Islamic content', icon: Moon, query: { kind: 'search' as const, q: 'Islamic lecture Quran' } },
  { label: 'Gaming', icon: Gamepad2, query: { kind: 'category' as const, id: '20' } },
  { label: 'News', icon: Newspaper, query: { kind: 'category' as const, id: '25' } },
  { label: 'Technology', icon: Cpu, query: { kind: 'category' as const, id: '28' } },
  { label: 'Science', icon: FlaskConical, query: { kind: 'category' as const, id: '28' } },
  { label: 'Education', icon: GraduationCap, query: { kind: 'category' as const, id: '27' } },
  { label: 'Shorts', icon: Clapperboard, query: { kind: 'search' as const, q: 'shorts', duration: 'short' as const } },
  { label: 'Lifestyle', icon: Leaf, query: { kind: 'category' as const, id: '22' } },
];

export default function ExploreContent() {
  const params = useSearchParams();
  const initial = params.get('category');
  const initialIndex = CATEGORIES.findIndex((c) => c.query.kind === 'category' && (c.query as any).id === initial);
  const [active, setActive] = useState(
    initial === 'islamic' ? 1 : initial === 'trending' ? 0 : initialIndex >= 0 ? initialIndex : 0
  );

  const cat = CATEGORIES[active];
  const url =
    cat.query.kind === 'popular'
      ? '/api/youtube/popular'
      : cat.query.kind === 'category'
        ? `/api/youtube/popular?categoryId=${(cat.query as any).id}`
        : (cat.query as any).duration === 'short'
          ? `/api/youtube/shorts?q=${encodeURIComponent((cat.query as any).q)}`
          : `/api/youtube/search?q=${encodeURIComponent((cat.query as any).q)}`;

  const { items, loading, error, hasMore, loadMore } = useVideos(url);

  return (
    <div className="container py-6">
      <h1 className="mb-5 font-display text-xl font-semibold text-ink">Explore</h1>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0">
        {CATEGORIES.map((c, i) => {
          const Icon = c.icon;
          const isActive = i === active;
          return (
            <button
              key={c.label}
              onClick={() => setActive(i)}
              className={cn(
                'relative flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                isActive ? 'border-signal bg-signal/10 text-signal' : 'border-border bg-raised text-muted hover:text-ink'
              )}
            >
              <Icon className="h-4 w-4" />
              {c.label}
              {isActive && (
                <motion.span layoutId="explore-active" className="absolute inset-0 -z-10 rounded-full border border-signal" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <VideoGrid items={items} loading={loading} error={error} hasMore={hasMore} onLoadMore={loadMore} />
      </div>
    </div>
  );
}
