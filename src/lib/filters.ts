import type { Camera, CameraCategory, FilterState } from '@/types';

export function applyFilters(cameras: Camera[], filters: FilterState): Camera[] {
  return cameras.filter(camera => {
    if (filters.inServiceOnly && !camera.inService) {
      return false;
    }

    if (filters.categories.size > 0) {
      // Only filter cameras that have explicit categories — cameras with no
      // categories (the majority of general highway cameras) always pass through
      if (camera.categories.length > 0) {
        const hasMatchingCategory = camera.categories.some(cat =>
          filters.categories.has(cat)
        );
        if (!hasMatchingCategory) return false;
      }
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
