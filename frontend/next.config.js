/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'queue-hub.onrender.com',
    //     port: '',
    //     pathname: '/uploads/**',
    //   },
    //   {
    //     protocol: 'http',
    //     hostname: 'localhost',
    //     port: '3000',
    //     pathname: '/public/**',
    //   },
    // ],
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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