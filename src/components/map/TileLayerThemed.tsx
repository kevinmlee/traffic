'use client';

import { TileLayer } from 'react-leaflet';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors ' +
  '&copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>';

const TILE_URLS = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
} as const;

export function TileLayerThemed() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use light tiles by default until theme resolves (avoids hydration mismatch)
  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <TileLayer
      url={isDark ? TILE_URLS.dark : TILE_URLS.light}
      attribution={CARTO_ATTRIBUTION}
      subdomains={['a', 'b', 'c', 'd']}
      maxZoom={20}
    />
  );
}
