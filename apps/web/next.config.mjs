/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: 'horizons-cdn.hostinger.com' },
    ],
  },
  trailingSlash: true,
  transpilePackages: [],
};

export default nextConfig;
