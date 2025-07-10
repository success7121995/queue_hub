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
    ],
    // Disable image optimization for problematic images
    unoptimized: false,
    // Add better error handling
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable static optimization where possible
  poweredByHeader: false,
  // Add any other necessary configurations here
};

module.exports = nextConfig; 