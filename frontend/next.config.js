/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5500',
        pathname: '/uploads/**',
      },
    ],
  },
  // Enable static optimization where possible
  poweredByHeader: false,
  // Add any other necessary configurations here
};

module.exports = nextConfig; 