'use client';

import { useEffect, useRef, useState } from 'react';

interface CardLiveFeedProps {
  streamUrl: string;
  /** Called when the stream fails to load — parent reverts to snapshot */
  onError: () => void;
}

export function CardLiveFeed({ streamUrl, onError }: CardLiveFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hlsInstance: { loadSource: (url: string) => void; attachMedia: (el: HTMLVideoElement) => void; destroy: () => void } | null = null;
    let cancelled = false;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari — native HLS
      video.src = streamUrl;
      video.load();
    } else {
      import('hls.js').then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) { onError(); return; }
        const hls = new Hls({ enableWorker: false, maxBufferLength: 8, maxMaxBufferLength: 16 });
        hlsInstance = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_e: unknown, data: { fatal?: boolean }) => {
          if (data.fatal) onError();
        });
      }).catch(onError);
    }

    return () => {
      cancelled = true;
      hlsInstance?.destroy();
      video.src = '';
    };
  }, [streamUrl, onError]);

  return (
    <>
      {/* Fade-in overlay while buffering */}
      {!ready && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'var(--color-bg-elevated)',
            zIndex: 1,
          }}
        />
      )}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onCanPlay={() => setReady(true)}
        onError={onError}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
        aria-hidden="true"
      />
    </>
  );
}
