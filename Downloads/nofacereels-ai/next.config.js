/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'replicate.delivery' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '50mb' },
  },
};

module.exports = nextConfig;
