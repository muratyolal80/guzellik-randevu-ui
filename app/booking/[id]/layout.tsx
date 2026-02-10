'use client';

import React from 'react';
import { BookingProvider } from '@/context/BookingContext';
import { useParams } from 'next/navigation';

export default function BookingLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const salonId = params.id as string;

    return (
        <BookingProvider salonId={salonId}>
            {children}
        </BookingProvider>
    );
}
