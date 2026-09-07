import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql, ensureTables, isDbConfigured } from '@/lib/db/client';
import type { ChannelSummary } from '@/types/youtube';

/**
 * Cloud copy of a signed-in user's MAAR Pulse subscriptions, stored in
 * Postgres (Neon, connected via the Vercel Storage tab). The browser
 * keeps its own localStorage copy for instant/offline use (see
 * hooks/use-subscriptions.ts) — this route is what lets that list follow
 * the user to a new device once they're signed in with Google.
 */

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function GET() {
  const uid = await requireUserId();
  if (!uid) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ channels: [] });

  try {
    await ensureTables();
    const rows = (await sql()`
      SELECT channel FROM subscriptions WHERE user_id = ${uid} ORDER BY subscribed_at DESC
    `) as { channel: ChannelSummary }[];
    return NextResponse.json({ channels: rows.map((r) => r.channel) });
  } catch (err) {
    console.error('GET /api/subscriptions failed', err);
    return NextResponse.json({ error: 'Failed to load subscriptions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const uid = await requireUserId();
  if (!uid) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ error: 'Cloud sync not configured' }, { status: 503 });

  let channel: ChannelSummary;
  try {
    const body = await request.json();
    channel = body.channel;
    if (!channel?.id) throw new Error('Missing channel.id');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    await ensureTables();
    await sql()`
      INSERT INTO subscriptions (user_id, channel_id, channel, subscribed_at)
      VALUES (${uid}, ${channel.id}, ${JSON.stringify(channel)}, ${Date.now()})
      ON CONFLICT (user_id, channel_id)
      DO UPDATE SET channel = EXCLUDED.channel, subscribed_at = EXCLUDED.subscribed_at
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/subscriptions failed', err);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const uid = await requireUserId();
  if (!uid) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ error: 'Cloud sync not configured' }, { status: 503 });

  const channelId = new URL(request.url).searchParams.get('channelId');
  if (!channelId) return NextResponse.json({ error: 'Missing channelId' }, { status: 400 });

  try {
    await ensureTables();
    await sql()`DELETE FROM subscriptions WHERE user_id = ${uid} AND channel_id = ${channelId}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/subscriptions failed', err);
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }
}
