import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const MINIO_URL = process.env.MINIO_INTERNAL_URL || 'http://localhost:9000';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "9000", pathname: "/**" },
      { protocol: "http", hostname: "minio", port: "9000", pathname: "/**" },
      { protocol: "https", hostname: "**", pathname: "/**" },
    ],
    unoptimized: true,
  },
  async rewrites() {
    return [
      // Proxy API calls → backend (works without nginx)
      { source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` },
      { source: '/api-docs/:path*', destination: `${BACKEND_URL}/api-docs/:path*` },
      // Proxy product images → MinIO (works without nginx)
      { source: '/products/:path*', destination: `${MINIO_URL}/products/:path*` },
    ];
  },
};

export default nextConfig;
