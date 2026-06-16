'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ALL_FACETS, FILTER_LABELS } from '@/types';
import type { CameraFacet, FilterState } from '@/types';

interface FilterButtonProps {
  filters: FilterState;
  onToggle: (facet: CameraFacet) => void;
  onClear: () => void;
  facetCounts?: Partial<Record<CameraFacet, number>>;
}

/** A compact "Filter (N)" trigger that opens a modal of facet toggles. */
export function FilterButton({ filters, onToggle, onClear, facetCounts }: FilterButtonProps) {
  const [open, setOpen] = useState(false);
  const activeCount = filters.facets.size;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Filters${activeCount > 0 ? `, ${activeCount} active` : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.45rem 0.85rem',
          borderRadius: '0.6rem',
          border: `1px solid ${activeCount > 0 ? 'var(--color-signal-500)' : 'var(--color-border)'}`,
          backgroundColor: activeCount > 0 ? 'var(--color-brand-50)' : 'var(--color-bg-base)',
          color: activeCount > 0 ? 'var(--color-signal-600)' : 'var(--color-text-secondary)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filter
        {activeCount > 0 && (
          <span
            className="font-mono"
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '1.25rem',
              height: '1.25rem',
              padding: '0 0.3rem',
              borderRadius: '0.35rem',
              backgroundColor: 'var(--color-signal-500)',
              color: '#0a0b0d',
              fontSize: '0.6875rem',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <FilterModal
          filters={filters}
          onToggle={onToggle}
          onClear={onClear}
          facetCounts={facetCounts}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

interface FilterModalProps extends FilterButtonProps {
  onClose: () => void;
}

function FilterModal({ filters, onToggle, onClear, facetCounts, onClose }: FilterModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return (
    <div
      role="presentation"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(5, 6, 8, 0.72)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
      className="filter-modal-backdrop"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderRadius: '1rem',
          boxShadow: 'var(--shadow-modal)',
          width: '100%',
          maxWidth: '24rem',
          maxHeight: '85dvh',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1.1rem 1.25rem',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2
            id="filter-modal-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: 'var(--color-text-primary)',
              margin: 0,
            }}
          >
            Filters
          </h2>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close filters"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--color-border)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Facet rows */}
        <div role="group" aria-label="Filter cameras" style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 0' }}>
          {ALL_FACETS.map((facet) => {
            const isActive = filters.facets.has(facet);
            const count = facetCounts?.[facet];
            return (
              <button
                key={facet}
                role="switch"
                aria-checked={isActive}
                onClick={() => onToggle(facet)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  width: '100%',
                  padding: '0.85rem 1.25rem',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ flex: 1 }}>
                  {FILTER_LABELS[facet]}
                  {count !== undefined && (
                    <span
                      className="font-mono"
                      style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}
                    >
                      {count}
                    </span>
                  )}
                </span>
                {/* Toggle track */}
                <span
                  aria-hidden="true"
                  style={{
                    position: 'relative',
                    width: '2.4rem',
                    height: '1.4rem',
                    borderRadius: '999px',
                    backgroundColor: isActive ? 'var(--color-signal-500)' : 'var(--color-border-strong)',
                    transition: 'background-color 0.15s',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '0.15rem',
                      left: isActive ? 'calc(100% - 1.25rem)' : '0.15rem',
                      width: '1.1rem',
                      height: '1.1rem',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      transition: 'left 0.15s',
                    }}
                  />
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <button
            type="button"
            onClick={onClear}
            disabled={filters.facets.size === 0}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '0.6rem',
              border: '1px solid var(--color-border)',
              backgroundColor: 'transparent',
              color: 'var(--color-text-secondary)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: filters.facets.size === 0 ? 'default' : 'pointer',
              opacity: filters.facets.size === 0 ? 0.5 : 1,
            }}
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '0.6rem',
              border: 'none',
              backgroundColor: 'var(--color-bg-accent)',
              color: 'var(--color-text-on-accent)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
