import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Header() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: 'inset 0 -1px 0 0 rgba(255,255,255,0.04), 0 1px 24px -8px rgb(0 0 0 / 0.18)',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Logotype */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.7rem',
            userSelect: 'none',
          }}
          aria-label="Trafficam"
        >
          {/* Mark: amber lens / aperture */}
          <svg
            width="34"
            height="34"
            viewBox="0 0 34 34"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <defs>
              <linearGradient id="mark-grad" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffb066" />
                <stop offset="55%" stopColor="#ff8a1f" />
                <stop offset="100%" stopColor="#f06d00" />
              </linearGradient>
            </defs>
            <rect width="34" height="34" rx="9" fill="url(#mark-grad)" />
            <circle cx="17" cy="17" r="10" stroke="#0a0b0d" strokeWidth="1.6" fill="none" opacity="0.32" />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <rect
                key={deg}
                x="15.4"
                y="8.5"
                width="3.2"
                height="8.5"
                rx="1.6"
                fill="#0a0b0d"
                opacity="0.78"
                transform={`rotate(${deg} 17 17)`}
              />
            ))}
            <circle cx="17" cy="17" r="2.8" fill="#fffaf3" />
          </svg>

          {/* Wordmark */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}
            >
              <span style={{ color: 'var(--color-text-primary)' }}>traffic</span>
              <span style={{ color: 'var(--color-signal-500)' }}>cam</span>
            </span>
            <span
              className="eyebrow"
              style={{ fontSize: '0.5625rem', letterSpacing: '0.22em', lineHeight: 1 }}
            >
              Live · California
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          {/* Live status pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.3rem 0.7rem',
              borderRadius: '999px',
              border: '1px solid var(--glass-border)',
              backgroundColor: 'var(--color-bg-elevated)',
            }}
            aria-hidden="true"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-live-500)',
                animation: 'live-pulse 2s ease-in-out infinite',
                flexShrink: 0,
              }}
            />
            <span
              className="font-mono"
              style={{
                fontSize: '0.6875rem',
                fontWeight: 500,
                letterSpacing: '0.08em',
                color: 'var(--color-text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Streaming
            </span>
          </div>

          <a
            href="https://buymeacoffee.com/sirwafflelot"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buy me a coffee"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '0.6rem',
              border: '1px solid var(--glass-border)',
              backgroundColor: 'var(--color-bg-elevated)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s, border-color 0.15s, background-color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-signal-500)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-signal-500)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-secondary)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--glass-border)';
            }}
          >
            ☕ Coffee
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
