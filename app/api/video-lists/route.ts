import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sql, ensureTables, isDbConfigured } from '@/lib/db/client';
import type { VideoSummary } from '@/types/youtube';

/**
 * Cloud copy of a signed-in user's watch history / saved (watch later)
 * lists, stored in Postgres (Neon, connected via the Vercel Storage tab),
 * one table shared by both lists (`list` column restricted to
 * 'history' | 'saved'). Same shape as /api/subscriptions — see
 * hooks/use-local-video-list.ts for the client-side merge logic.
 */

const ALLOWED_LISTS = new Set(['history', 'saved']);

function isAllowedList(value: unknown): value is 'history' | 'saved' {
  return typeof value === 'string' && ALLOWED_LISTS.has(value);
}

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function GET(request: Request) {
  const uid = await requireUserId();
  if (!uid) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const list = new URL(request.url).searchParams.get('list');
  if (!isAllowedList(list)) return NextResponse.json({ error: 'Invalid list' }, { status: 400 });
  if (!isDbConfigured()) return NextResponse.json({ items: [] });

  try {
    await ensureTables();
    const rows = (await sql()`
      SELECT video FROM video_list_items
      WHERE user_id = ${uid} AND list = ${list}
      ORDER BY added_at DESC
      LIMIT 200
    `) as { video: VideoSummary }[];
    return NextResponse.json({ items: rows.map((r) => r.video) });
  } catch (err) {
    console.error('GET /api/video-lists failed', err);
    return NextResponse.json({ error: 'Failed to load list' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const uid = await requireUserId();
  if (!uid) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ error: 'Cloud sync not configured' }, { status: 503 });

  let list: unknown;
  let video: VideoSummary;
  try {
    const body = await request.json();
    list = body.list;
    video = body.video;
    if (!isAllowedList(list)) throw new Error('Invalid list');
    if (!video?.id) throw new Error('Missing video.id');
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    await ensureTables();
    await sql()`
      INSERT INTO video_list_items (user_id, list, video_id, video, added_at)
      VALUES (${uid}, ${list as string}, ${video.id}, ${JSON.stringify(video)}, ${Date.now()})
      ON CONFLICT (user_id, list, video_id)
      DO UPDATE SET video = EXCLUDED.video, added_at = EXCLUDED.added_at
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/video-lists failed', err);
    return NextResponse.json({ error: 'Failed to save item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const uid = await requireUserId();
  if (!uid) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ error: 'Cloud sync not configured' }, { status: 503 });

  const url = new URL(request.url);
  const list = url.searchParams.get('list');
  const videoId = url.searchParams.get('videoId');
  if (!isAllowedList(list)) return NextResponse.json({ error: 'Invalid list' }, { status: 400 });

  try {
    await ensureTables();
    if (videoId) {
      await sql()`DELETE FROM video_list_items WHERE user_id = ${uid} AND list = ${list} AND video_id = ${videoId}`;
    } else {
      // No videoId = "clear all" for this list.
      await sql()`DELETE FROM video_list_items WHERE user_id = ${uid} AND list = ${list}`;
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/video-lists failed', err);
    return NextResponse.json({ error: 'Failed to remove item(s)' }, { status: 500 });
  }
}
