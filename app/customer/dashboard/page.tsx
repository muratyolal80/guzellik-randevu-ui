'use client';

import React, { useEffect, useState } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import Link from 'next/link';
import { Calendar, CreditCard, Star, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DashboardService } from '@/services/db';
import type { SalonDetail } from '@/types';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth(); // Retrieve user from context
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        upcomingCount: 0,
        totalSpent: 0,
        reviewCount: 0
    });
    const [nextAppointment, setNextAppointment] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<SalonDetail[]>([]);
    const router = useRouter();

    useEffect(() => {
        // If auth is still loading, wait
        if (authLoading) return;

        // If no user after auth load, redirect
        if (!user) {
            router.push('/login');
            return;
        }

        async function fetchData() {
            setLoading(true);
            try {
                if (!user?.id) return;

                // Fetch data using centralized service
                const [dashData, recommendedData] = await Promise.all([
                    DashboardService.getDashboardData(user.id),
                    DashboardService.getRecommendedSalons(3)
                ]);

                setStats(dashData.stats);
                setNextAppointment(dashData.nextAppointment);
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
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Hoşgeldin, {user?.first_name || 'Misafir'}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Hesap özetin ve yaklaşan randevuların.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Yaklaşan Randevu"
                    value={`${stats.upcomingCount} Adet`}
                    icon={Calendar}
                    color="amber"
                    action={stats.upcomingCount > 0 && <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Aktif</span>}
                />
                <StatCard
                    label="Bu Ay Harcama"
                    value={`${stats.totalSpent} ₺`}
                    icon={CreditCard}
                    color="green"
                />
                <StatCard
                    label="Değerlendirmelerim"
                    value={stats.reviewCount}
                    icon={Star}
                    color="purple"
                />
            </div>

            {/* Next Appointment Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Sıradaki Randevun</h2>
                    <Link href="/customer/appointments" className="text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center">
                        Tümünü Gör <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                </div>

                {nextAppointment ? (
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-full md:w-24 h-24 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                            <img
                                src={nextAppointment.salon?.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=200"}
                                alt="Salon"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">{nextAppointment.salon?.name}</h3>
                            <div className="flex items-center text-gray-500 text-sm mt-1 gap-4">
                                <span className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {nextAppointment.salon?.district?.name}, {nextAppointment.salon?.city?.name}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                <span className="flex items-center text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-lg text-sm">
                                    <Calendar className="w-4 h-4 mr-1.5" />
                                    {new Date(nextAppointment.start_time).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="flex items-center text-gray-600 bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm">
                                    ✂️ {nextAppointment.service?.global_service?.name || 'Hizmet'}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium shadow-sm shadow-green-200 w-full md:w-auto">
                                Detaylar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center gap-4">
                        <div className="bg-white p-3 rounded-full shadow-sm">
                            <Calendar className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium">Yaklaşan randevunuz bulunmamaktadır.</p>
                            <p className="text-gray-400 text-sm mt-1">Kendinize bir iyilik yapın ve hemen randevu alın.</p>
                        </div>
                        <Link
                            href="/"
                            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium shadow-sm shadow-amber-200 transition-all flex items-center gap-2"
                        >
                            Hemen Randevu Al
                        </Link>
                    </div>
                )}
            </div>

            {/* Recommendations or other content */}
            <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">Sana Özel Öneriler</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendations.length > 0 ? recommendations.map((salon) => (
                        <Link href={`/salon/${salon.id}`} key={salon.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                            <div className="h-40 bg-gray-100 relative">
                                <img src={salon.image || "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=400"} alt={salon.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <span className="absolute top-2 right-2 bg-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm flex items-center">
                                    <Star className="w-3 h-3 text-amber-500 mr-1" fill="currentColor" /> {salon.average_rating || salon.rating || 0}
                                </span>
                            </div>
                            <div className="p-4">
                                <h4 className="font-bold text-gray-900">{salon.name}</h4>
                                <p className="text-xs text-gray-500 mt-1">{salon.district_name}, {salon.city_name}</p>
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
