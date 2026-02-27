'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface CameraImageProps {
  imageUrl: string;
  alt: string;
  updateFrequencyMinutes: number | null;
  fill?: boolean;
  priority?: boolean;
}

export function CameraImage({
  imageUrl,
  alt,
  updateFrequencyMinutes,
  fill = false,
  priority = false,
}: CameraImageProps) {
  const refreshIntervalMs = Math.max(
    (updateFrequencyMinutes ?? 1) * 60 * 1000,
    30_000
  );
  const [cacheBust, setCacheBust] = useState(() => Date.now());
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
    const timer = setInterval(() => setCacheBust(Date.now()), refreshIntervalMs);
    return () => clearInterval(timer);
  }, [imageUrl, refreshIntervalMs]);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <div
        aria-label="Camera image unavailable"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--color-bg-elevated)',
          color: 'var(--color-text-muted)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"/>
          <line x1="2" x2="22" y1="2" y2="22"/>
        </svg>
        <span style={{ fontSize: '0.75rem' }}>Image unavailable</span>
      </div>
    );
  }

  const src = `${imageUrl}?t=${cacheBust}`;

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : 640}
      height={fill ? undefined : 360}
      className={fill ? undefined : undefined}
      style={fill ? { objectFit: 'cover' } : { width: '100%', height: 'auto' }}
      unoptimized
      priority={priority}
      onError={handleError}
    />
  );
}

export function CameraImagePlaceholder({ label }: { label?: string }) {
  return (
    <div
      aria-label={label ?? 'No camera image available'}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        backgroundColor: 'var(--color-bg-elevated)',
        color: 'var(--color-text-muted)',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z"/>
        <circle cx="12" cy="13" r="3"/>
      </svg>
      <span style={{ fontSize: '0.75rem' }}>No image available</span>
    </div>
  );
}
