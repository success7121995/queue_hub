/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_BACKEND_HOSTNAME || 'localhost',
        port: process.env.NEXT_PUBLIC_BACKEND_PORT || '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5500',
        pathname: '/uploads/**',
      },
    ],
    // Disable image optimization to prevent errors
    unoptimized: true,
    // Add better error handling
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Add fallback for failed images
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
  },
  // Enable static optimization where possible
  poweredByHeader: false,
  // Add experimental features for better error handling
  experimental: {
    optimizeCss: true,
  },
  // Add any other necessary configurations here
};

module.exports = nextConfig; 