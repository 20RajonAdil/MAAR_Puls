'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useSubscriptions } from '@/hooks/use-subscriptions';

export function SubscribeButton({
  channelId,
  channelTitle,
  channelThumbnail,
}: {
  channelId: string;
  channelTitle: string;
  channelThumbnail?: string;
}) {
  const { isSignedIn, isSubscribed, subscribe, unsubscribe } = useSubscriptions();
  const subscribed = isSubscribed(channelId);

  const handleClick = () => {
    if (!isSignedIn) {
      signIn('google');
      return;
    }
    if (subscribed) {
      unsubscribe(channelId);
    } else {
      subscribe(channelId, channelTitle, channelThumbnail);
    }
  };

  return (
    <Button
      variant={subscribed ? 'secondary' : 'primary'}
      size="md"
      onClick={handleClick}
      aria-pressed={subscribed}
      className="rounded-full"
    >
      {subscribed ? 'Subscribed' : 'Subscribe'}
    </Button>
  );
}
