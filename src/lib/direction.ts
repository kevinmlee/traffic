// Convert a provider's free-text camera direction into a compass bearing.
// Handles "N", "NB", "North", "Northbound", "NE", "Southwest", etc.
// Returns null for values with no single direction ("B" = both, "Median", "").

const BEARINGS: Record<string, number> = {
  N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315,
};

export function directionToBearing(direction: string | null | undefined): number | null {
  if (!direction) return null;

  let d = direction.toUpperCase().replace(/[^A-Z]/g, '').replace(/BOUND$/, '');
  d = d.replace('NORTH', 'N').replace('SOUTH', 'S').replace('EAST', 'E').replace('WEST', 'W');
  if (d.length > 1 && d.endsWith('B')) d = d.slice(0, -1);

  return BEARINGS[d] ?? null;
}
