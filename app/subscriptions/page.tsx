'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import { SignedOutGate } from '@/components/ui/signed-out-gate';
import { EmptyState } from '@/components/ui/state-views';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { Skeleton } from '@/components/ui/skeleton';

export default function SubscriptionsPage() {
  const { status } = useSession();
  const { items, loading } = useSubscriptions();

  if (status === 'loading') {
    return (
      <div className="container py-6">
        <h1 className="mb-6 font-display text-xl font-semibold text-ink">Subscriptions</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="container py-6">
        <h1 className="mb-6 font-display text-xl font-semibold text-ink">Subscriptions</h1>
        <SignedOutGate
          title="Sign in to see your subscriptions"
          body="Subscriptions on MAAR Pulse are stored on your account and stay in sync across every device signed in with the same Google account — just like YouTube."
        />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="mb-1 font-display text-xl font-semibold text-ink">Subscriptions</h1>
      <p className="mb-6 text-xs text-muted">Synced to your MAAR Pulse account — the same list on every device.</p>

      {!loading && items.length === 0 ? (
        <EmptyState title="No subscriptions yet" body="Subscribe to channels from any video or channel page to see them here." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((sub) => (
            <Link
              key={sub.channelId}
              href={`/channel/${sub.channelId}`}
              className="flex flex-col items-center gap-2 rounded-lg border border-border bg-raised p-4 text-center transition-colors hover:bg-overlay"
            >
              <div className="h-16 w-16 overflow-hidden rounded-full bg-overlay ring-1 ring-border">
                {sub.channelThumbnail && (
                  <Image src={sub.channelThumbnail} alt={sub.channelTitle} width={64} height={64} className="h-full w-full object-cover" />
                )}
              </div>
              <p className="line-clamp-2 text-xs font-medium text-ink">{sub.channelTitle}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
