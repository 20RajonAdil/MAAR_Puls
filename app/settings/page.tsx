'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { LogIn, LogOut, ShieldCheck, Info } from 'lucide-react';
import { SettingsSection, SettingsRow } from '@/components/settings/settings-section';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [autoplay, setAutoplay] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [hdDefault, setHdDefault] = useState(false);

  return (
    <div className="container max-w-2xl py-6">
      <h1 className="mb-2 font-display text-xl font-semibold text-ink">Settings</h1>
      <p className="mb-4 text-sm text-muted">Manage your MAAR Pulse account, appearance, and privacy preferences.</p>

      <SettingsSection title="Account" description="Sign in to sync subscriptions, history and saved videos across devices.">
        {status === 'authenticated' ? (
          <div className="flex items-center justify-between rounded-md border border-border bg-raised p-4">
            <div>
              <p className="text-sm font-medium text-ink">{session.user?.name}</p>
              <p className="text-xs text-muted">{session.user?.email}</p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => signOut()} className="gap-1.5">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-md border border-border bg-raised p-4">
            <div>
              <p className="text-sm font-medium text-ink">You're browsing as a guest</p>
              <p className="text-xs text-muted">Sign in with Google to sync subscriptions across devices.</p>
            </div>
            <Button size="sm" onClick={() => signIn('google')} className="gap-1.5">
              <LogIn className="h-4 w-4" /> Sign in
            </Button>
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        title="Google &amp; YouTube connection"
        description="Signing in with Google creates your MAAR Pulse account and syncs your subscriptions across devices. Reading or managing your real YouTube channel's own subscriptions/data separately would require an additional, explicit YouTube permission grant — MAAR Pulse does not request that scope today."
      >
        <div className="flex items-start gap-3 rounded-md border border-border bg-raised p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
          <div>
            <p className="text-sm text-ink">
              {status === 'authenticated' ? 'Google account connected' : 'No Google account connected'}
            </p>
            <p className="mt-1 text-xs text-muted">
              Subscriptions you add on MAAR Pulse are stored against your MAAR Pulse account and appear on any
              device where you sign in with the same Google account — just like YouTube.
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Appearance" description="Choose how MAAR Pulse looks on this device.">
        <SettingsRow label="Theme" control={<ThemeToggle />} />
      </SettingsSection>

      <SettingsSection title="Playback" description="Preferences apply to videos played on this device.">
        <SettingsRow label="Autoplay next video" control={<Switch checked={autoplay} onChange={setAutoplay} label="Autoplay next video" />} />
        <SettingsRow label="Default to highest quality" control={<Switch checked={hdDefault} onChange={setHdDefault} label="Default to highest quality" />} />
      </SettingsSection>

      <SettingsSection title="Privacy &amp; history" description="Control what MAAR Pulse remembers about your activity.">
        <SettingsRow label="Save watch history" control={<Switch checked={saveHistory} onChange={setSaveHistory} label="Save watch history" />} />
        <div className="mt-3">
          <Button variant="outline" size="sm">Clear all watch history</Button>
        </div>
      </SettingsSection>

      <SettingsSection title="Content &amp; safety" description="MAAR Pulse is built around Islamic principles.">
        <div className="flex items-start gap-3 rounded-md border border-border bg-raised p-4 text-sm text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Music, movies and other categories that commonly surface non-halal material are intentionally excluded
            from browsing on MAAR Pulse, and every search runs with YouTube's strictest content filter enabled.
            Gaming, News, Technology, Education, Science and dedicated Islamic content remain available. This
            filtering is a best-effort safeguard, not a guarantee — YouTube's own moderation and the strict
            safeSearch setting are the limits of what the public API can filter.
          </p>
        </div>
      </SettingsSection>

      <SettingsSection title="About">
        <div className="space-y-3 rounded-md border border-border bg-raised p-4 text-sm text-muted">
          <p>
            MAAR Pulse displays content from YouTube via the official YouTube Data API v3 and embedded player.
            Video ownership, availability and takedowns are governed by YouTube's own policies.
          </p>
          <p>
            &copy; {new Date().getFullYear()} MAAR Pulse. Owned and operated by{' '}
            <span className="font-medium text-ink">Md Adil Rajon</span>. All rights reserved.
          </p>
        </div>
      </SettingsSection>
    </div>
  );
}
