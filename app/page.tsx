import { Metadata } from 'next';
import HomeClient from './HomeClient';
import { SalonGridSkeleton } from '@/components/common/PageSkeletons';
import { Suspense } from 'react';
import { JsonLd, organizationSchema, websiteSchema } from '@/components/seo/JsonLd';
import { buildPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildPageMetadata({
    title: 'Türkiye\'nin En İyi Salonları',
    description: 'En yakın kuaför, berber ve güzellik merkezlerini keşfedin. Ücretsiz randevu alın.',
    keywords: ['randevu', 'güzellik salonu', 'kuaför', 'berber', 'kişisel bakım'],
    path: '/',
});

export default function HomePage() {
    return (
        <>
            <JsonLd data={organizationSchema()} />
            <JsonLd data={websiteSchema()} />
            <Suspense fallback={<div className="min-h-screen bg-background"><SalonGridSkeleton /></div>}>
                <HomeClient />
            </Suspense>
        </>
    );
}
