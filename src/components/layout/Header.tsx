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
        boxShadow: 'inset 0 -1px 0 0 rgba(255,255,255,0.04), 0 1px 24px -4px rgb(0 0 0 / 0.12)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '3.5rem',
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
            gap: '0.625rem',
            userSelect: 'none',
          }}
          aria-label="Trafficam"
        >
          {/* Mark: amber square with aperture cutout */}
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="mark-grad" x1="0" y1="0" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#ea6c0a" />
              </linearGradient>
            </defs>
            {/* Rounded square background */}
            <rect width="30" height="30" rx="7" fill="url(#mark-grad)" />
            {/* Aperture blades — 6 rotated rectangles clipped to a circle */}
            {/* Outer lens ring */}
            <circle cx="15" cy="15" r="9" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" />
            {/* 6-blade shutter: rotated rectangles */}
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <rect
                key={deg}
                x="13.5"
                y="8"
                width="3"
                height="8"
                rx="1.5"
                fill="white"
                opacity="0.88"
                transform={`rotate(${deg} 15 15)`}
              />
            ))}
            {/* Center lens dot */}
            <circle cx="15" cy="15" r="2.5" fill="url(#mark-grad)" />
            <circle cx="15" cy="15" r="1.25" fill="white" opacity="0.9" />
          </svg>

          {/* Wordmark: TRAFFICAM in Syne */}
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            <span style={{ color: 'var(--color-text-primary)' }}>Traffic</span>
            <span style={{ color: 'var(--color-brand-500)' }}>cam</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a
            href="https://buymeacoffee.com/sirwafflelot"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Buy me a coffee"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--glass-border)',
              backgroundColor: 'var(--glass-bg)',
              color: 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-brand-500)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-brand-500)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-text-secondary)';
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--glass-border)';
            }}
          >
            ☕ Buy me a coffee
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
