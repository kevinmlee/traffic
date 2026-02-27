interface LoadingSkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function LoadingSkeleton({ style }: LoadingSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className="skeleton-shimmer"
      style={{
        borderRadius: '0.75rem',
        ...style,
      }}
    />
  );
}

export function CameraCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      style={{
        borderRadius: '0.75rem',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-surface)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <LoadingSkeleton style={{ height: '180px', borderRadius: 0 }} />
      <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <LoadingSkeleton style={{ height: '1rem', width: '75%', borderRadius: '0.25rem' }} />
        <LoadingSkeleton style={{ height: '0.875rem', width: '50%', borderRadius: '0.25rem' }} />
        <LoadingSkeleton style={{ height: '0.875rem', width: '60%', borderRadius: '0.25rem' }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div
      aria-label="Loading cameras…"
      aria-busy="true"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CameraCardSkeleton key={i} />
      ))}
    </div>
  );
}
