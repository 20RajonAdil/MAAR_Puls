import { Suspense } from 'react';
import { Hero } from '@/components/hero/hero';
import { Section } from '@/components/video/section';
import { VideoRail } from '@/components/video/video-rail';
import { ShortsRail } from '@/components/video/shorts-rail';
import { VideoGridSkeleton } from '@/components/ui/skeleton';

const RAILS: { title: string; categoryId?: string; query?: string; href: string }[] = [
  { title: 'Trending now', href: '/explore?category=trending' },
  { title: 'Islamic content', query: 'Islamic lecture Quran', href: '/explore?category=islamic' },
  { title: 'Technology', categoryId: '28', href: '/explore?category=28' },
  { title: 'Gaming', categoryId: '20', href: '/explore?category=20' },
  { title: 'News', categoryId: '25', href: '/explore?category=25' },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="container">
        <Section title="Shorts" href="/shorts">
          <Suspense fallback={<VideoGridSkeleton count={6} />}>
            <ShortsRail />
          </Suspense>
        </Section>

        {RAILS.map((rail) => (
          <Section key={rail.title} title={rail.title} href={rail.href}>
            <Suspense fallback={<VideoGridSkeleton count={8} />}>
              <VideoRail
                source={rail.query ? { kind: 'search', query: rail.query } : { kind: 'popular', categoryId: rail.categoryId }}
              />
            </Suspense>
          </Section>
        ))}
      </div>
    </>
  );
}
