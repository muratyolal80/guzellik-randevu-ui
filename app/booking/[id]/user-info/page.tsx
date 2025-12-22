'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/Layout';

export default function BookingUserInfoPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <Layout>
      <div className="flex-1 flex justify-center py-8 px-4 md:px-10 lg:px-20 bg-background min-h-screen">
        <div className="w-full max-w-[900px]">
          <div className="bg-white rounded-xl border border-border p-6 lg:p-8 shadow-card">
            <h1 className="text-text-main text-2xl font-bold">Bilgilerinizi Girin</h1>
            <p className="text-text-secondary mt-1">
              Bu sayfa daha sonra randevu akışında kullanılmak üzere ayrılmıştır.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/booking/${id}/time`}
                className="px-6 py-3 bg-gray-100 text-text-main rounded-lg font-bold hover:bg-gray-200 transition-colors text-center"
              >
                Geri Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

