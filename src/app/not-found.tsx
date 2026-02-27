import Link from 'next/link';

export default function NotFound() {
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
      <h1 style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Page not found</h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        style={{
          padding: '0.5rem 1.25rem',
          borderRadius: '0.5rem',
          backgroundColor: 'var(--color-bg-accent)',
          color: 'var(--color-text-on-accent)',
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        Go home
      </Link>
    </div>
  );
}
