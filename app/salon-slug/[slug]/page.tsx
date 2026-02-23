'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SalonDataService } from '@/services/db';
import { SalonDetail } from '@/types';
import { SalonDetailContent } from '@/components/salon/SalonDetailContent';

export default function SalonBySlugPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [salonId, setSalonId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getSalon() {
            try {
                const salon = await SalonDataService.getSalonBySlug(slug);
                if (salon) {
                    setSalonId(salon.id);
                }
            } catch (error) {
                console.error('Error fetching salon by slug:', error);
            } finally {
                setLoading(false);
            }
        }
        if (slug) getSalon();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!salonId) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center text-white bg-gray-900">
            <h1 className="text-4xl font-black mb-4">Üzgünüz, Salon Bulunamadı</h1>
            <p className="text-gray-400">Şık bir randevu için doğru adreste olduğunuza emin olun.</p>
        </div>
    );

    return <SalonDetailContent salonId={salonId} />;
}
