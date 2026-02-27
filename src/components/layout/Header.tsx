import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Header() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border)',
        backdropFilter: 'blur(16px)',
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
            gap: '0.5rem',
            userSelect: 'none',
          }}
          aria-label="TrafficEye"
        >
          {/* SVG mark: eye with converging road lanes */}
          <svg
            width="34"
            height="22"
            viewBox="0 0 34 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Outer eye shape — amber gradient stroke */}
            <defs>
              <linearGradient id="eye-grad" x1="0" y1="0" x2="34" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#fb923c" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
              <clipPath id="eye-clip">
                <path d="M1 11 C6 3, 28 3, 33 11 C28 19, 6 19, 1 11 Z" />
              </clipPath>
            </defs>
            {/* Eye outline */}
            <path
              d="M1 11 C6 3, 28 3, 33 11 C28 19, 6 19, 1 11 Z"
              stroke="url(#eye-grad)"
              strokeWidth="1.5"
              fill="none"
              strokeLinejoin="round"
            />
            {/* Iris circle */}
            <circle
              cx="17"
              cy="11"
              r="5.5"
              fill="url(#eye-grad)"
              opacity="0.15"
            />
            <circle
              cx="17"
              cy="11"
              r="5.5"
              stroke="url(#eye-grad)"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Pupil — solid amber dot */}
            <circle cx="17" cy="11" r="2.25" fill="#f97316" />
            {/* Road lane lines converging into iris from bottom */}
            <g clipPath="url(#eye-clip)" opacity="0.55">
              <line x1="17" y1="19" x2="13" y2="16.5" stroke="#f97316" strokeWidth="1" strokeLinecap="round" />
              <line x1="17" y1="19" x2="17" y2="16.5" stroke="#f97316" strokeWidth="1" strokeLinecap="round" />
              <line x1="17" y1="19" x2="21" y2="16.5" stroke="#f97316" strokeWidth="1" strokeLinecap="round" />
            </g>
          </svg>

          {/* Wordmark using Syne display font */}
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Traffic
            </span>
            <span
              style={{
                fontWeight: 800,
                color: 'var(--color-brand-500)',
              }}
            >
              Eye
            </span>
          </span>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
