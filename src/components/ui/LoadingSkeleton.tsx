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
    <LoadingSkeleton
      style={{
        borderRadius: '1rem',
        aspectRatio: '16/10',
        border: '1px solid var(--color-border)',
        boxShadow: '0 2px 8px -2px rgba(0,0,0,0.18)',
      }}
    />
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div
      aria-label="Loading cameras…"
      aria-busy="true"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
        gap: '1.1rem',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CameraCardSkeleton key={i} />
      ))}
    </div>
  );
}
