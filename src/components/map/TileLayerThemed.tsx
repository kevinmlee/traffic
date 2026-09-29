'use client';

import { TileLayer } from 'react-leaflet';

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

// OpenStreetMap standard tiles — no API key.
// OSM has no dark style; dark mode is applied with a CSS filter in globals.css
// ([data-theme="dark"] .leaflet-tile-pane).
const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export function TileLayerThemed() {
  return (
    <TileLayer
      url={OSM_TILE_URL}
      attribution={OSM_ATTRIBUTION}
      maxNativeZoom={19}
      maxZoom={20}
    />
  );
}
