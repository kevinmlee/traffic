'use client';

import { useState, useRef, useCallback } from 'react';
import { geocodeAddress } from '@/lib/geocoding';
import { bboxFromCenter } from '@/lib/distance';
import type { BoundingBox, GeocodedLocation } from '@/types';

interface SearchBarProps {
  onSearch: (bbox: BoundingBox, location: GeocodedLocation) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, onClear, isLoading = false }: SearchBarProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const lastGeocodedRef = useRef<string>('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const query = value.trim();
    if (!query || query === lastGeocodedRef.current) return;

    setError(null);
    setIsGeocoding(true);

    try {
      const location = await geocodeAddress(query);
      if (!location) {
        setError('Address not found. Try a more specific location.');
        return;
      }
      lastGeocodedRef.current = query;
      const bbox = bboxFromCenter(location.latitude, location.longitude, 30);
      onSearch(bbox, location);
    } catch {
      setError('Failed to look up address. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  }, [value, onSearch]);

  const handleClear = () => {
    setValue('');
    lastGeocodedRef.current = '';
    setError(null);
    onClear();
  };

  return (
    <div role="search" aria-label="Search for traffic cameras by address">
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <label htmlFor="address-search" className="sr-only">
            Enter an address or city
          </label>
          <div
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            id="address-search"
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter an address, city, or highway…"
            autoComplete="street-address"
            aria-describedby={error ? 'search-error' : undefined}
            style={{
              width: '100%',
              paddingLeft: '2.5rem',
              paddingRight: value ? '2.5rem' : '0.75rem',
              paddingTop: '0.625rem',
              paddingBottom: '0.625rem',
              borderRadius: '0.625rem',
              border: `1px solid ${error ? '#ef4444' : 'var(--color-border)'}`,
              backgroundColor: 'var(--color-bg-surface)',
              color: 'var(--color-text-primary)',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-brand-500)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--color-border)';
            }}
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem',
                borderRadius: '0.25rem',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={!value.trim() || isGeocoding || isLoading}
          aria-label="Search"
          style={{
            padding: '0.625rem 1.25rem',
            borderRadius: '0.625rem',
            backgroundColor: 'var(--color-bg-accent)',
            color: 'var(--color-text-on-accent)',
            border: 'none',
            cursor: isGeocoding || isLoading ? 'wait' : 'pointer',
            fontWeight: 600,
            fontSize: '0.9375rem',
            opacity: !value.trim() || isGeocoding || isLoading ? 0.6 : 1,
            transition: 'opacity 0.15s',
            whiteSpace: 'nowrap',
          }}
        >
          {isGeocoding ? 'Searching…' : 'Search'}
        </button>
      </form>
      {error && (
        <p
          id="search-error"
          role="alert"
          style={{
            marginTop: '0.375rem',
            fontSize: '0.875rem',
            color: '#ef4444',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
