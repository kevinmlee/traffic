import type { Camera, CameraCategory, FilterState } from '@/types';

export function applyFilters(cameras: Camera[], filters: FilterState, textQuery = ''): Camera[] {
  const q = textQuery.trim().toLowerCase();

  return cameras.filter(camera => {
    // Category filter: show only cameras that have at least one active category
    if (filters.categories.size > 0) {
      const hasMatch = camera.categories.some(cat => filters.categories.has(cat));
      if (!hasMatch) return false;
    }

    if (filters.inServiceOnly && !camera.inService) {
      return false;
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

export function toggleCategory(
  filters: FilterState,
  category: CameraCategory
): FilterState {
  const next = new Set(filters.categories);
  if (next.has(category)) {
    next.delete(category);
  } else {
    next.add(category);
  }
  return { ...filters, categories: next };
}

export function createDefaultFilters(): FilterState {
  return {
    categories: new Set<CameraCategory>(),
    inServiceOnly: false,
  };
}
