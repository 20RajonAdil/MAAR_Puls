'use client';

import { LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SignedOutGate({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-20 text-center">
      <LogIn className="h-8 w-8 text-faint" strokeWidth={1.5} />
      <h2 className="font-display text-lg font-medium text-ink">{title}</h2>
      <p className="max-w-sm text-sm text-muted">{body}</p>
      <Button size="sm" className="mt-2 gap-1.5" onClick={() => signIn('google')}>
        <LogIn className="h-4 w-4" /> Sign in
      </Button>
    </div>
  );
}
