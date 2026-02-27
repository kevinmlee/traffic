'use client';

import { useState, useCallback } from 'react';
import { SkipNav } from '@/components/ui/SkipNav';
import { SearchBar } from '@/components/ui/SearchBar';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { FilterChips } from '@/components/ui/FilterChips';
import { SkeletonGrid } from '@/components/ui/LoadingSkeleton';
import { CameraGrid } from '@/components/camera/CameraGrid';
import { CameraModal } from '@/components/camera/CameraModal';
import { MapView } from '@/components/map/MapView';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { toggleCategory, createDefaultFilters, applyFilters } from '@/lib/filters';
import type { Camera, BoundingBox, GeocodedLocation, CameraCategory, ApiCamerasResponse, FilterState } from '@/types';
import type { ViewMode } from '@/components/ui/ViewToggle';

export default function HomePage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [filters, setFilters] = useState<FilterState>(createDefaultFilters);
  const [view, setView] = useState<ViewMode>('grid');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentBbox, setCurrentBbox] = useState<BoundingBox | undefined>();
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (bbox: BoundingBox, location: GeocodedLocation) => {
    setIsLoading(true);
    setHasSearched(true);
    setError(null);
    setCurrentBbox(bbox);
    setLocationLabel(location.displayName);

    const params = new URLSearchParams({
      bbox: `${bbox.north},${bbox.south},${bbox.east},${bbox.west}`,
    });

    try {
      const res = await fetch(`/api/cameras?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch cameras');
      const data: ApiCamerasResponse = await res.json() as ApiCamerasResponse;
      setCameras(data.cameras);
    } catch {
      setError('Failed to load camera data. Please try again.');
      setCameras([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    setCameras([]);
    setHasSearched(false);
    setCurrentBbox(undefined);
    setLocationLabel(null);
    setError(null);
  }, []);

  const handleToggleCategory = useCallback((category: CameraCategory) => {
    setFilters(prev => toggleCategory(prev, category));
  }, []);

  const filteredCameras = applyFilters(cameras, filters);

  // Count cameras per category for filter chip badges
  const cameraCounts: Partial<Record<CameraCategory, number>> = {};
  for (const cam of cameras) {
    for (const cat of cam.categories) {
      cameraCounts[cat] = (cameraCounts[cat] ?? 0) + 1;
    }
  }

  return (
    <>
      <SkipNav />
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-bg-base)',
        }}
      >
        <Header />

        <main id="main-content" style={{ flex: 1, padding: '2rem 1.5rem' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Hero / Search section */}
            {!hasSearched && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem 1rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  maxWidth: '600px',
                  margin: '0 auto',
                  width: '100%',
                }}
              >
                <h1
                  style={{
                    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                    fontWeight: 800,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.15,
                    margin: 0,
                  }}
                >
                  Explore Live{' '}
                  <span style={{ color: 'var(--color-brand-500)' }}>Traffic Cameras</span>
                </h1>
                <p
                  style={{
                    fontSize: '1.0625rem',
                    color: 'var(--color-text-secondary)',
                    maxWidth: '440px',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Search by address to find Caltrans traffic cameras near you, or browse the map.
                </p>
                <div style={{ width: '100%', marginTop: '0.5rem' }}>
                  <SearchBar onSearch={handleSearch} onClear={handleClear} isLoading={isLoading} />
                </div>
              </div>
            )}

            {/* Compact search bar after first search */}
            {hasSearched && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <SearchBar onSearch={handleSearch} onClear={handleClear} isLoading={isLoading} />
                {locationLabel && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Showing results near <strong style={{ color: 'var(--color-text-secondary)' }}>{locationLabel.split(',')[0]}</strong>
                    {cameras.length > 0 && (
                      <span> · {cameras.length} camera{cameras.length !== 1 ? 's' : ''} found</span>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Controls: filters + view toggle */}
            {hasSearched && !isLoading && cameras.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <FilterChips
                  filters={filters}
                  onToggle={handleToggleCategory}
                  cameraCounts={cameraCounts}
                />
                <ViewToggle view={view} onChange={setView} />
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                role="alert"
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '0.625rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '0.9375rem',
                }}
              >
                {error}
              </div>
            )}

            {/* Loading */}
            {isLoading && <SkeletonGrid count={12} />}

            {/* Grid view */}
            {!isLoading && hasSearched && view === 'grid' && (
              <CameraGrid cameras={filteredCameras} onSelect={setSelectedCamera} />
            )}

            {/* Map view */}
            {!isLoading && hasSearched && view === 'map' && (
              <MapView
                cameras={filteredCameras}
                onCameraSelect={setSelectedCamera}
                bbox={currentBbox}
              />
            )}

          </div>
        </main>

        <Footer />
      </div>

      {/* Camera detail modal */}
      {selectedCamera && (
        <CameraModal
          camera={selectedCamera}
          onClose={() => setSelectedCamera(null)}
        />
      )}
    </>
  );
}
