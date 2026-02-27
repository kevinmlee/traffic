'use client';

import { useEffect, useRef, useState } from 'react';

interface LiveFeedPlayerProps {
  streamUrl: string;
  title: string;
}

export function LiveFeedPlayer({ streamUrl, title }: LiveFeedPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(false);
    setLoading(true);

    // Safari supports HLS natively
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.load();
      return;
    }

    // Chrome/Firefox: use hls.js
    let hlsInstance: { loadSource: (url: string) => void; attachMedia: (el: HTMLVideoElement) => void; destroy: () => void } | null = null;

    import('hls.js').then(({ default: Hls }) => {
      if (!Hls.isSupported()) {
        setError(true);
        setLoading(false);
        return;
      }
      const hls = new Hls({ enableWorker: false });
      hlsInstance = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_e: unknown, data: { fatal?: boolean }) => {
        if (data.fatal) {
          setError(true);
          setLoading(false);
        }
      });
    }).catch(() => {
      setError(true);
      setLoading(false);
    });

    return () => {
      hlsInstance?.destroy();
    };
  }, [streamUrl]);

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          height: '100%',
          color: 'var(--color-text-muted)',
          fontSize: '0.875rem',
        }}
        role="status"
        aria-label="Live feed unavailable"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Live feed unavailable
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg-elevated)',
            zIndex: 1,
          }}
          aria-label="Loading live feed"
          role="status"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-brand-500)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ animation: 'searchbar-spin 0.8s linear infinite' }}
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      )}
      <video
        ref={videoRef}
        title={title}
        autoPlay
        muted
        playsInline
        controls
        onCanPlay={() => setLoading(false)}
        onError={() => { setError(true); setLoading(false); }}
        style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000', display: 'block' }}
        aria-label={`Live traffic camera feed: ${title}`}
      />
    </>
  );
}
