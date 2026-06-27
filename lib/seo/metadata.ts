import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://kuaforara.com.tr';
const SITE_NAME = 'Güzellik Randevu';
const DEFAULT_OG_IMAGE = '/og-default.jpg';

export interface PageMetaInput {
  title: string;
  description: string;
  path?: string;            // /salon/123
  image?: string;
  keywords?: string[];
  noindex?: boolean;
  type?: 'website' | 'article';
}

/**
 * Standardize edilmiş Next.js Metadata builder.
 * Her sayfanın `metadata` veya `generateMetadata` export'unda kullanılmalı.
 */
export function buildPageMetadata(input: PageMetaInput): Metadata {
  const url = input.path ? `${SITE_URL}${input.path}` : SITE_URL;
  const image = input.image || DEFAULT_OG_IMAGE;

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    robots: input.noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: SITE_NAME,
      type: input.type || 'website',
      locale: 'tr_TR',
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}
