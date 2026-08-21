import { Suspense } from 'react';
import type { Metadata } from 'next';
import { VideoGridSkeleton } from '@/components/ui/skeleton';
import ShortsContent from './shorts-content';

export const metadata: Metadata = {
  title: 'Shorts',
  description: 'Short-form video clips on MAAR Pulse.',
};

export default function ShortsPage() {
  return (
    <Suspense fallback={<div className="container py-6"><VideoGridSkeleton /></div>}>
      <ShortsContent />
    </Suspense>
  );
}
