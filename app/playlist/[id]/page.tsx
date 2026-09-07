import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlaylistById, YouTubeApiError } from '@/lib/youtube/service';
import { ApiErrorState } from '@/components/ui/state-views';
import { PlaylistVideoList } from '@/components/video/playlist-video-list';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const playlist = await getPlaylistById(params.id);
    if (!playlist) return { title: 'Playlist unavailable' };
    return { title: `${playlist.title} — Playlist`, description: playlist.description.slice(0, 160) };
  } catch {
    return { title: 'Playlist unavailable' };
  }
}

export default async function PlaylistPage({ params }: Props) {
  let playlist;
  try {
    playlist = await getPlaylistById(params.id);
  } catch (err) {
    if (err instanceof YouTubeApiError) {
      return (
        <div className="container py-10">
          <ApiErrorState error={{ error: true, code: err.code, message: err.message }} />
        </div>
      );
    }
    throw err;
  }

  if (!playlist) notFound();

  return (
    <div className="container py-8">
      <div className="mb-6 max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-wide text-faint">Playlist</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink md:text-3xl">{playlist.title}</h1>
        <Link href={`/channel/${playlist.channelId}`} className="mt-2 inline-block text-sm text-muted hover:text-ink transition-colors">
          {playlist.channelTitle}
        </Link>
        {playlist.itemCount !== undefined && (
          <p className="mt-1 font-mono text-xs text-faint">
            {playlist.itemCount} video{playlist.itemCount === 1 ? '' : 's'}
          </p>
        )}
        {playlist.description && (
          <p className="mt-3 whitespace-pre-line text-sm text-ink line-clamp-3">{playlist.description}</p>
        )}
      </div>

      <PlaylistVideoList playlistId={playlist.id} />
    </div>
  );
}
