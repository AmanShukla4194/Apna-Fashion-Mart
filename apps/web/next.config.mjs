/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'places.googleapis.com' },
    ],
  },
  // Moved from experimental.serverComponentsExternalPackages (deprecated)
  serverExternalPackages: ['pg'],
};

export default nextConfig;
