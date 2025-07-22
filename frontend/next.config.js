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
  // Webpack configuration to handle cache issues
  webpack: (config, { dev, isServer }) => {
    // Disable webpack cache in development to avoid cache corruption issues
    if (dev) {
      config.cache = false;
    }
    
    // Add better error handling for cache operations
    config.infrastructureLogging = {
      level: 'error',
    };
    
    return config;
  },
  // Add any other necessary configurations here
};

module.exports = nextConfig; 