import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.56.1', '192.168.100.*', '*.local'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nusaedu.kotapintar.my.id',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
