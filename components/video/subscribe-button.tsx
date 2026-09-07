'use client';

import { Button } from '@/components/ui/button';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import type { ChannelSummary } from '@/types/youtube';

export function SubscribeButton({ channel }: { channel: ChannelSummary }) {
  const { ready, isSubscribed, toggle } = useSubscriptions();
  const subscribed = ready && isSubscribed(channel.id);

  return (
    <Button
      variant={subscribed ? 'secondary' : 'primary'}
      size="md"
      onClick={() => toggle(channel)}
      aria-pressed={subscribed}
      className="rounded-full"
    >
      {subscribed ? 'Subscribed' : 'Subscribe'}
    </Button>
  );
}
