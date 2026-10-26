/** @type {import('next').NextConfig} */

// next/image only optimizes known hosts (an open `**` pattern turns /_next/image into a
// public image proxy). Extra hosts: NEXT_PUBLIC_IMAGE_HOSTS="cdn.example.com,other.com"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
const imageHosts = [
  'images.unsplash.com',
  'i.pravatar.cc',
  'lh3.googleusercontent.com',
  '**.kuaforara.com.tr',
  '**.salonara.com.tr',
  ...(process.env.NEXT_PUBLIC_IMAGE_HOSTS || '').split(',').map((h) => h.trim()).filter(Boolean),
];

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // only framing restriction — a full CSP needs an audit of maps/PayTR/Turnstile/Supabase origins
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(self)' },
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
    : []),
];

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      ...imageHosts.map((hostname) => ({ protocol: 'https', hostname })),
      ...(supabaseUrl
        ? [{ protocol: supabaseUrl.protocol.replace(':', ''), hostname: supabaseUrl.hostname, port: supabaseUrl.port }]
        : []),
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  experimental: {
    // Enable the new proxy configuration for Next.js 16
    authInterrupts: true,
  },
  serverExternalPackages: ['iyzipay'],
};

export default nextConfig;
