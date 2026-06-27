import { Metadata } from 'next';
import HomeClient from './HomeClient';
import { Suspense } from 'react';
<<<<<<< HEAD
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
            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-text-muted text-lg">Yükleniyor...</p>
                    </div>
                </div>
            }>
                <HomeClient />
            </Suspense>
        </>
=======

export const metadata: Metadata = {
    title: 'Güzellik Randevu | Türkiye\'nin En İyi Salonları',
    description: 'En yakın kuaför, berber ve güzellik merkezlerini keşfedin. Ücretsiz randevu alın.',
    keywords: 'randevu, güzellik salonu, kuaför, berber, kişisel bakım'
};

export default function HomePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-muted text-lg">Yükleniyor...</p>
                </div>
            </div>
        }>
            <HomeClient />
        </Suspense>
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
    );
}
