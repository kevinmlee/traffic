'use client';

import { useState, useRef, useCallback, useEffect, useId } from 'react';
import { geocodeAddress, geocodeSuggest } from '@/lib/geocoding';
import { bboxFromCenter } from '@/lib/distance';
import type { GeocodeSuggestion } from '@/lib/geocoding';
import type { BoundingBox, GeocodedLocation } from '@/types';

interface SearchBarProps {
  onSearch: (bbox: BoundingBox, location: GeocodedLocation) => void;
  onClear: () => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, onClear, isLoading = false }: SearchBarProps) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const lastGeocodedRef = useRef<string>('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const listId = useId();
  const inputId = useId();

  // Debounced autocomplete fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await geocodeSuggest(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setActiveIndex(-1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const commitSearch = useCallback(async (query: string) => {
    if (!query.trim() || query === lastGeocodedRef.current) return;
    setError(null);
    setShowSuggestions(false);
    setIsGeocoding(true);
    try {
      const location = await geocodeAddress(query);
      if (!location) {
        setError('Address not found. Try a more specific location.');
        return;
      }
      lastGeocodedRef.current = query;
      onSearch(bboxFromCenter(location.latitude, location.longitude, 30), location);
    } catch {
      setError('Failed to look up address. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  }, [onSearch]);

  const selectSuggestion = useCallback((suggestion: GeocodeSuggestion) => {
    setValue(suggestion.shortName);
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    lastGeocodedRef.current = suggestion.shortName;
    inputRef.current?.blur();
    onSearch(bboxFromCenter(suggestion.latitude, suggestion.longitude, 30), {
      displayName: suggestion.displayName,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    });
  }, [onSearch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      selectSuggestion(suggestions[activeIndex]);
    } else {
      void commitSearch(value);
    }
  }, [activeIndex, suggestions, selectSuggestion, commitSearch, value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const handleClear = () => {
    setValue('');
    lastGeocodedRef.current = '';
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    onClear();
    inputRef.current?.focus();
  };

  const borderColor = error ? '#ef4444' : showSuggestions ? 'var(--color-brand-500)' : 'var(--color-border)';

  return (
    <div
      ref={containerRef}
      role="search"
      aria-label="Search for traffic cameras by address"
      style={{ position: 'relative' }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <label htmlFor={inputId} className="sr-only">
            Enter an address or city
          </label>

          {/* Search / spinner icon */}
          <div
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
            aria-hidden="true"
          >
            {isGeocoding ? (
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
                style={{ animation: 'searchbar-spin 0.8s linear infinite' }}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
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
            )}
          </div>

          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            onBlur={() => {
              // Delay so pointer events on suggestions fire first
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            placeholder="Enter an address, city, or highway…"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls={showSuggestions ? listId : undefined}
            aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
            aria-describedby={error ? 'search-error' : undefined}
            aria-expanded={showSuggestions}
            style={{
              width: '100%',
              paddingLeft: '2.5rem',
              paddingRight: value ? '2.5rem' : '0.75rem',
              paddingTop: '0.625rem',
              paddingBottom: '0.625rem',
              borderRadius: showSuggestions ? '0.625rem 0.625rem 0 0' : '0.625rem',
              border: `1px solid ${borderColor}`,
              borderBottomColor: showSuggestions ? 'var(--color-border)' : borderColor,
              backgroundColor: 'var(--color-bg-surface)',
              color: 'var(--color-text-primary)',
              fontSize: '0.9375rem',
              outline: 'none',
              transition: 'border-color 0.15s, border-radius 0.1s',
            }}
          />

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              tabIndex={-1}
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
                zIndex: 1,
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

          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul
              id={listId}
              role="listbox"
              aria-label="Address suggestions"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 50,
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-brand-500)',
                borderTop: 'none',
                borderRadius: '0 0 0.625rem 0.625rem',
                listStyle: 'none',
                margin: 0,
                padding: '0.25rem 0',
                boxShadow: 'var(--shadow-card-hover)',
              }}
            >
              {suggestions.map((suggestion, i) => (
                <li
                  key={suggestion.displayName}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onPointerDown={(e) => {
                    e.preventDefault(); // prevent blur before selection
                    selectSuggestion(suggestion);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(-1)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.625rem',
                    padding: '0.5rem 0.75rem',
                    cursor: 'pointer',
                    backgroundColor: i === activeIndex ? 'var(--color-bg-elevated)' : 'transparent',
                    transition: 'background-color 0.1s',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--color-text-muted)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    style={{ flexShrink: 0, marginTop: '0.125rem' }}
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    <span
                      title={suggestion.shortName}
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--color-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {suggestion.shortName}
                    </span>
                    <span
                      title={suggestion.displayName}
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {suggestion.displayName}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={!value.trim() || isGeocoding || isLoading}
          aria-label="Search for cameras"
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
            flexShrink: 0,
          }}
        >
          {isGeocoding ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && (
        <p
          id="search-error"
          role="alert"
          style={{ marginTop: '0.375rem', fontSize: '0.875rem', color: '#ef4444' }}
        >
          {error}
        </p>
      )}

      <style>{`@keyframes searchbar-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
