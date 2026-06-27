<<<<<<< HEAD
import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { CookieBanner } from '@/components/CookieBanner';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kuaforara.com.tr';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Güzellik Randevu — Salon, Kuaför ve Berber Rezervasyonu',
    template: '%s | Güzellik Randevu',
  },
  description: "Türkiye'nin en kapsamlı kişisel bakım ve güzellik platformu. Online randevu al, uzmanları karşılaştır, kampanyaları kaçırma.",
  applicationName: 'Güzellik Randevu',
  keywords: ['güzellik', 'salon', 'randevu', 'kuaför', 'berber', 'bakım', 'spa', 'tırnak'],
  authors: [{ name: 'Güzellik Randevu' }],
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Güzellik Randevu',
    title: 'Güzellik Randevu',
    description: "Türkiye'nin en kapsamlı kişisel bakım ve güzellik platformu",
    url: siteUrl,
  },
  twitter: { card: 'summary_large_image', title: 'Güzellik Randevu' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#C59F59',
  width: 'device-width',
  initialScale: 1,
=======
import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Güzellik Randevu',
  description: "Türkiye'nin en kapsamlı kişisel bakım ve güzellik platformu",
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Material Icons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        {/* Leaflet CSS */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
          integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
          crossOrigin=""
        />
      </head>
      <body className="bg-background text-text-main" suppressHydrationWarning>
<<<<<<< HEAD
        <Providers>{children}</Providers>
        <CookieBanner />
=======

        <Providers>{children}</Providers>
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
      </body>
    </html>
  );
}

