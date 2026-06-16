'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';

interface SnapshotPlayerProps {
  /** Most recent (live) snapshot URL, shown as the final frame. May be null. */
  currentImageUrl: string | null;
  /** Reference frames, newest→oldest (referenceImages[0] = 1 update ago). */
  referenceImages: string[];
  /** Camera name, for alt text. */
  cameraName: string;
  /** ISO-ish timestamp of the current (live) image, e.g. "2026-06-16T14:30:00". */
  recordedAt?: string;
  /** Minutes between snapshots — used to derive each frame's approximate time. */
  updateFrequencyMinutes?: number | null;
  /** Milliseconds per frame. Defaults to a timelapse-y ~700ms. */
  frameDurationMs?: number;
}

/**
 * Plays through a camera's recent snapshots as a timelapse. Autoplays on mount,
 * with pause/resume and a scrubber. Frames are ordered oldest→newest so playback
 * moves forward in time, ending on the live image.
 */
export function SnapshotPlayer({
  currentImageUrl,
  referenceImages,
  cameraName,
  recordedAt,
  updateFrequencyMinutes,
  frameDurationMs = 700,
}: SnapshotPlayerProps) {
  // Oldest reference … newest reference … live image (last).
  const frames = useMemo(() => {
    const ordered = [...referenceImages].reverse();
    if (currentImageUrl) ordered.push(currentImageUrl);
    return ordered;
  }, [referenceImages, currentImageUrl]);

  // Approximate capture time per frame, working back from the live image.
  // The last frame == recordedAt; each step back is one update interval.
  // Empty strings mean "no reliable time" (missing recordedAt or frequency).
  const frameTimes = useMemo(() => {
    const base = recordedAt ? new Date(recordedAt) : null;
    const freqMs = (updateFrequencyMinutes ?? 0) * 60_000;
    if (!base || isNaN(base.getTime()) || freqMs <= 0) {
      return frames.map(() => '');
    }
    const lastIndex = frames.length - 1;
    return frames.map((_, i) => {
      const t = new Date(base.getTime() - (lastIndex - i) * freqMs);
      return t.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    });
  }, [frames, recordedAt, updateFrequencyMinutes]);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  // Start on the oldest frame and play forward in time. If reduced motion is
  // preferred, don't autoplay — show the newest (live) frame at rest.
  const [index, setIndex] = useState(() =>
    reducedMotion ? Math.max(frames.length - 1, 0) : 0
  );
  const [isPlaying, setIsPlaying] = useState(!reducedMotion);

  // Reset when the frame set changes (different camera).
  useEffect(() => {
    setIndex(reducedMotion ? Math.max(frames.length - 1, 0) : 0);
    setIsPlaying(!reducedMotion);
  }, [frames, reducedMotion]);

  // Advance frames while playing.
  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % frames.length);
    }, frameDurationMs);
    return () => clearInterval(timer);
  }, [isPlaying, frames.length, frameDurationMs]);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const handleScrub = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setIndex(Number(e.target.value));
  }, []);

  if (frames.length === 0) return null;

  const isLiveFrame = currentImageUrl != null && index === frames.length - 1;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Stacked frames — keep all mounted so the browser caches them and
          playback doesn't stutter on the first pass. Only the active one is shown. */}
      {frames.map((url, i) => (
        <Image
          key={url}
          src={url}
          alt={
            i === index
              ? `Snapshot ${i + 1} of ${frames.length} from ${cameraName}`
              : ''
          }
          fill
          unoptimized
          priority={i === frames.length - 1}
          style={{
            objectFit: 'cover',
            opacity: i === index ? 1 : 0,
            transition: 'opacity 0.15s linear',
          }}
        />
      ))}

      {/* Live badge on the final frame */}
      {isLiveFrame && (
        <div
          className="font-mono"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '0.6rem',
            left: '0.6rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.22rem 0.55rem',
            borderRadius: '0.4rem',
            backgroundColor: 'rgba(10,11,13,0.68)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#ffffff',
            fontSize: '0.625rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-live-500)',
              animation: 'live-pulse 2s ease-in-out infinite',
            }}
          />
          Live
        </div>
      )}

      {/* Controls bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem',
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
        }}
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause snapshot playback' : 'Resume snapshot playback'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.25rem',
            height: '2.25rem',
            flexShrink: 0,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.25)',
            backgroundColor: 'rgba(10,11,13,0.6)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          {isPlaying ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <input
          type="range"
          min={0}
          max={frames.length - 1}
          step={1}
          value={index}
          onChange={handleScrub}
          aria-label="Snapshot timeline"
          aria-valuetext={
            frameTimes[index]
              ? `${frameTimes[index]}, frame ${index + 1} of ${frames.length}`
              : `Frame ${index + 1} of ${frames.length}`
          }
          style={{
            flex: 1,
            accentColor: 'var(--color-brand-500)',
            cursor: 'pointer',
          }}
        />

        <span
          className="font-mono"
          aria-hidden="true"
          style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            lineHeight: 1.2,
            color: '#ffffff',
            letterSpacing: '0.03em',
            minWidth: frameTimes[index] ? '4rem' : '3rem',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          }}
        >
          {frameTimes[index] && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              {frameTimes[index]}
            </span>
          )}
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {index + 1} / {frames.length}
          </span>
        </span>
      </div>
    </div>
  );
}
