import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://10.26.9.48:18080/:path*',
      },
    ];
  },
};

export default nextConfig;
