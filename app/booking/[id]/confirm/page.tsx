'use client';

import React from 'react';
import { Layout } from '../../../../components/Layout';
import { BookingSummary } from '../../../../components/BookingSummary';
import { MOCK_SALONS, MOCK_STAFF, MOCK_SERVICES } from '../../../../constants';
import { useParams } from 'next/navigation';

export default function Confirmation() {
    const params = useParams();
    const id = params.id as string;
    const salon = MOCK_SALONS.find(s => s.id === id) || MOCK_SALONS[0];
    const staff = MOCK_STAFF[0];
    const services = [MOCK_SERVICES[0], MOCK_SERVICES[1]];
    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = '1 saat 30 dakika';

    return (
        <Layout>
            <div className="flex-1 flex justify-center py-8 px-4 md:px-10 lg:px-20 bg-background min-h-screen">
                <div className="w-full max-w-[1280px] flex flex-col gap-8">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <div className="w-full lg:w-[380px] flex-shrink-0 lg:sticky lg:top-24 order-2 lg:order-1">
                            <BookingSummary
                                salon={salon}
                                staff={staff}
                                services={services}
                                totalPrice={totalPrice}
                                totalDuration={totalDuration}
                                step={3}
                            />
                        </div>
                        <main className="flex-1 w-full min-w-0 order-1 lg:order-2">
                            <div className="bg-white rounded-xl border border-border p-6 lg:p-8 shadow-card text-center">
                                <span className="material-symbols-outlined text-6xl text-green-500">check_circle</span>
                                <h1 className="text-3xl font-bold text-text-main mt-4">Randevunuz Onaylandı!</h1>
                                <p className="text-text-secondary mt-2">Randevu detaylarınız aşağıdadır. E-posta ve SMS ile de bilgilendirme yapılmıştır.</p>
                                <div className="mt-8 text-left bg-gray-50 p-6 rounded-lg border border-border">
                                    <p><strong>Salon:</strong> {salon.name}</p>
                                    <p><strong>Personel:</strong> {staff.name}</p>
                                    <p><strong>Tarih:</strong> 28 Ekim 2024, 14:30</p>
                                    <p><strong>Hizmetler:</strong> {services.map(s => s.name).join(', ')}</p>
                                    <p><strong>Toplam Tutar:</strong> {totalPrice} TL</p>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

