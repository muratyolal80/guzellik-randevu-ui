/**
 * JSON-LD structured data bileşenleri.
 * Schema.org standartlarına göre Google'ın salonu zengin sonuç olarak göstermesi için.
 */
import type { SalonDetail, Review } from '@/types';

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
    />
  );
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kuaforara.com.tr';

/**
 * Tüm sayfaların altında: Organization şeması.
 */
export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: 'Güzellik Randevu',
  url: siteUrl,
  logo: `${siteUrl}/icon-512.png`,
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'destek@kuaforara.com.tr',
    availableLanguage: 'Turkish',
  },
});

export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  url: siteUrl,
  name: 'Güzellik Randevu',
  inLanguage: 'tr-TR',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
});

/**
 * Salon detay sayfası: BeautySalon (LocalBusiness alt-tipi).
 */
export const beautySalonSchema = (salon: SalonDetail, reviews: Review[] = []) => {
  const aggregateRating =
    reviews.length > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue: Number(salon.average_rating || salon.rating || 0).toFixed(1),
          reviewCount: reviews.length,
          bestRating: '5',
          worstRating: '1',
        }
      : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'BeautySalon',
    '@id': `${siteUrl}/salon/${salon.id}`,
    name: salon.name,
    description: salon.description || `${salon.name} - güzellik ve bakım hizmetleri`,
    image: salon.image || `${siteUrl}/placeholder-salon.jpg`,
    url: `${siteUrl}/salon/${salon.id}`,
    telephone: (salon as any).phone || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: salon.district_name,
      addressRegion: salon.city_name,
      streetAddress: [salon.neighborhood, salon.avenue, salon.street, salon.building_no]
        .filter(Boolean)
        .join(' '),
      addressCountry: 'TR',
    },
    geo:
      salon.geo_latitude && salon.geo_longitude
        ? {
            '@type': 'GeoCoordinates',
            latitude: salon.geo_latitude,
            longitude: salon.geo_longitude,
          }
        : undefined,
    aggregateRating,
    priceRange: '₺₺',
  };
};

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
  })),
});
