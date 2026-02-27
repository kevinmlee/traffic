'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '2rem',
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-primary)',
      }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Something went wrong</h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        An error occurred while loading traffic camera data.
      </p>
      <button
        onClick={reset}
        style={{
          padding: '0.5rem 1.25rem',
          borderRadius: '0.5rem',
          backgroundColor: 'var(--color-bg-accent)',
          color: 'var(--color-text-on-accent)',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        Try again
      </button>
    </div>
  );
}
