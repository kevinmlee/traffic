import type { Camera, CameraFacet, FilterState } from '@/types';

const FACET_PREDICATES: Record<CameraFacet, (camera: Camera) => boolean> = {
  inService: (c) => c.inService,
  hasVideo: (c) => Boolean(c.streamingVideoUrl),
  hasSnapshots: (c) => c.referenceImages.length > 0,
};

export function applyFilters(cameras: Camera[], filters: FilterState, textQuery = ''): Camera[] {
  const q = textQuery.trim().toLowerCase();
  const activeFacets = [...filters.facets];

  return cameras.filter(camera => {
    // Facets are ANDed: a camera must satisfy every active facet.
    for (const facet of activeFacets) {
      if (!FACET_PREDICATES[facet](camera)) return false;
    }

    // Text search: match against route, name, nearbyPlace, county
    if (q) {
      const haystack = [
        camera.route,
        camera.name,
        camera.nearbyPlace,
        camera.county,
        camera.direction,
        camera.imageDescription,
      ].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export function toggleFacet(filters: FilterState, facet: CameraFacet): FilterState {
  const next = new Set(filters.facets);
  if (next.has(facet)) {
    next.delete(facet);
  } else {
    next.add(facet);
  }
  return { ...filters, facets: next };
}

export function createDefaultFilters(): FilterState {
  return {
    facets: new Set<CameraFacet>(),
  };
}

export function clearFilters(): FilterState {
  return createDefaultFilters();
}
