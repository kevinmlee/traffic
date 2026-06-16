'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { SkipNav } from '@/components/ui/SkipNav';
import { SearchBar } from '@/components/ui/SearchBar';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { FilterButton } from '@/components/ui/FilterButton';
import { SkeletonGrid } from '@/components/ui/LoadingSkeleton';
import { CameraGrid } from '@/components/camera/CameraGrid';
import { CameraModal } from '@/components/camera/CameraModal';
import { MapView } from '@/components/map/MapView';
import { Header } from '@/components/layout/Header';
import { Hero } from '@/components/layout/Hero';
import { Footer } from '@/components/layout/Footer';
import { toggleFacet, createDefaultFilters, clearFilters, applyFilters } from '@/lib/filters';
import { ALL_FACETS } from '@/types';
import type {
  Camera,
  BoundingBox,
  GeocodedLocation,
  CameraFacet,
  FilterState,
} from '@/types';
import type { ViewMode } from '@/components/ui/ViewToggle';


export default function HomePage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [filters, setFilters] = useState<FilterState>(createDefaultFilters);
  const [textQuery, setTextQuery] = useState('');
  const [view, setView] = useState<ViewMode>('grid');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [currentBbox, setCurrentBbox] = useState<BoundingBox | undefined>();
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isFetchingRef = useRef(false);
  const bboxRef = useRef<BoundingBox | undefined>(undefined);
  // Sentinel kept for layout compatibility (no longer used for pagination)
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Stream NDJSON from /api/cameras, appending cameras as each provider resolves
  const streamCameras = useCallback(async (bbox: BoundingBox | undefined) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    setCameras([]);
    setTotalCount(0);

    const params = new URLSearchParams();
    if (bbox) params.set('bbox', `${bbox.north},${bbox.south},${bbox.east},${bbox.west}`);

    try {
      const res = await fetch(`/api/cameras?${params.toString()}`);
      if (!res.ok || !res.body) throw new Error('Failed to fetch cameras');

      // Show content immediately — hide skeleton as soon as first chunk arrives
      let firstChunk = true;
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line) as
              | { type: 'cameras'; cameras: Camera[] }
              | { type: 'done'; total: number };

            if (msg.type === 'cameras') {
              if (firstChunk) { setIsLoading(false); firstChunk = false; }
              setCameras(prev => [...prev, ...msg.cameras]);
            } else if (msg.type === 'done') {
              setTotalCount(msg.total);
            }
          } catch {
            // malformed line — skip
          }
        }
      }
    } catch {
      setError('Failed to load camera data. Please try again.');
      setCameras([]);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    void streamCameras(undefined);
  }, [streamCameras]);

  const handleSearch = useCallback((bbox: BoundingBox, location: GeocodedLocation) => {
    bboxRef.current = bbox;
    setCurrentBbox(bbox);
    setLocationLabel(location.displayName);
    // Committing a location is a geographic search, not a text search. Clear any
    // typed query so it doesn't keep filtering the nearby results to nothing.
    setTextQuery('');
    void streamCameras(bbox);
  }, [streamCameras]);

  const handleClear = useCallback(() => {
    bboxRef.current = undefined;
    setCurrentBbox(undefined);
    setLocationLabel(null);
    setTextQuery('');
    void streamCameras(undefined);
  }, [streamCameras]);

  const handleToggleFacet = useCallback((facet: CameraFacet) => {
    setFilters(prev => toggleFacet(prev, facet));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(clearFilters());
  }, []);

  const filteredCameras = useMemo(
    () => applyFilters(cameras, filters, textQuery),
    [cameras, filters, textQuery]
  );

  // Count cameras matching each facet, for filter chip badges
  const facetCounts = useMemo(() => {
    const counts: Partial<Record<CameraFacet, number>> = {};
    for (const facet of ALL_FACETS) counts[facet] = 0;
    for (const cam of cameras) {
      if (cam.inService) counts.inService! += 1;
      if (cam.streamingVideoUrl) counts.hasVideo! += 1;
      if (cam.referenceImages.length > 0) counts.hasSnapshots! += 1;
    }
    return counts;
  }, [cameras]);

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

        <Hero cameraCount={totalCount} locationLabel={locationLabel} />

        <main id="main-content" className="main-content" style={{ flex: 1, padding: '1.75rem 1.5rem 2.5rem' }}>
          <div
            style={{
              maxWidth: '1440px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Command bar — search + controls in one designed panel */}
            <div
              className="command-bar"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '1.1rem',
                borderRadius: '1rem',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg-surface)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <SearchBar
                onSearch={handleSearch}
                onClear={handleClear}
                onTextSearch={setTextQuery}
                isLoading={isLoading}
              />

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  paddingTop: '0.9rem',
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <FilterButton
                  filters={filters}
                  onToggle={handleToggleFacet}
                  onClear={handleClearFilters}
                  facetCounts={facetCounts}
                />
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
                isLoadingMore={false}
                hasMore={false}
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
