import type { Camera, CameraProvider, CameraQueryOptions } from '@/types';
import { caltransProvider } from './caltrans';

// Registry of all active providers.
// To add a new provider: import it here and add to this array.
const providers: CameraProvider[] = [
  caltransProvider,
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
