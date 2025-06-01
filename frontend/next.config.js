/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [], // Add any image domains you need here
  },
  // Enable static optimization where possible
  poweredByHeader: false,
  // Add any other necessary configurations here
};

module.exports = nextConfig; 