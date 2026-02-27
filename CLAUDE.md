# CLAUDE.md — Traffic Camera Explorer

## Project Overview
Next.js 15 web app for exploring live Caltrans traffic cameras.
No database. All data fetched on-demand from public APIs via Next.js route handlers.
Deployed to Netlify.

## Tech Stack
- Next.js 16 (App Router)
- TypeScript 5+ (strict mode)
- Tailwind CSS v4 (CSS-first config in `src/app/globals.css` — no `tailwind.config.js`)
- react-leaflet + Leaflet (must use dynamic import with `ssr: false`)
- next-themes (dark/light mode via `data-theme` attribute)
- Netlify + `@netlify/plugin-nextjs`
- Nominatim (OpenStreetMap) for geocoding — no API key

## Commands
```bash
npm run dev        # Start dev server
npm run build      # Production build
npm start          # Start production server
npm run lint       # Run ESLint (npx eslint .)
npm run typecheck  # TypeScript check only (tsc --noEmit)
```

## No Prettier
This project uses ESLint only for code style — no Prettier. Do not add Prettier.

## Key Architecture Rules

### Next.js 16 Specifics
- `params` and `searchParams` in route handlers MUST be awaited: `const { id } = await params`
- `"use cache"` directive on async functions enables function-level caching (`experimental.dynamicIO: true` in next.config.ts)
- No `next lint` command — run `npm run lint` (which calls `eslint .`) directly
- Turbopack is available but not enabled (no `--turbopack` flag) to avoid compatibility issues with react-leaflet

### Leaflet / Map Rules
- NEVER import react-leaflet or leaflet in Server Components
- `MapView.tsx` is the ONLY file that does `dynamic(() => import('./MapInner'), { ssr: false })`
- All react-leaflet components live exclusively in `MapInner.tsx` and its children
- Leaflet CSS is imported via `globals.css` (`@import "leaflet/dist/leaflet.css"`)
- Fix Leaflet marker icons in `MapInner.tsx` (default icons break in bundlers)

### Tailwind v4 Rules
- No `tailwind.config.js` — all config in `src/app/globals.css` using `@theme {}`
- Dark mode uses `[data-theme="dark"]` CSS selector (set by next-themes)
- `@import "tailwindcss"` at top of `globals.css` (not `@tailwind` directives)
- Do NOT use `dark:` Tailwind prefix — use CSS `[data-theme="dark"]` overrides

### next-themes Rules
- `attribute="data-theme"`, `defaultTheme="system"`, `enableSystem`
- Always use `resolvedTheme` (not `theme`) in components to avoid hydration mismatches
- `<html suppressHydrationWarning>` is required in `layout.tsx`

### Data Provider Rules
- All providers implement `CameraProvider` interface in `src/types/index.ts`
- Caltrans data: 12 static district JSON files, fetched in parallel, filtered by bbox
- All Caltrans numeric fields come as strings — always parseInt/parseFloat
- `"Not Reported"` string means null/unavailable — handle everywhere with null checks
- Adding a new provider: create `src/lib/providers/{name}.ts`, implement `CameraProvider`, register in `src/lib/providers/index.ts`

### Camera Image Rules
- Always use `unoptimized` prop on `next/image` for live camera feeds
- Cache-bust with `?t=Date.now()` query param for auto-refresh
- Refresh interval: `Math.max(updateFrequencyMinutes * 60000, 30000)` (min 30s)
- Handle null `imageUrl` and broken image loads with a placeholder

### API Route Rules
- `params` and `searchParams` in route handlers must be awaited (Next.js 15)
- API routes proxy Caltrans data — never expose raw upstream URLs to the client

## Caltrans API
- Endpoint pattern: `https://cwwp2.dot.ca.gov/data/d{N}/cctv/cctvStatusD{NN}.json`
- Districts 1–12, `{N}` has no leading zero, `{NN}` is zero-padded
- No auth, no API key required
- Only fetch districts whose bbox intersects the user's search bbox (D4 Bay Area and D7 LA are large files)

## Accessibility Requirements
- `SkipNav.tsx` must be the first focusable element on every page (`href="#main-content"`)
- Camera cards: `role="button"`, `tabIndex={0}`, `onKeyDown` handler for Enter key
- `CameraModal`: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, Escape closes
- Filter chips: `role="switch"`, `aria-checked`
- All images: descriptive `alt` text
- Sufficient color contrast in both light and dark themes

## Map Tiles
- Light mode: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png` (CartoDB Positron)
- Dark mode: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png` (CartoDB Dark Matter)
- Subdomains: `['a', 'b', 'c', 'd']`
- No API key required
- Attribution: `© OpenStreetMap contributors © CARTO`

## Environment Variables
No env vars required for local development (all APIs are public).
For production, set `NEXT_PUBLIC_SITE_URL` in Netlify dashboard.

## Geocoding
- Nominatim OpenStreetMap: `https://nominatim.openstreetmap.org/search`
- Requires `User-Agent` header (OSM policy): `TrafficCameraExplorer/1.0`
- Rate limit: 1 request/second max — cache geocode results in component state
