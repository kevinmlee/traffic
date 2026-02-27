'use client';

import { useState, useCallback, useEffect } from 'react';
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
import type {
  Camera,
  BoundingBox,
  GeocodedLocation,
  CameraCategory,
  ApiCamerasResponse,
  FilterState,
} from '@/types';
import type { ViewMode } from '@/components/ui/ViewToggle';

export default function HomePage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [filters, setFilters] = useState<FilterState>(createDefaultFilters);
  const [view, setView] = useState<ViewMode>('grid');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBbox, setCurrentBbox] = useState<BoundingBox | undefined>();
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCameras = useCallback(async (bbox?: BoundingBox) => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (bbox) {
      params.set('bbox', `${bbox.north},${bbox.south},${bbox.east},${bbox.west}`);
    }

    try {
      const res = await fetch(`/api/cameras${params.size ? `?${params.toString()}` : ''}`);
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

  // Load all California cameras on initial mount
  useEffect(() => {
    void loadCameras();
  }, [loadCameras]);

  const handleSearch = useCallback((bbox: BoundingBox, location: GeocodedLocation) => {
    setCurrentBbox(bbox);
    setLocationLabel(location.displayName);
    void loadCameras(bbox);
  }, [loadCameras]);

  const handleClear = useCallback(() => {
    setCurrentBbox(undefined);
    setLocationLabel(null);
    void loadCameras();
  }, [loadCameras]);

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

        <main id="main-content" style={{ flex: 1, padding: '1.5rem' }}>
          <div
            style={{
              maxWidth: '1400px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Search + controls row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
              }}
            >
              {/* Search bar */}
              <SearchBar
                onSearch={handleSearch}
                onClear={handleClear}
                isLoading={isLoading}
              />

              {/* Status + controls row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                {/* Left: filters + status label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
                  <FilterChips
                    filters={filters}
                    onToggle={handleToggleCategory}
                    cameraCounts={cameraCounts}
                  />
                  {!isLoading && (
                    <span
                      aria-live="polite"
                      aria-atomic="true"
                      style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}
                    >
                      {locationLabel
                        ? `Near ${locationLabel.split(',')[0]}`
                        : 'All California'}
                      {' · '}
                      {filteredCameras.length} camera{filteredCameras.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Right: view toggle */}
                <ViewToggle view={view} onChange={setView} />
              </div>
            </div>

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

            {/* Loading skeleton */}
            {isLoading && <SkeletonGrid count={12} />}

            {/* Grid view */}
            {!isLoading && view === 'grid' && (
              <CameraGrid cameras={filteredCameras} onSelect={setSelectedCamera} />
            )}

            {/* Map view */}
            {!isLoading && view === 'map' && (
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
