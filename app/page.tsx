import { Suspense } from 'react';
import { Hero } from '@/components/hero/hero';
import { Section } from '@/components/video/section';
import { VideoRail } from '@/components/video/video-rail';
import { VideoGridSkeleton } from '@/components/ui/skeleton';

const RAILS: { title: string; categoryId?: string; href: string }[] = [
  { title: 'Trending now', href: '/explore?category=trending' },
  { title: 'Technology', categoryId: '28', href: '/explore?category=28' },
  { title: 'Gaming', categoryId: '20', href: '/explore?category=20' },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="container">
        {RAILS.map((rail) => (
          <Section key={rail.title} title={rail.title} href={rail.href}>
            <Suspense fallback={<VideoGridSkeleton count={8} />}>
              <VideoRail source={{ kind: 'popular', categoryId: rail.categoryId }} />
            </Suspense>
          </Section>
        ))}
      </div>
    </>
  );
}
