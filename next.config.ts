import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/archive-and-search',
        destination: '/archive',
        permanent: false,
      },
      {
        source: '/upload-data',
        destination: '/upload',
        permanent: false,
      },
      {
        source: '/reports',
        destination: '/admin/reports',
        permanent: false,
      },
      {
        source: '/committee-detail',
        destination: '/committees',
        permanent: false,
      },
      {
        source: '/event-detail',
        destination: '/events',
        permanent: false,
      },
      {
        source: '/roster',
        destination: '/committees',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
