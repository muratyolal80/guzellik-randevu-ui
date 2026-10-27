'use client';

import React from 'react';
import Skeleton from '@/components/Skeleton';

// Content-shaped loading placeholders for public / booking pages.

export function SalonGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10" aria-busy="true" aria-label="Yükleniyor">
            <Skeleton className="h-10 w-2/3 max-w-md mb-4" />
            <Skeleton className="h-14 w-full rounded-2xl mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-border overflow-hidden">
                        <Skeleton className="h-48 w-full rounded-none" />
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-5 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SalonDetailSkeleton() {
    return (
        <div className="bg-background min-h-screen" aria-busy="true" aria-label="Yükleniyor">
            <Skeleton className="h-[480px] w-full rounded-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[32px] p-8 md:p-10 border border-border shadow-card mb-8">
                            <Skeleton className="h-10 w-2/3 mb-4" />
                            <div className="flex flex-wrap gap-4 mb-6"><Skeleton className="h-6 w-32" /><Skeleton className="h-6 w-48" /></div>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="bg-white p-6 rounded-2xl border border-border"><Skeleton className="h-20 w-full" /></div>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function BookingStepSkeleton() {
    return (
        <div className="max-w-[1440px] mx-auto w-full px-4 md:px-10 py-8 bg-background min-h-screen" aria-busy="true" aria-label="Yükleniyor">
            <div className="flex gap-2 mb-6">
                <Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-9 w-72 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white rounded-xl border border-border p-6 space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-1/3" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-4 bg-white rounded-xl border border-border p-6 space-y-3">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-12 w-full mt-4" />
                </div>
            </div>
        </div>
    );
}

export function AuthCardSkeleton() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4" aria-busy="true" aria-label="Yükleniyor">
            <div className="w-full max-w-md bg-white rounded-2xl border border-border p-8 space-y-4">
                <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                <Skeleton className="h-7 w-2/3 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto mb-4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
    );
}

export function CardListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4" aria-busy="true" aria-label="Yükleniyor">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-6 space-y-3">
                    <Skeleton className="h-6 w-1/3" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-1/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}
