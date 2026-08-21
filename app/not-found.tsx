import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center gap-3 py-32 text-center">
      <p className="font-mono text-sm text-signal">404</p>
      <h1 className="font-display text-2xl font-semibold text-ink">This page went off-signal</h1>
      <p className="max-w-sm text-sm text-muted">The page you're looking for doesn't exist or may have moved.</p>
      <Link href="/">
        <Button className="mt-3">Back to MAAR Pulse</Button>
      </Link>
    </div>
  );
}
