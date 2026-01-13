/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
      domains: ['www.worldofbooks.com', 'worldofbooks.com'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**.worldofbooks.com',
        },
        {
          protocol: 'https',
          hostname: 'images-na.ssl-images-amazon.com',
        },
      ],
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/:path*`,
        },
      ];
    },
  };
  
  module.exports = nextConfig;
