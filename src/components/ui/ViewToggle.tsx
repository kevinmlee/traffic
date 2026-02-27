'use client';

export type ViewMode = 'grid' | 'map';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="View mode"
      style={{
        display: 'flex',
        borderRadius: '0.625rem',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        backgroundColor: 'var(--color-bg-elevated)',
      }}
    >
      <button
        role="radio"
        aria-checked={view === 'grid'}
        onClick={() => onChange('grid')}
        aria-label="Grid view"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.5rem 0.875rem',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'background-color 0.15s, color 0.15s',
          backgroundColor: view === 'grid' ? 'var(--color-bg-accent)' : 'transparent',
          color: view === 'grid' ? 'var(--color-text-on-accent)' : 'var(--color-text-secondary)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="14" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
        Grid
      </button>
      <button
        role="radio"
        aria-checked={view === 'map'}
        onClick={() => onChange('map')}
        aria-label="Map view"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.5rem 0.875rem',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'background-color 0.15s, color 0.15s',
          backgroundColor: view === 'map' ? 'var(--color-bg-accent)' : 'transparent',
          color: view === 'map' ? 'var(--color-text-on-accent)' : 'var(--color-text-secondary)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          <line x1="9" x2="9" y1="3" y2="18" />
          <line x1="15" x2="15" y1="6" y2="21" />
        </svg>
        Map
      </button>
    </div>
  );
}
