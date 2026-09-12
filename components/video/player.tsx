'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';

export function Player({ videoId, title }: { videoId: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleChange() {
      const active = document.fullscreenElement === containerRef.current;
      setIsFullscreen(active);
      if (!active) {
        try {
          (screen.orientation as any)?.unlock?.();
        } catch {
          // Orientation Lock isn't available on every browser (notably iOS
          // Safari) — unlocking is best-effort and safe to skip.
        }
      }
    }
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  async function toggleFullscreen() {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    try {
      // Rotating the phone while using YouTube's own internal fullscreen
      // button often doesn't rotate the video: screen.orientation.lock()
      // can only be called by the TOP-LEVEL page, and the player itself
      // runs inside a cross-origin youtube-nocookie.com iframe, which
      // browsers don't allow to lock orientation at all. Requesting
      // fullscreen on our own wrapping element first — rather than
      // leaving it to YouTube's internal button — gives MAAR Pulse itself
      // that permission.
      await containerRef.current.requestFullscreen();
      await (screen.orientation as any)?.lock?.('landscape');
    } catch {
      // Fullscreen or orientation lock can fail or be unsupported (iOS
      // Safari has no orientation lock API at all). Fullscreen itself
      // still works via requestFullscreen — it just won't force
      // landscape, and physical device rotation still re-flows normally.
    }
  }

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-soft [&:fullscreen]:aspect-auto [&:fullscreen]:rounded-none"
    >
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
      <button
        type="button"
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        onClick={toggleFullscreen}
        className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white opacity-0 ring-1 ring-white/10 transition-opacity duration-200 hover:bg-black/90 focus-visible:opacity-100 group-hover:opacity-100"
      >
        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </button>
    </div>
  );
}
