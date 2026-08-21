import { Suspense } from 'react';
import { VideoGridSkeleton } from '@/components/ui/skeleton';
import ExploreContent from './explore-content';

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="container py-6"><VideoGridSkeleton /></div>}>
      <ExploreContent />
    </Suspense>
  );
}
