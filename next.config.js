/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // This is needed for the MediaPipe and face-api.js libraries
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      encoding: false,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:8000/socket.io/:path*',
      },
    ];
  },
}

module.exports = nextConfig
