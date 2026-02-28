'use client';

import { ALL_CATEGORIES, FILTER_LABELS } from '@/types';
import type { CameraCategory, FilterState } from '@/types';

interface FilterChipsProps {
  filters: FilterState;
  onToggle: (category: CameraCategory) => void;
  cameraCounts?: Partial<Record<CameraCategory, number>>;
}

export function FilterChips({ filters, onToggle, cameraCounts }: FilterChipsProps) {
  return (
    <div
      role="group"
      aria-label="Filter cameras"
      style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
    >
      {ALL_CATEGORIES.map((category) => {
        const isActive = filters.categories.has(category);
        const count = cameraCounts?.[category];

        return (
          <button
            key={category}
            role="switch"
            aria-checked={isActive}
            aria-label={`Filter by ${FILTER_LABELS[category]}${count !== undefined ? `, ${count} cameras` : ''}`}
            onClick={() => onToggle(category)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              borderRadius: '999px',
              border: `1.5px solid ${isActive ? 'var(--color-bg-accent)' : 'var(--color-border)'}`,
              backgroundColor: isActive ? 'var(--color-bg-accent)' : 'var(--color-bg-surface)',
              color: isActive ? 'var(--color-text-on-accent)' : 'var(--color-text-secondary)',
              fontSize: '0.8125rem',
              fontWeight: isActive ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            <CategoryIcon category={category} isActive={isActive} />
            {FILTER_LABELS[category]}
            {count !== undefined && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '1.25rem',
                  height: '1.25rem',
                  padding: '0 0.25rem',
                  borderRadius: '999px',
                  backgroundColor: isActive ? 'rgba(0,0,0,0.15)' : 'var(--color-bg-elevated)',
                  color: isActive ? 'var(--color-text-on-accent)' : 'var(--color-text-muted)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                }}
                aria-hidden="true"
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function CategoryIcon({ category, isActive }: { category: CameraCategory; isActive: boolean }) {
  const color = isActive ? 'var(--color-text-on-accent)' : 'var(--color-text-muted)';

  switch (category) {
    case 'accidents':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <path d="M12 9v4"/>
          <path d="M12 17h.01"/>
        </svg>
      );
    case 'congestion':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect width="18" height="18" x="3" y="3" rx="2"/>
          <path d="M3 9h18"/>
          <path d="M3 15h18"/>
          <path d="M9 3v18"/>
          <path d="M15 3v18"/>
        </svg>
      );
    case 'construction':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
        </svg>
      );
    case 'weather':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
        </svg>
      );
  }
}
