'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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

const PAGE_SIZE = 30;

export default function HomePage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [filters, setFilters] = useState<FilterState>(createDefaultFilters);
  const [view, setView] = useState<ViewMode>('grid');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  // Loading states: initial vs. loading more pages
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const [currentBbox, setCurrentBbox] = useState<BoundingBox | undefined>();
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track current offset and whether a fetch is already in flight
  const offsetRef = useRef(0);
  const isFetchingRef = useRef(false);
  const bboxRef = useRef<BoundingBox | undefined>(undefined);

  // Sentinel div at the bottom of the grid; IntersectionObserver watches it
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(async (bbox: BoundingBox | undefined, offset: number, append: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });
    if (bbox) {
      params.set('bbox', `${bbox.north},${bbox.south},${bbox.east},${bbox.west}`);
    }

    try {
      const res = await fetch(`/api/cameras?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch cameras');
      const data: ApiCamerasResponse = await res.json() as ApiCamerasResponse;

      setCameras(prev => append ? [...prev, ...data.cameras] : data.cameras);
      setHasMore(data.hasMore);
      setTotalCount(data.total);
      offsetRef.current = offset + data.cameras.length;
    } catch {
      setError('Failed to load camera data. Please try again.');
      if (!append) setCameras([]);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial load — all California cameras
  useEffect(() => {
    void fetchPage(undefined, 0, false);
  }, [fetchPage]);

  // IntersectionObserver: load next page when sentinel scrolls into view
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isFetchingRef.current) {
          void fetchPage(bboxRef.current, offsetRef.current, true);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, fetchPage]);

  const handleSearch = useCallback((bbox: BoundingBox, location: GeocodedLocation) => {
    bboxRef.current = bbox;
    offsetRef.current = 0;
    setCurrentBbox(bbox);
    setLocationLabel(location.displayName);
    setCameras([]);
    void fetchPage(bbox, 0, false);
  }, [fetchPage]);

  const handleClear = useCallback(() => {
    bboxRef.current = undefined;
    offsetRef.current = 0;
    setCurrentBbox(undefined);
    setLocationLabel(null);
    setCameras([]);
    void fetchPage(undefined, 0, false);
  }, [fetchPage]);

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
            {/* Search + controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <SearchBar
                onSearch={handleSearch}
                onClear={handleClear}
                isLoading={isLoading}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
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
                      {locationLabel ? `Near ${locationLabel.split(',')[0]}` : 'All California'}
                      {' · '}
                      {totalCount.toLocaleString()} camera{totalCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
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

            {/* Initial loading skeleton */}
            {isLoading && <SkeletonGrid count={12} />}

            {/* Grid view with infinite scroll */}
            {!isLoading && view === 'grid' && (
              <CameraGrid
                cameras={filteredCameras}
                onSelect={setSelectedCamera}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                sentinelRef={sentinelRef}
              />
            )}

            {/* Map view — loads all currently-fetched cameras */}
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

      {selectedCamera && (
        <CameraModal
          camera={selectedCamera}
          onClose={() => setSelectedCamera(null)}
        />
      )}
    </>
  );
}
