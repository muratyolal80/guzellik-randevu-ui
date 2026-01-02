/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Keep it simple during migration; we can tighten later.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  experimental: {
    // Enable the new proxy configuration for Next.js 16
    authInterrupts: true,
  },
};

export default nextConfig;
