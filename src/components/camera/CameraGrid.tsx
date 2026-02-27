import type { RefObject } from 'react';
import { CameraCard } from './CameraCard';
import { CameraCardSkeleton } from '@/components/ui/LoadingSkeleton';
import type { Camera } from '@/types';

interface CameraGridProps {
  cameras: Camera[];
  onSelect: (camera: Camera) => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  sentinelRef?: RefObject<HTMLDivElement | null>;
}

export function CameraGrid({
  cameras,
  onSelect,
  isLoadingMore = false,
  hasMore = false,
  sentinelRef,
}: CameraGridProps) {
  if (cameras.length === 0 && !isLoadingMore) {
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
        <div>
          <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text-secondary)', margin: 0 }}>
            No cameras found
          </p>
          <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
            Try searching a different location or adjusting your filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      aria-label={`${cameras.length} traffic camera${cameras.length !== 1 ? 's' : ''}${hasMore ? ', scroll to load more' : ''}`}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        {cameras.map((camera) => (
          <CameraCard key={camera.id} camera={camera} onSelect={onSelect} />
        ))}

        {/* Skeleton cards while loading the next page */}
        {isLoadingMore && Array.from({ length: 6 }).map((_, i) => (
          <CameraCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>

      {/* Intersection sentinel — triggers next page load when scrolled into view */}
      {hasMore && (
        <div
          ref={sentinelRef}
          aria-hidden="true"
          style={{ height: '1px', marginTop: '2rem' }}
        />
      )}

      {/* End of results */}
      {!hasMore && cameras.length > 0 && (
        <p
          aria-live="polite"
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
          }}
        >
          All {cameras.length} cameras loaded
        </p>
      )}
    </section>
  );
}
