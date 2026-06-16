import type { Camera, CameraProvider, CameraQueryOptions } from '@/types';
import { caltransProvider } from './caltrans';
import { wsdotProvider } from './wsdot';
import { odotProvider } from './odot';

// Wired up but not active yet:
// - ny511: requires a free API key — re-enable once NEXT_PUBLIC_NY511_KEY is configured.
// - nswtraffic (Australia): the GeoJSON metadata feed is live and keyless, but as of
//   this writing their webcam image host (webcams.transport.nsw.gov.au) returns a
//   "temporarily unavailable" page for every image. Re-enable once images serve again
//   so we don't render a continent of broken-image cards.
// import { ny511Provider } from './ny511';
// import { nswTrafficProvider } from './nswtraffic';

// Registry of all active providers (all keyless).
// To add a new provider: import it here and add to this array.
const providers: CameraProvider[] = [
  caltransProvider, // California, USA
  wsdotProvider,    // Washington, USA
  odotProvider,     // Oregon, USA
];

export async function fetchAllCameras(options?: CameraQueryOptions): Promise<Camera[]> {
  const results = await Promise.all(
    providers.map(provider => provider.fetchCameras(options))
  );
  return results.flat();
}

export async function fetchCameraById(id: string): Promise<Camera | null> {
  for (const provider of providers) {
    if (id.startsWith(provider.slug)) {
      return provider.fetchCameraById(id);
    }
  }
  return null;
}

export { providers };
