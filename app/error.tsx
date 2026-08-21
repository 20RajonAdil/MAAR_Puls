'use client';

import { useEffect } from 'react';
import { ApiErrorState } from '@/components/ui/state-views';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container py-16">
      <ApiErrorState
        error={{ error: true, code: 'UPSTREAM_ERROR', message: 'Something unexpected happened while loading this page.' }}
        onRetry={reset}
      />
    </div>
  );
}
