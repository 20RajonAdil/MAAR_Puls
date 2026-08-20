import { Suspense } from 'react';
import { VideoGridSkeleton } from '@/components/ui/skeleton';
import SearchContent from './search-content';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container py-6"><VideoGridSkeleton /></div>}>
      <SearchContent />
    </Suspense>
  );
}
