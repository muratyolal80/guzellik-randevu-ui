'use client';

import React, { useEffect, useState } from 'react';
import StatCardEnhanced from '@/components/dashboard/StatCardEnhanced';
import CountdownBanner from '@/components/dashboard/CountdownBanner';
import QuickActions from '@/components/dashboard/QuickActions';
import LoyaltyWidget from '@/components/dashboard/LoyaltyWidget';
import PendingReviewsBanner from '@/components/dashboard/PendingReviewsBanner';
import YearlyStats from '@/components/dashboard/YearlyStats';
import PaymentHistory from '@/components/dashboard/PaymentHistory';
import Link from 'next/link';
import { Calendar, CreditCard, Star, Building2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DashboardService } from '@/services/db';
import type { SalonDetail } from '@/types';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>({
        upcomingCount: 0,
        monthlySpending: 0,
        lastMonthSpending: 0,
        spendingTrend: 0,
        reviewCount: 0,
        yearlyAppointmentCount: 0,
        yearlySpending: 0,
        uniqueSalonsThisYear: 0,
        pendingReviewCount: 0,
        pendingReviews: [],
        topLoyalty: null,
        recentPayments: [],
        nextAppointment: null,
    });
    const [recommendations, setRecommendations] = useState<SalonDetail[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        async function fetchData() {
            setLoading(true);
            try {
                if (!user?.id) return;
                const [dashData, recommendedData] = await Promise.all([
                    DashboardService.getDashboardData(user.id),
                    DashboardService.getRecommendedSalons(3),
                ]);
                setData(dashData);
                setRecommendations(recommendedData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Hoşgeldin, {user?.first_name || 'Misafir'}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Hesap özetin ve yaklaşan randevuların.</p>
                </div>
            </div>

            {/* Hero: Geri Sayım Banner (varsa) */}
            {data.nextAppointment && (
                <CountdownBanner appointment={data.nextAppointment} />
            )}

            {/* Quick Actions */}
            <QuickActions lastSalonId={data.topLoyalty?.salon?.id} />

            {/* Bekleyen Değerlendirme Banner (varsa) */}
            <PendingReviewsBanner count={data.pendingReviewCount} pending={data.pendingReviews} />

            {/* Stats Grid — 4 kart */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCardEnhanced
                    label="Yaklaşan Randevu"
                    value={`${data.upcomingCount}`}
                    icon={Calendar}
                    color="amber"
                    href="/customer/appointments?tab=upcoming"
                    badge={data.upcomingCount > 0 ? 'Aktif' : undefined}
                />
                <StatCardEnhanced
                    label="Bu Ay Harcama"
                    value={`${data.monthlySpending}₺`}
                    icon={CreditCard}
                    color="green"
                    trend={data.spendingTrend}
                    trendLabel="₺ geçen aya göre"
                    href="/customer/payments"
                />
                <StatCardEnhanced
                    label="Değerlendirmelerim"
                    value={data.reviewCount}
                    icon={Star}
                    color="purple"
                    href="/customer/reviews"
                />
                <StatCardEnhanced
                    label="Bu Yıl Toplam"
                    value={`${data.yearlyAppointmentCount} ziyaret`}
                    icon={Building2}
                    color="indigo"
                    href="/customer/appointments"
                />
            </div>

            {/* Yıllık Wrapped (sadece veri varsa) */}
            <YearlyStats
                appointmentCount={data.yearlyAppointmentCount}
                uniqueSalons={data.uniqueSalonsThisYear}
                yearlySpending={data.yearlySpending}
                reviewCount={data.reviewCount}
            />

            {/* 2 Sütun: Sadakat + Son Ödemeler */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LoyaltyWidget topLoyalty={data.topLoyalty} />
                <PaymentHistory payments={data.recentPayments} />
            </div>

            {/* Sana Özel Öneriler */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Sana Özel Öneriler</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendations.length > 0 ? recommendations.map((salon) => (
                        <Link
                            href={`/salon/${salon.id}`}
                            key={salon.id}
                            className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                        >
                            <div className="h-40 bg-gray-100 relative">
                                <img
                                    src={salon.image || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=400'}
                                    alt={salon.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <span className="absolute top-2 right-2 bg-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm flex items-center">
                                    <Star className="w-3 h-3 text-amber-500 mr-1" fill="currentColor" />{' '}
                                    {salon.average_rating || salon.rating || 0}
                                </span>
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-gray-900">{salon.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                    {salon.district_name}, {salon.city_name}
                                </p>
                            </div>
                        </Link>
                    )) : (
                        [1, 2, 3].map((i) => (
                            <div key={i} className="h-56 bg-gray-50 animate-pulse rounded-xl border border-gray-100"></div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
