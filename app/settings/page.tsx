'use client';

import { useState } from 'react';
import { LogIn, ShieldCheck, Info } from 'lucide-react';
import { SettingsSection, SettingsRow } from '@/components/settings/settings-section';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [autoplay, setAutoplay] = useState(true);
  const [saveHistory, setSaveHistory] = useState(true);
  const [hdDefault, setHdDefault] = useState(false);

  return (
    <div className="container max-w-2xl py-6">
      <h1 className="mb-2 font-display text-xl font-semibold text-ink">Settings</h1>
      <p className="mb-4 text-sm text-muted">Manage your MAAR Pulse account, appearance, and privacy preferences.</p>

      <SettingsSection title="Account" description="Sign in to sync subscriptions, history and saved videos across devices.">
        <div className="flex items-center justify-between rounded-md border border-border bg-raised p-4">
          <div>
            <p className="text-sm font-medium text-ink">You're browsing as a guest</p>
            <p className="text-xs text-muted">Sign in with Google to unlock personalization.</p>
          </div>
          <Button size="sm" className="gap-1.5">
            <LogIn className="h-4 w-4" /> Sign in
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Google &amp; YouTube connection"
        description="Signing in with Google creates your MAAR Pulse account only. Reading or managing your real YouTube subscriptions requires a separate, explicit YouTube permission grant."
      >
        <div className="flex items-start gap-3 rounded-md border border-border bg-raised p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
          <div>
            <p className="text-sm text-ink">No YouTube account permissions granted</p>
            <p className="mt-1 text-xs text-muted">
              MAAR Pulse will request read-only YouTube access only when you use a feature that needs it (e.g. importing your real subscriptions), and will show exactly what it's asking for before you approve it.
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

      <SettingsSection title="About">
        <div className="flex items-start gap-3 rounded-md border border-border bg-raised p-4 text-sm text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            MAAR Pulse displays content from YouTube via the official YouTube Data API v3 and embedded player. Video
            ownership, availability and takedowns are governed by YouTube's own policies.
          </p>
        </div>
      </SettingsSection>
    </div>
  );
}
