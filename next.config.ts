import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cwwp2.dot.ca.gov',
        pathname: '/data/**',
      },
      {
        protocol: 'https',
        hostname: 'www.dot.ca.gov',
        pathname: '/cwwp2/data/**',
      },
    ],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
