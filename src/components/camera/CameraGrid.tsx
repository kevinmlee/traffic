'use client';

import { useRef, useEffect, useState } from 'react';
import { CameraCard } from './CameraCard';
import type { Camera } from '@/types';

const PAGE = 30;

interface CameraGridProps {
  cameras: Camera[];
  onSelect: (camera: Camera) => void;
  // kept for API compat — unused
  isLoadingMore?: boolean;
  hasMore?: boolean;
  sentinelRef?: React.RefObject<HTMLDivElement | null>;
}

export function CameraGrid({ cameras, onSelect }: CameraGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset when cameras list changes (new search)
  useEffect(() => {
    setVisibleCount(PAGE);
  }, [cameras]);

  // Append next batch when sentinel scrolls into view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(n => Math.min(n + PAGE, cameras.length));
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [cameras.length]);

  if (cameras.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '4rem 2rem',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
        <div>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-secondary)', margin: 0 }}>No cameras found</p>
          <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0' }}>Try searching a different location or adjusting your filters.</p>
        </div>
      </div>
    );
  }

  const visible = cameras.slice(0, visibleCount);
  const hasMore = visibleCount < cameras.length;

  return (
    <section aria-label={`${cameras.length} traffic camera${cameras.length !== 1 ? 's' : ''}`}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '0.875rem',
        }}
      >
        {visible.map((camera) => (
          <CameraCard key={camera.id} camera={camera} onSelect={onSelect} />
        ))}
      </div>

      {hasMore ? (
        <div ref={sentinelRef} aria-hidden="true" style={{ height: '1px', marginTop: '2rem' }} />
      ) : (
        <p aria-live="polite" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          All {cameras.length.toLocaleString()} cameras loaded
        </p>
      )}
    </section>
  );
}
