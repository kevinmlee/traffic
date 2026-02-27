export function SkipNav() {
  return (
    <a
      href="#main-content"
      className="sr-only"
      style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 9999,
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        backgroundColor: 'var(--color-bg-accent)',
        color: 'var(--color-text-on-accent)',
        fontWeight: 600,
        textDecoration: 'none',
      }}
      onFocus={(e) => {
        (e.currentTarget as HTMLElement).classList.remove('sr-only');
      }}
      onBlur={(e) => {
        (e.currentTarget as HTMLElement).classList.add('sr-only');
      }}
    >
      Skip to main content
    </a>
  );
}
