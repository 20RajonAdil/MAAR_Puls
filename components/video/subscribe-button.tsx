'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function SubscribeButton({ channelTitle }: { channelTitle: string }) {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <Button
      variant={subscribed ? 'secondary' : 'primary'}
      size="md"
      onClick={() => setSubscribed((s) => !s)}
      aria-pressed={subscribed}
      className="rounded-full"
    >
      {subscribed ? `Subscribed` : `Subscribe`}
    </Button>
  );
}
