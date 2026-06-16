'use client';

interface HeroProps {
  /** Total cameras currently loaded, for the live stat readout */
  cameraCount: number;
  /** Whether a location search is active */
  locationLabel?: string | null;
}

export function Hero({ cameraCount, locationLabel }: HeroProps) {
  return (
    <section
      aria-label="Introduction"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Decorative scanline grid overlay */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(90deg, var(--color-border) 0, var(--color-border) 1px, transparent 1px, transparent 120px)',
          opacity: 0.5,
          maskImage: 'linear-gradient(to bottom, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '3.5rem 1.5rem 2.75rem',
        }}
      >
        {/* Eyebrow */}
        <div
          className="card-rise"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            animationDelay: '0.02s',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-signal-500)',
              animation: 'signal-pulse 1.8s ease-in-out infinite',
            }}
          />
          <span className="eyebrow">Live traffic cameras · Worldwide</span>
        </div>

        {/* Headline */}
        <h1
          className="card-rise"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.25rem, 6vw, 4.25rem)',
            fontWeight: 800,
            lineHeight: 0.98,
            letterSpacing: '-0.035em',
            margin: '1.1rem 0 0',
            maxWidth: '18ch',
            animationDelay: '0.08s',
          }}
        >
          Watch the world&apos;s roads,{' '}
          <span
            style={{
              color: 'var(--color-signal-500)',
              fontStyle: 'italic',
            }}
          >
            live.
          </span>
        </h1>

        {/* Subhead */}
        <p
          className="card-rise"
          style={{
            fontSize: 'clamp(0.95rem, 1.6vw, 1.125rem)',
            color: 'var(--color-text-secondary)',
            maxWidth: '46ch',
            margin: '1.1rem 0 0',
            lineHeight: 1.55,
            animationDelay: '0.14s',
          }}
        >
          Thousands of live traffic cameras around the globe. Search any address,
          scan the map, and watch conditions update in real time.
        </p>

        {/* Live stat readout */}
        <div
          className="card-rise"
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: '0',
            marginTop: '1.9rem',
            border: '1px solid var(--color-border)',
            borderRadius: '0.875rem',
            backgroundColor: 'var(--color-bg-surface)',
            boxShadow: 'var(--shadow-card)',
            overflow: 'hidden',
            width: 'fit-content',
            maxWidth: '100%',
            animationDelay: '0.2s',
          }}
        >
          <Stat
            value={cameraCount > 0 ? cameraCount.toLocaleString() : '—'}
            label={locationLabel ? 'in view' : 'cameras live'}
          />
          <Divider />
          <Stat value="Global" label="coverage" />
          <Divider />
          <Stat value="24/7" label="live" accent />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem',
        padding: '0.85rem 1.35rem',
      }}
    >
      <span
        className="font-mono"
        style={{
          fontSize: '1.4rem',
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: '-0.01em',
          color: accent ? 'var(--color-signal-500)' : 'var(--color-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
      <span
        className="eyebrow"
        style={{ fontSize: '0.625rem', letterSpacing: '0.14em' }}
      >
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div
      aria-hidden="true"
      style={{ width: '1px', alignSelf: 'stretch', backgroundColor: 'var(--color-border)' }}
    />
  );
}
